import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Platform, StatusBar, View, StyleSheet, InteractionManager, Image } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import LottieView from "lottie-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeContext";
import TabRootNavigator from "./TabNavigator";
import ThemeChange from "../components/ThemeChange";
import { createStackOptions } from "./common";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, ws } from "../modules/IdealClient";
import { transitionOverlayRef } from "../modules/transitionOverlay";
import Welcome from "../screens/Auth/Welcome/Welcome";
import AccountLogin from "../screens/Account/components/Account";
import AuthRegister from "../screens/Account/components/Register";
import OtpVerify from "../screens/Auth/components/OtpVerify";
import SetPassword from "../screens/Auth/components/SetPassword";
import CompleteProfile from "../screens/Auth/components/CompleteProfile";
import LoginPassword from "../screens/Auth/components/LoginPassword";
import store from "../store";
import { syncWatchlists } from "../modules/FintablesClient";
import { logout as logoutAuth } from "../screens/Auth/modules/auth";
//import DetailTradingView from "../screens/DetailTradingView";
import BottomSheetProvider from "../containers/BottomSheet/BottomSheetProvider";
import { persistToken } from "../modules/pushNotifications";
import SMSGGO from "../screens/Auth/Login/SMSGGO";
import CalendarContainer from "../screens/Calendar/containers/CalendarContainer";
import DividendCalendar from "../screens/DividendCalendar";

const AuthHeaderLogo = () => (
  <Image
    source={require("../../assets/bigpara/headerLogo.png")}
    style={{ width: 130, height: 32 }}
    resizeMode="contain"
  />
);

const Stack = createNativeStackNavigator();
export const navigationRef = React.createRef();

// Ekran-bazlı minimum overlay süresi (ms). Ağır ekranlar daha uzun
// overlay'le örtülerek iç loading state'lerinin görünmesi engellenir.
const ROUTE_MIN_VISIBLE_MS: Record<string, number> = {
  Detail: 850,
  MarketsList: 600,
  Markets: 500,
  NewsDetail: 550,
  Calendar: 500,
  Alarms: 450,
  WatchListEditor: 450,
  WatchListEditorAdd: 450,
  Yatirimlarim: 500,
  ParamNeOlurdu: 450,
  KademeAnalizi: 600,
  SicaklikHaritasi: 700,
  PivotAnalizi: 600,
  MaliTablolar: 700,
  PerformansAnalizi: 700,
  ElliottAnalizi: 600,
  BinTLNeOldu: 450,
  DovizCeviricisi: 350,
  AltinHesaplayici: 350,
};
const DEFAULT_MIN_VISIBLE_MS = 320;
const FADE_OUT_MS = 220;

// Loader görsel varyantı. "logo" = statik bigpara logosu + altında sıralı pulse yapan 3 nokta,
// "lottie" = eski loading-dots animasyonu (yedek olarak korunuyor).
type LoaderVariant = "logo" | "lottie";
const LOADER_VARIANT: LoaderVariant = "logo";
const DOT_ACCENT = "#F07400";
const DOT_CYCLE_MS = 1100;
const DOT_STAGGER_MS = 180;

export default function RootNavigation({ onNavigationStateChange }) {
  const { theme } = useTheme();
  const previousRouteRef = useRef();
  const routeHistoryRef = useRef<string[]>([]);
  const dispatch = useDispatch();
  const [overlayActive, setOverlayActive] = useState(false);
  const overlayOpacity = useSharedValue(0);
  const dot1 = useSharedValue(0.25);
  const dot2 = useSharedValue(0.25);
  const dot3 = useSharedValue(0.25);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionHandleRef = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    if (LOADER_VARIANT !== "logo") return;
    const half = DOT_CYCLE_MS / 2;
    const easing = Easing.inOut(Easing.quad);
    const buildPulse = () =>
      withRepeat(
        withSequence(
          withTiming(1, { duration: half, easing }),
          withTiming(0.25, { duration: half, easing })
        ),
        -1,
        false
      );
    dot1.value = buildPulse();
    dot2.value = withDelay(DOT_STAGGER_MS, buildPulse());
    dot3.value = withDelay(DOT_STAGGER_MS * 2, buildPulse());
  }, [dot1, dot2, dot3]);

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value, transform: [{ scale: 0.6 + dot1.value * 0.4 }] }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value, transform: [{ scale: 0.6 + dot2.value * 0.4 }] }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value, transform: [{ scale: 0.6 + dot3.value * 0.4 }] }));
  // Get `isAuthenticated` status from Redux
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  // NOT: auth slice'ının tamamına subscribe olmak gereksiz re-render'a yol açıyordu.
  // Auth state'i imperatif olarak gerektiğinde store.getState() ile okuyoruz.

  const triggerTransitionOverlay = useCallback(
    (targetRouteName?: string) => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (interactionHandleRef.current) {
        interactionHandleRef.current.cancel();
        interactionHandleRef.current = null;
      }

      // Opacity'yi UI thread'de anlık 1'e at — JS commit beklemez,
      // hedef ekranın ilk render'ı kullanıcıya görünmez.
      overlayOpacity.value = 1;
      setOverlayActive(true);

      const minVisibleMs =
        ROUTE_MIN_VISIBLE_MS[targetRouteName ?? ""] ?? DEFAULT_MIN_VISIBLE_MS;
      const startedAt = Date.now();

      interactionHandleRef.current = InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const elapsed = Date.now() - startedAt;
            const remaining = Math.max(0, minVisibleMs - elapsed);
            hideTimeoutRef.current = setTimeout(() => {
              overlayOpacity.value = withTiming(
                0,
                { duration: FADE_OUT_MS },
                (finished) => {
                  if (finished) {
                    runOnJS(setOverlayActive)(false);
                  }
                }
              );
              hideTimeoutRef.current = null;
            }, remaining);
          });
        });
      });
    },
    [overlayOpacity]
  );

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (interactionHandleRef.current) interactionHandleRef.current.cancel();
    };
  }, []);

  // Global overlay imperatif API: ekranlar (örn. Welcome misafir butonu)
  // tap anında overlay'i hemen göstermek için transitionOverlayRef.current.show()
  // çağırabilir. Hide, mevcut fade-out süresini koruyarak overlay'i kapatır.
  useEffect(() => {
    transitionOverlayRef.current = {
      show: () => {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        if (interactionHandleRef.current) {
          interactionHandleRef.current.cancel();
          interactionHandleRef.current = null;
        }
        overlayOpacity.value = 1;
        setOverlayActive(true);
      },
      hide: () => {
        overlayOpacity.value = withTiming(
          0,
          { duration: FADE_OUT_MS },
          (finished) => {
            if (finished) {
              runOnJS(setOverlayActive)(false);
            }
          }
        );
      },
    };
    return () => {
      transitionOverlayRef.current = null;
    };
  }, [overlayOpacity]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  //console.log("lsdaodaodsaloaod>=>= ", store.getState().pageLastBrokerages);
  //console.log("lsdaodaodsaloaod1212121212>=>= ", store.getState().auth);
  const syncWatchlist = async () => {
    try {
      const state = store.getState();
      const lists = state.watchLists.lists;
      const user = state.auth.user;
      if (user && user?.username && lists) {
        await syncWatchlists({
          username: user?.username,
          data: lists,
        });
      }
    } catch (e) {
      console.error(e);
    }
    try {
      const username = store.getState().auth?.user?.username;
      console.log("[PUSH-DEBUG] AppNavigator.tsx => tokenUsername:", username);
      store.dispatch(persistToken({ clear: false, tokenUsername: username }));
    } catch (error: any) {
      console.error(
        "Appnavigator Token kaydedilirken hata oluştu:",
        error.toString()
      );
    }
  };

  const symbolArrayLength = async () => {
    // B-4 fix: Eğer IdealClient WebSocket zaten OPEN (=1) durumdaysa, login
    // çağrısı az önce LoginPassword/CompleteProfile/Welcome misafir akışından
    // başarıyla tamamlanmış demektir. Tekrar login etmek var olan bağlantıyı
    // kapatıp yeniden açar → çift WS bağlantısı + demo modu uyumsuzluğu.
    // Sadece cold start (ws yok veya kapalı) durumunda login() çağırılır.
    if (ws && ws.readyState === 1) {
      return;
    }

    let symbolLength = null;
    try {
      symbolLength = await AsyncStorage.getItem("@symbolDefinationlength");
    } catch (error) {
      console.log("AsyncStorage errorsemboldefination:", error);
    }
    console.log("symbolLength", symbolLength);

    if (store.getState().pageLastBrokerages?.page === "WatchListScreen") {
    }
    else {
      const auth = store.getState().auth;
      login(auth.user?.username, auth.user?.password, auth.demo, symbolLength || "0", "0");

    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      symbolArrayLength();
    } else {
      const auth = store.getState().auth;
      if (auth && auth.user && auth.user.username) {
        syncWatchlist();
        dispatch(logoutAuth());
        ws?.close();
      }
    }
  }, [isAuthenticated, dispatch]);

  const onStateChange = (state: { routes: { [x: string]: any; }; index: string | number; }) => {
    if (!state || !state.routes) return;

    let currentRoute = state.routes[state.index];
    while (currentRoute.state && currentRoute.state.routes) {
      currentRoute = currentRoute.state.routes[currentRoute.state.index];
    }

    const newRouteName = currentRoute.name;
    if (previousRouteRef.current && previousRouteRef.current !== newRouteName) {
      // Geri navigasyonda overlay tetiklenmesin: yeni route history'de varsa back demektir
      const backIndex = routeHistoryRef.current.indexOf(newRouteName);
      if (backIndex >= 0) {
        routeHistoryRef.current = routeHistoryRef.current.slice(0, backIndex);
      } else {
        routeHistoryRef.current.push(previousRouteRef.current as string);
        triggerTransitionOverlay(newRouteName);
      }
    }

    let screenValue = [{ prev: previousRouteRef.current, current: newRouteName }];
    previousRouteRef.current = newRouteName;

    onNavigationStateChange(screenValue);
  };

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: theme.darkerBrand,
        card: theme.darkestBrand,
      },
    }),
    [theme.darkerBrand, theme.darkestBrand]
  );

  const stackScreenOptions = useMemo(() => createStackOptions(theme), [theme]);

  return (
    <View style={[styles.root, { backgroundColor: theme.darkerBrand }]}>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={onStateChange}
        theme={navigationTheme}
        onReady={() => {
          // İlk mount'ta onStateChange çağrılmadığı için initial route'u
          // burada previousRouteRef'e yazıyoruz. Aksi halde geri navigation
          // history boş olduğu için "forward" gibi yorumlanıp overlay
          // yanlışlıkla tetikleniyordu.
          try {
            const r = (navigationRef.current as any)?.getCurrentRoute?.();
            if (r?.name) previousRouteRef.current = r.name;
          } catch {}
        }}
      >
        <BottomSheetProvider>
          <Stack.Navigator screenOptions={stackScreenOptions}>
            {isAuthenticated ? (
              <>
                <Stack.Screen
                  name="Main"
                  component={TabRootNavigator}
                  options={{ headerShown: false, animation: "none" }}
                />
                <Stack.Screen
                  name="ThemeChange"
                  component={ThemeChange}
                  options={{ headerShown: true }}
                />
                <Stack.Screen
                  name="Calendar"
                  component={CalendarContainer}
                  options={{ headerShown: true, headerTitle: "Ekonomik Takvim", headerTitleAlign: "center" }}
                />
                <Stack.Screen
                  name="DividendCalendar"
                  component={DividendCalendar}
                  options={{ headerShown: true, headerTitle: "Temettü Takvimi", headerTitleAlign: "center" }}
                />
                {/* <Stack.Screen
                  name="DetailTradingView"
                  component={DetailTradingView}
                  options={{ headerShown: false }}
                /> */}
              </>
            ) : (
              <>
                <Stack.Screen
                  name="Welcome"
                  component={Welcome}
                  options={{
                    headerShown: false,
                    animation: "none",
                    title: "",
                  }}
                />
                <Stack.Screen
                  name="Login"
                  component={AccountLogin}
                  options={{
                    title: "",
                    headerTitle: () => <AuthHeaderLogo />,
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen
                  name="Register"
                  component={AuthRegister}
                  options={{
                    title: "",
                    headerTitle: () => <AuthHeaderLogo />,
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen
                  name="OtpVerify"
                  component={OtpVerify}
                  options={{
                    title: "",
                    headerTitle: () => <AuthHeaderLogo />,
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen
                  name="SetPassword"
                  component={SetPassword}
                  options={{
                    title: "",
                    headerTitle: () => <AuthHeaderLogo />,
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen
                  name="CompleteProfile"
                  component={CompleteProfile}
                  options={{
                    title: "",
                    headerTitle: () => <AuthHeaderLogo />,
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen
                  name="LoginPassword"
                  component={LoginPassword}
                  options={{
                    title: "",
                    headerTitle: () => <AuthHeaderLogo />,
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen
                  name="SMSGGO"
                  component={SMSGGO}
                  options={{
                    animation: "none",
                    headerTitle: () => null,
                    headerShown: true,
                  }}
                />
              </>
            )}
          </Stack.Navigator>
          <StatusBar
            barStyle={theme.themeDetail === "dark" ? "light-content" : "dark-content"}
            backgroundColor={theme.darkestBrand}
            translucent={false}
          />
        </BottomSheetProvider>
      </NavigationContainer>

      <Animated.View
        pointerEvents={overlayActive ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFillObject,
          styles.transitionOverlay,
          { backgroundColor: theme.darkerBrand },
          overlayAnimatedStyle,
        ]}
      >
        {LOADER_VARIANT === "logo" ? (
          <View style={styles.logoLoaderWrap}>
            <Image
              source={require("../../assets/bigpara/headerLogo.png")}
              style={styles.transitionLogo}
              resizeMode="contain"
            />
            <View style={styles.dotsRow}>
              <Animated.View style={[styles.dot, { backgroundColor: DOT_ACCENT }, dot1Style]} />
              <Animated.View style={[styles.dot, { backgroundColor: DOT_ACCENT }, dot2Style]} />
              <Animated.View style={[styles.dot, { backgroundColor: DOT_ACCENT }, dot3Style]} />
            </View>
          </View>
        ) : (
          <LottieView
            source={require("../../assets/lottie/loading-dots.json")}
            autoPlay
            loop
            renderMode="HARDWARE"
            style={styles.transitionLottie}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  transitionOverlay: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  transitionLottie: {
    width: 90,
    height: 90,
  },
  transitionLogo: {
    width: 180,
    height: 44,
  },
  logoLoaderWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
});
