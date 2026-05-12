import React, { useEffect, useState, useMemo } from "react";
import { Provider } from "react-redux";
import {
  StatusBar,
  View,
  LogBox,
  Platform,
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
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
// Firebase geçici olarak devre dışı
// import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import Reconnect from "./src/components/Reconnect";
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

  // useEffect(() => {
  //   const user = store.getState().auth?.user;

  //   if (user) {
  //     store.dispatch(loginToRememberedBrokerage() as any);

  //   }
  // }, [store.getState().auth]);

  useEffect(() => {
    const loadAppResources = async () => {
      try {
        // LogBox.ignoreLogs(["Warning: ..."]);
        // LogBox.ignoreAllLogs();

        await Font.loadAsync({
          NunitoSansRegular: require("./assets/fonts/NunitoSans-Light.ttf"),
          NunitoSansBold: require("./assets/fonts/NunitoSans-Bold.ttf"),
        });


        setFontLoaded(true);
      } catch (error) {
        console.error("Error loading app resources:", error);
      }
      finally {
        // Ensure the app doesn't hang on a black screen if font loading fails.
        setFontLoaded((prev) => prev || true);
      }
    };
   //Açılacak alanlar => // const registerForPushNotifications = async () => {
    //   try {
    //     await checkTokenAvailability();
    //   } catch (e) { }
    // };
    loadAppResources();
    // Açulacak alanlar => registerForPushNotifications();
  }, []);

//   useEffect(() => { Açılacak alanlar =>
//     // Gelen bildirimleri dinleyin (uygulama açıkken)
//     const unsubscribeOnMessage = messaging().onMessage(
//       async (remoteMessage) => {
//         handleNotification(remoteMessage.data);
//         // Alert.alert("Yeni Bildirim", JSON.stringify(remoteMessage.notification));
//       }
//     );
//     // App kapalıyken veya arka plandayken gelen bildirimleri dinleyin
//     const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(
//       (remoteMessage) => {
//         handleNotification(remoteMessage.data);
//       }
//     );
//     // App tamamen kapalıyken gelen bildirimi dinleyin
//     /*  messaging()
//        .getInitialNotification()
//        .then((remoteMessage) => {
//          if (remoteMessage) {
//            console.log("3 => ", remoteMessage);
//            handleNotification(remoteMessage.data);
//          }
//        }); */
//     // Cleanup
//     return () => {
//       unsubscribeOnMessage();
//       // unsubscribeOnNotificationOpened();
//     };
//   }, []);

//   Açılacak alanlar => const handleNotification = (
//     notification: FirebaseMessagingTypes.Notification | undefined
//   ) => {
//     store.dispatch(updateLastNotification(notification));
//   };

//   Açılacak alanlar => const checkTokenAvailability = async () => {
//     let token;
//     if (Platform.OS === "android" && Platform.Version > 32) {
//       PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//       );
//     }
//     try {
//       const authStatus = await messaging().requestPermission();
//       console.log("authStatus =>=>=>=>=>=>=>=>== ", authStatus);

//       const enabled =
//         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//         authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//       console.log("enabled =>=>=>=>=>=>=>=>== ", enabled);

//       if (enabled) {
//         console.log("adadSAD211212== ", enabled);

//         token = await messaging().getToken();
//         console.log("token =>=>=>=>=>=>=>=>== ", token);

//         if (token) {

//           // Token'ı store'a kaydet veya gereken işlemi yap
//           if (store.getState().pushNotifications?.token !== token) {
//             store.dispatch(updateToken({ data: token }));
//           }
//         } else {

//           if (store.getState().pushNotifications?.token !== token) {
//             store.dispatch(updateToken({ data: token }));
//           }
//         }
//       }
//     } catch (error) {
//       console.log("adadSAD hattaaaaaa== ", token);

//       if (store.getState().pushNotifications?.token !== token) {
//         store.dispatch(updateToken({ data: token }));
//       }
//     }
//   };

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
              </PaperProvider>
            </PersistGate>
          </Provider>
        </ActionSheetProvider>
      </View>
    </SafeAreaProvider>
  );
}

export default App;
