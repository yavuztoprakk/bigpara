import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from "react-native-reanimated";
import * as Network from "expo-network";
import * as Application from "expo-application";
import { useTheme } from "../../../theme/ThemeContext";
import flashMessage from "../../../modules/flashMessage";
import { login as IdealClientLogin } from "../../../modules/IdealClient/index";
import store from "../../../store";
import { initiateLogin } from "../modules/login";

interface Props {
  navigation: any;
}

// Sabit renkler: brand vurgu + LinearGradient renkleri.
const ACCENT = "#F07400";
const ORB_TOP_COLORS = ["#FFB978", "#F07400"] as const;
const ORB_BOTTOM_COLORS = ["#FF9D42", "#FF8F27"] as const;
const PRIMARY_BTN_COLORS = ["#F07400", "#FF8C1A"] as const;

// Primary buton gölgesi tema-bağımsız sabit (her render'da yeni obje üretilmesin diye module-level).
const PRIMARY_BTN_SHADOW = Platform.select({
  ios: {
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  android: { elevation: 10 },
});

// LinearGradient gradient yön props'ları da sabit ref olsun.
const ORB_GRADIENT_START = { x: 0, y: 0 } as const;
const ORB_GRADIENT_END = { x: 1, y: 1 } as const;
const PRIMARY_GRADIENT_START = { x: 0, y: 0 } as const;
const PRIMARY_GRADIENT_END = { x: 1, y: 0 } as const;

const Welcome: React.FC<Props> = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.themeDetail === "dark";

  // Misafir akışı için loading state — buton tap'inden socket login success'e
  // veya hata yakalanmasına kadar buton disabled kalır.
  const [demoLoading, setDemoLoading] = useState(false);

  const accent = ACCENT;
  const subtle = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)";
  const btnBorder = isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(240,116,0,0.25)";

  // Arka plan gradient renkleri sadece tema değiştiğinde yenilensin.
  const bgGradientColors = useMemo(
    () =>
      [
        isDark ? "rgba(240,116,0,0.06)" : "rgba(240,116,0,0.04)",
        "transparent",
        isDark ? "rgba(240,116,0,0.03)" : "rgba(240,116,0,0.02)",
      ] as const,
    [isDark]
  );

  const logoP = useSharedValue(0);
  const subP = useSharedValue(0);
  const b1 = useSharedValue(0);
  const b2 = useSharedValue(0);
  const b3 = useSharedValue(0);

  useEffect(() => {
    logoP.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
    subP.value = withDelay(
      180,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    b1.value = withDelay(
      600,
      withSpring(1, { damping: 16, stiffness: 110 })
    );
    b2.value = withDelay(
      700,
      withSpring(1, { damping: 16, stiffness: 110 })
    );
    b3.value = withDelay(
      850,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const logoAnim = useAnimatedStyle(() => ({
    opacity: logoP.value,
    transform: [
      { scale: interpolate(logoP.value, [0, 1], [0.86, 1]) },
    ],
  }));

  const subAnim = useAnimatedStyle(() => ({
    opacity: subP.value,
    transform: [
      { translateY: interpolate(subP.value, [0, 1], [12, 0]) },
    ],
  }));

  const b1Anim = useAnimatedStyle(() => ({
    opacity: b1.value,
    transform: [
      { translateY: interpolate(b1.value, [0, 1], [28, 0]) },
    ],
  }));

  const b2Anim = useAnimatedStyle(() => ({
    opacity: b2.value,
    transform: [
      { translateY: interpolate(b2.value, [0, 1], [28, 0]) },
    ],
  }));

  const b3Anim = useAnimatedStyle(() => ({
    opacity: b3.value,
  }));

  const cycleTheme = useCallback(() => {
    toggleTheme(isDark ? "light" : "dark");
  }, [toggleTheme, isDark]);

  const themeIcon = isDark ? "moon" : "sunny" as const;

  const goToLogin = useCallback(() => {
    if (demoLoading) return;
    navigation.navigate("Login");
  }, [navigation, demoLoading]);

  const loginToDemo = useCallback(async () => {
    // Çift tıklama koruması — misafir akışı sürerken yeniden tetiklenmesin.
    if (demoLoading) return;
    setDemoLoading(true);
    try {
      const net = await Network.getNetworkStateAsync();
      if (!net.isConnected) {
        flashMessage({
          type: "danger",
          message: "Lütfen ağ bağlantınızı kontrol ediniz!",
        });
        setDemoLoading(false);
        return;
      }

      let deviceId: string | undefined;
      if (Platform.OS === "ios" && Application.getIosIdForVendorAsync) {
        const iosId = await Application.getIosIdForVendorAsync();
        deviceId = iosId?.split("-").pop();
      } else if (Platform.OS === "android") {
        deviceId = Application.getAndroidId();
      }

      const userId = `usergck_${deviceId}`;
      IdealClientLogin(userId, "ColendiMenkul1", true, "0", "0");
      store.dispatch(initiateLogin(true, true));
      // Not: Başarılı akışta WebSocket login success → isAuthenticated=true →
      // Stack switch → Welcome unmount olur. Bu yüzden loading state'i
      // sıfırlamaya gerek yok. Hata durumunda catch bloğu sıfırlıyor.
    } catch (e: any) {
      console.error("loginToDemo failed:", e?.toString?.() ?? e);
      flashMessage({
        type: "danger",
        message: "Bağlantı sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      });
      setDemoLoading(false);
    }
  }, [demoLoading]);

  return (
    <View style={[s.container, { backgroundColor: theme.darkerBrand }]}>
      <LinearGradient
        colors={bgGradientColors}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View style={s.orbTopRight} pointerEvents="none">
        <LinearGradient
          colors={ORB_TOP_COLORS}
          start={ORB_GRADIENT_START}
          end={ORB_GRADIENT_END}
          style={s.orbInner}
        />
      </View>
      <View style={s.orbBottomLeft} pointerEvents="none">
        <LinearGradient
          colors={ORB_BOTTOM_COLORS}
          start={ORB_GRADIENT_START}
          end={ORB_GRADIENT_END}
          style={s.orbInnerSmall}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={cycleTheme}
        style={s.themeBtn}
      >
        <Ionicons name={themeIcon} size={22} color={subtle} />
      </TouchableOpacity>

      {/* Logo + Alt başlık */}
      <View style={s.topSection}>
        <Animated.View style={[s.logoWrap, logoAnim]}>
          <Image
            source={require("../../../../assets/bigpara/headerLogo.png")}
            style={s.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={subAnim}>
          <Text
            style={[
              s.subtitle,
              { color: subtle, fontFamily: theme.boldFont },
            ]}
          >
            Finansal piyasaları anlık takip edin
          </Text>
        </Animated.View>
      </View>

      {/* Butonlar */}
      <View style={s.bottomSection}>
        <Animated.View style={b1Anim}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goToLogin}
            disabled={demoLoading}
            style={[s.primaryWrapper, demoLoading && s.disabledOpacity]}
          >
            <LinearGradient
              colors={PRIMARY_BTN_COLORS}
              start={PRIMARY_GRADIENT_START}
              end={PRIMARY_GRADIENT_END}
              style={[s.primaryBtn, PRIMARY_BTN_SHADOW]}
            >
              <Ionicons
                name="log-in-outline"
                size={18}
                color="#fff"
                style={s.iconRight8}
              />
              <Text
                style={[s.primaryText, { fontFamily: theme.boldFont }]}
              >
                Giriş Yap
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* <Animated.View style={b2Anim}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Register")}
            style={[
              s.secondaryBtn,
              {
                borderColor: btnBorder,
                backgroundColor: isDark
                  ? "rgba(240,116,0,0.07)"
                  : "rgba(240,116,0,0.05)",
              },
              Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.15 : 0.05,
                  shadowRadius: 6,
                },
                android: { elevation: 2 },
              }),
            ]}
          >
            <Ionicons
              name="person-add-outline"
              size={17}
              color={accent}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                s.secondaryText,
                { color: accent, fontFamily: theme.boldFont },
              ]}
            >
              Üye Ol
            </Text>
          </TouchableOpacity>
        </Animated.View> */}

        <Animated.View style={b3Anim}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={loginToDemo}
            disabled={demoLoading}
            style={[
              s.ghostBtn,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.03)",
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.08)",
              },
              demoLoading && s.disabledOpacity,
            ]}
          >
            {demoLoading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color={subtle}
                  style={s.iconRight7}
                />
                <Text
                  style={[
                    s.ghostText,
                    { color: subtle, fontFamily: theme.boldFont },
                  ]}
                >
                  Bağlanılıyor…
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={subtle}
                  style={s.iconRight7}
                />
                <Text
                  style={[
                    s.ghostText,
                    { color: subtle, fontFamily: theme.boldFont },
                  ]}
                >
                  Şimdilik Misafir Olarak Devam Et
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
  },

  orbTopRight: {
    position: "absolute",
    width: 200,
    height: 200,
    right: -70,
    top: -70,
    opacity: 0.18,
  },
  orbBottomLeft: {
    position: "absolute",
    width: 140,
    height: 140,
    left: -50,
    bottom: 60,
    opacity: 0.14,
  },
  orbInner: {
    flex: 1,
    borderRadius: 100,
  },
  orbInnerSmall: {
    flex: 1,
    borderRadius: 70,
  },

  themeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  topSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logo: {
    width: 220,
    height: 55,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 14,
    letterSpacing: 0.2,
  },

  bottomSection: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === "ios" ? 220 : 185,
  },
  primaryWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#fff",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  secondaryText: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
  ghostBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: {
    fontSize: 13.5,
    letterSpacing: 0.2,
  },
  // Yardımcı stiller — inline obje referanslarını stabil tutmak için.
  iconRight7: {
    marginRight: 7,
  },
  iconRight8: {
    marginRight: 8,
  },
  disabledOpacity: {
    opacity: 0.6,
  },
});

export default Welcome;
