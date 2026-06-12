import React, { useEffect, useState, useMemo } from "react";
import { Provider } from "react-redux";
import {
  StatusBar,
  View,
  LogBox,
  Platform,
  PermissionsAndroid,
} from "react-native";
import RootNavigation from "./src/routes/AppNavigator";
import store, { persistor } from "./src/store";
import * as Font from "expo-font";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { enableScreens } from "react-native-screens";
import { PersistGate } from "redux-persist/integration/react";
import FlashMessage from "react-native-flash-message";
import * as numeral from "numeral";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { handleNavigationStateChange } from "./src/modules/analytics";
import Constants from "expo-constants";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import messaging from "@react-native-firebase/messaging";
import { updateToken } from "./src/modules/pushNotifications";
import Reconnect from "./src/components/Reconnect";
import PushNotificationRedirector from "./src/screens/Markets/components/PushNotificationRedirector";
import { initAds } from "./src/modules/ads/init";
//import { loginToRememberedBrokerage } from "./src/screens/Portfolio/modules/accounts/autoLogin";
import { useTheme } from "./src/theme/ThemeContext";
import { activateKeepAwakeAsync } from "expo-keep-awake";
import ThemeProvider from "./src/theme/ThemeProvider";

enableScreens(true);

try {
  if (!numeral.locales || !numeral.locales["tr"]) {
    numeral.register("locale", "tr", {
      delimiters: {
        thousands: ".",
        decimal: ",",
      },
      abbreviations: {
        thousand: "b",
        million: "ml",
        billion: "mr",
        trillion: "tr",
      },
      currency: {
        symbol: "₺",
      },
      ordinal: (number) => "",
    });
  }
} catch (error) {
  console.error("Locale registration failed:", error);
}
numeral.locale("tr");

const App = () => {
  const { theme } = useTheme();
  // useKeepAwake();
  // Paper teması: theme.darkerBrand değiştikçe yeniden hesapla, aksi halde stabil ref.
  const paperTheme = useMemo(
    () => ({
      ...DefaultTheme,
      roundness: 2,
      colors: {
        ...DefaultTheme.colors,
        background: theme.darkerBrand,
      },
    }),
    [theme.darkerBrand]
  );


  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Keep screen awake only after native modules are ready
    activateKeepAwakeAsync().catch((error) => {
      console.error("activateKeepAwakeAsync failed:", error);
    });
  }, []);

  // Capra Analytics SDK initialize — BI tarafı iOS/Android için aynı siteId
  // kullanmamızı istedi (cihaz kimliği zaten ayrı geldiği için platform
  // ayrımı gerekmiyor). Değer boşsa configure atlanır (no-op).
  // Native modül henüz prebuild edilmemişse import sırasında throw olur,
  // catch ile sessizce yutarız → JS tarafı çalışmaya devam eder.
  useEffect(() => {
    const extra = (Constants.expoConfig?.extra ?? {}) as {
      capraSiteId?: string;
      capraEndpoint?: string;
    };
    const { capraSiteId: siteId, capraEndpoint: endpoint } = extra;
    if (!siteId || !endpoint) {
      if (__DEV__) console.log("[Capra] siteId/endpoint boş — configure atlandı");
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const CapraAnalytics = require("./modules/capra-analytics").default;
      CapraAnalytics.configure(siteId, endpoint);
    } catch (e) {
      console.warn("[Capra] configure failed:", (e as Error)?.message);
    }
  }, []);

  // useEffect(() => {
  //   const user = store.getState().auth?.user;

  //   if (user) {
  //     store.dispatch(loginToRememberedBrokerage() as any);

  //   }
  // }, [store.getState().auth]);

  useEffect(() => {
    const loadAppResources = async () => {
      try {
        await Font.loadAsync({
          NunitoSansRegular: require("./assets/fonts/NunitoSans-Light.ttf"),
          NunitoSansBold: require("./assets/fonts/NunitoSans-Bold.ttf"),
        });

        setFontLoaded(true);
      } catch (error) {
        console.error("Error loading app resources:", error);
      } finally {
        // Font yuklenmese bile siyah ekranda asili kalmasin
        setFontLoaded((prev) => prev || true);
      }
    };

    const registerForPushNotifications = async () => {
      try {
        await checkTokenAvailability();
      } catch (e) {
        console.warn("[PUSH-DEBUG] registerForPushNotifications hatasi:", e);
      }
    };

    // Sıra: ATT (iOS) → UMP consent → MobileAds.initialize() → FCM permission.
    // FCM'i ATT'den sonra çağırıyoruz ki IDFA atandıktan sonra token alınsın.
    const bootstrap = async () => {
      await initAds();
      registerForPushNotifications();
    };

    loadAppResources();
    bootstrap();
  }, []);

  // FCM izin + token alma: BaseApp icinde tek noktada
  const checkTokenAvailability = async () => {
    let token: string | undefined;
    if (Platform.OS === "android" && Platform.Version > 32) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
    }
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        token = await messaging().getToken();
        console.log("[PUSH-DEBUG] FCM token alindi:", token);
        if (token && store.getState().pushNotifications?.token?.data !== token) {
          store.dispatch(updateToken({ data: token }));
        }
      } else {
        console.log("[PUSH-DEBUG] Bildirim izni reddedildi, status:", authStatus);
      }
    } catch (error: any) {
      console.warn(
        "[PUSH-DEBUG] checkTokenAvailability hatasi:",
        error?.toString?.() || error
      );
    }
  };

  // FlashMessage konumu: iOS'te "top" string, Android'de pozisyon objesi.
  // Inline tutmamak için memoize ediyoruz.
  const flashPosition = useMemo<any>(
    () =>
      Platform.OS === "ios"
        ? "top"
        : {
            top: StatusBar.currentHeight,
            left: 0,
            right: 0,
          },
    []
  );

  const flashFloating = useMemo(() => Platform.OS !== "ios", []);

  const rootViewStyle = useMemo(
    () => ({ height: "100%" as const, backgroundColor: theme.darkerBrand }),
    [theme.darkerBrand]
  );

  if (!fontLoaded) {
    return null;
  }
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <FlashMessage position={flashPosition} floating={flashFloating} />
      <View style={rootViewStyle}>
        <ActionSheetProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <PaperProvider theme={paperTheme}>
                <ThemeProvider>
                  <RootNavigation
                    onNavigationStateChange={handleNavigationStateChange}
                  />
                </ThemeProvider>

                <Reconnect />
                <PushNotificationRedirector />
              </PaperProvider>
            </PersistGate>
          </Provider>
        </ActionSheetProvider>
      </View>
    </SafeAreaProvider>
  );
}

export default App;
