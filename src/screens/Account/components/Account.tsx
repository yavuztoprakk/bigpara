import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { updateInitialTab, InitialTab } from "../../Auth/modules/preferences";
import VersionFooter from "./VersionFooter";
import { useTheme } from "../../../theme/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
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
import {
  login as idealClientLogin,
  logout as idealClientLogout,
  getConnectedServer,
} from "../../../modules/IdealClient";
import { transitionOverlayRef } from "../../../modules/transitionOverlay";
import { login as setAuthLoading, resetLogin, logout } from "../../Auth/modules/auth";
import store from "../../../store";
import flashMessage from "../../../modules/flashMessage";
import {
  initiatePasswordReset,
  verifyPasswordResetOtp,
  completePasswordReset,
  checkUserExists,
} from "../../../modules/BigParaClient";
import { generateTOTP } from "../../../modules/BigParaClient/totp";

const TOTP_SECRET = "JBSWY3DPEHPK3PXP";

// Module-level sabitler — JSX'te inline obje/array referansları üretilmesin diye.
const ACCENT = "#F07400";
const EMPTY_LIST: any[] = [];

// Voltran BFF logout endpoint'i. Production geçişinde URL güncellenecek.
const LOGOUT_ENDPOINT =
  "https://voltran-bff-test.demirorenmedya.com/api/v1/hurriyet/Auth/Logout";

const START_SCREEN_OPTIONS: ReadonlyArray<{ key: InitialTab; icon: string; label: string }> = [
  { key: "WatchList", icon: "list-outline", label: "Ekranım" },
  { key: "Markets", icon: "trending-up-outline", label: "Piyasalar" },
  { key: "News", icon: "newspaper-outline", label: "Haberler" },
  { key: "Tools", icon: "analytics-outline", label: "Analiz" },
];

// LinearGradient yön koordinatları
const GRADIENT_VERTICAL_START = { x: 0.5, y: 0 } as const;
const GRADIENT_VERTICAL_END = { x: 0.5, y: 1 } as const;
const GRADIENT_DIAGONAL_START = { x: 0, y: 0 } as const;
const GRADIENT_DIAGONAL_END = { x: 1, y: 1 } as const;
const GRADIENT_HORIZONTAL_START = { x: 0, y: 0 } as const;
const GRADIENT_HORIZONTAL_END = { x: 1, y: 0 } as const;
const BRAND_STACK_GRADIENT_START = { x: 0.15, y: 0 } as const;
const BRAND_STACK_GRADIENT_END = { x: 0.85, y: 1 } as const;

// LinearGradient renk paletleri (statik)
const BRAND_STACK_COLORS = ["#FFC58A", "#FF9A3C", "#F07400"] as const;
const BRAND_STACK_LOCATIONS = [0, 0.55, 1] as const;
const PRIMARY_BTN_COLORS = ["#F07400", "#FF8C1A"] as const;
const FORGOT_ICON_COLORS = ["#F07400", "#FF9A3C"] as const;

// Platform.select shadow paletleri (statik)
const PRIMARY_BTN_SHADOW = Platform.select({
  ios: {
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  android: { elevation: 8 },
});

const FORGOT_ICON_SHADOW = Platform.select({
  ios: {
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  android: { elevation: 8 },
});

const FORGOT_ACTION_SHADOW = Platform.select({
  ios: {
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  android: { elevation: 6 },
});

const BRAND_STACK_BADGE_SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  android: { elevation: 5 },
});

/* ─── Theme toggle button (header right) ─── */
const ThemeToggleHeaderButton = React.memo(({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) => {
  const rotation = useSharedValue(0);

  const handlePress = () => {
    rotation.value = withTiming(rotation.value + 360, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
    onToggle();
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        themeBtnStyles.btn,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.07)"
            : "rgba(240,116,0,0.10)",
          borderColor: isDark
            ? "rgba(255,255,255,0.10)"
            : "rgba(240,116,0,0.22)",
        },
      ]}
    >
      <Animated.View style={iconStyle}>
        <Ionicons
          name={isDark ? "sunny" : "moon"}
          size={18}
          color="#F07400"
        />
      </Animated.View>
    </TouchableOpacity>
  );
});
ThemeToggleHeaderButton.displayName = "ThemeToggleHeaderButton";

const themeBtnStyles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
});

/* ─── Staggered fade-slide block ─── */
const StaggerIn = React.memo(({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 90,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [24, 0]) },
    ],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
});
StaggerIn.displayName = "StaggerIn";

/* ─── Avatar bounce ─── */
const AvatarBounce = React.memo(({
  children,
}: {
  children: React.ReactNode;
}) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withSpring(1, { damping: 12, stiffness: 150, mass: 0.8 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
});
AvatarBounce.displayName = "AvatarBounce";

/* ─── Profil menü satırı ─── */
const ProfileMenuItem = ({
  icon,
  label,
  onPress,
  isDark,
  accent,
  theme,
  rightIcon = "chevron-forward",
  iconBg,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  isDark: boolean;
  accent: string;
  theme: any;
  rightIcon?: string;
  iconBg?: string;
}) => {
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        profileStyles.menuItem,
        { backgroundColor: cardBg, borderColor: border },
      ]}
    >
      <View
        style={[
          profileStyles.menuIconWrap,
          { backgroundColor: iconBg || accent + "18" },
        ]}
      >
        <Ionicons name={icon as any} size={18} color={iconBg ? "#fff" : accent} />
      </View>
      <Text
        style={[
          profileStyles.menuLabel,
          { color: theme.white, fontFamily: theme.regularFont },
        ]}
      >
        {label}
      </Text>
      <Ionicons
        name={rightIcon as any}
        size={16}
        color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"}
      />
    </TouchableOpacity>
  );
};

const Account = () => {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation<any>();
  const isDark = theme.themeDetail === "dark";
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const authLoading = useSelector((state: any) => state.auth.loading);
  const user = useSelector((state: any) => state.auth.user);
  const isDemo = useSelector((state: any) => state.auth.demo);
  // Stabil empty list fallback — selector her dispatch'te yeni [] üretmesin.
  const yatirimlar = useSelector(
    (state: any) => state.yatirimlar?.list ?? EMPTY_LIST
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Sifremi Unuttum state
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailFocused, setForgotEmailFocused] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "newPassword">("email");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotOtpFocused, setForgotOtpFocused] = useState(false);
  const [forgotUserToken, setForgotUserToken] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotNewPasswordFocused, setForgotNewPasswordFocused] = useState(false);
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ThemeToggleHeaderButton
          isDark={isDark}
          onToggle={() => toggleTheme(isDark ? "light" : "dark")}
        />
      ),
    });
  }, [navigation, isDark, toggleTheme]);


  const accent = "#F07400";
  const readable = isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.68)";
  const subtle = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)";
  const text = theme.white;

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: () => {
            // Voltran BFF logout — fire-and-forget: response beklemeden
            // lokal logout devam eder. refreshToken state temizlenmeden
            // önce alınıyor; sonradan dispatch çalışsa bile body hazır.
            const refreshToken = store.getState().auth?.user?.refreshToken;
            if (refreshToken) {
              const body = { refreshToken };
              console.log("[Logout] POST", LOGOUT_ENDPOINT);
              console.log("[Logout] request body:", body);
              fetch(LOGOUT_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              })
                .then(async (response) => {
                  const data = await response.json().catch(() => null);
                  console.log(
                    "[Logout] response status:",
                    response.status,
                    response.ok ? "OK" : "FAIL"
                  );
                  console.log("[Logout] response data:", data);
                })
                .catch((error) => {
                  console.log("[Logout] network error:", error);
                });
            } else {
              console.log("[Logout] no refreshToken in auth state, skipping backend logout");
            }

            // Önce IdealClient modül state'ini temizle ve WS'i kapat.
            // username temizlenmeden ws.close() çağrılırsa onclose handler
            // otomatik reconnect tetikler (index.ts:417).
            idealClientLogout();
            (store.dispatch as any)(logout());
          },
        },
      ]
    );
  };

  const [continueLoading, setContinueLoading] = useState(false);

  const handleLogin = async () => {
    if (isAuthenticated) return;

    if (!email.trim()) {
      flashMessage({
        type: "danger",
        message: "E-posta girilmesi zorunludur",
      });
      return;
    }

    // Global bigpara overlay'i tap anında göster — kullanıcı doğrudan
    // logo+3 nokta loader'ı görür, buton-içi spinner gözükmez.
    setContinueLoading(true);
    transitionOverlayRef.current?.show();
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        flashMessage({
          type: "danger",
          message: "Lütfen ağ bağlantınızı kontrol ediniz!",
        });
        setContinueLoading(false);
        transitionOverlayRef.current?.hide();
        return;
      }

      const res = await checkUserExists({
        email: email.trim(),
        phoneNumber: "",
        phoneCountryCode: "",
        tokenType: 2,
        token: generateTOTP(TOTP_SECRET),
      });

      if (res.data.hasError) {
        flashMessage({
          type: "danger",
          message: res.data.errors?.[0] || "Bir hata oluştu",
        });
        setContinueLoading(false);
        transitionOverlayRef.current?.hide();
        return;
      }

      const result = res.data.result;
      if (!result) {
        flashMessage({ type: "danger", message: "Beklenmeyen yanıt" });
        setContinueLoading(false);
        transitionOverlayRef.current?.hide();
        return;
      }

      if (result.hasUser) {
        // hasUser=true: mevcut kullanıcı, şifre giriş ekranına yönlendir.
        // Overlay açık kalsın — navigation.navigate onStateChange'i tetikleyip
        // mevcut transition overlay fade-out logic'ine bağlanır.
        setContinueLoading(false);
        navigation.navigate("LoginPassword", {
          email: email.trim(),
          firstName: result.firstName || "",
          lastName: result.lastName || "",
          profileImageUrl: result.profileImageUrl || "",
          isFirstLogin: !!result.isFirstLogin,
        });
        return;
      }

      // hasUser=false: register akışına geç. Overlay açık kalsın.
      setContinueLoading(false);
      navigation.navigate("OtpVerify", {
        email: email.trim(),
        userToken: result.userToken,
      });
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Bir hata oluştu",
      });
      setContinueLoading(false);
      transitionOverlayRef.current?.hide();
    }
  };

  // Sifremi Unuttum modal'ini sifirla
  const resetForgotModal = () => {
    setForgotVisible(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setForgotUserToken("");
    setForgotNewPassword("");
    setForgotLoading(false);
    setForgotShowPassword(false);
  };

  // Sifremi Unuttum - Adim 1: initiatePasswordReset
  const handleForgotSubmitEmail = async () => {
    if (!forgotEmail.trim()) {
      flashMessage({ type: "danger", message: "E-posta adresinizi giriniz" });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await initiatePasswordReset({
        email: forgotEmail.trim(),
        phoneNumber: "",
        phoneCountryCode: "",
        tokenType: 2,
        token: "",
      });
      if (res.data.hasError) {
        flashMessage({ type: "danger", message: res.data.errors?.[0] || "Bir hata oluştu" });
        setForgotLoading(false);
        return;
      }
      setForgotUserToken(res.data.result?.userToken || "");
      setForgotStep("otp");
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Bir hata oluştu",
      });
    }
    setForgotLoading(false);
  };

  // Sifremi Unuttum - Adim 2: verifyPasswordResetOtp
  const handleForgotSubmitOtp = async () => {
    if (!forgotOtp.trim()) {
      flashMessage({ type: "danger", message: "OTP kodunu giriniz" });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await verifyPasswordResetOtp({
        userToken: forgotUserToken,
        code: forgotOtp.trim(),
        otpTypeEmail: true,
        tokenType: 2,
        token: "",
      });
      if (res.data.hasError) {
        flashMessage({ type: "danger", message: res.data.errors?.[0] || "Hatalı OTP kodu" });
        setForgotLoading(false);
        return;
      }
      setForgotUserToken(res.data.result?.userToken || forgotUserToken);
      setForgotStep("newPassword");
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Bir hata oluştu",
      });
    }
    setForgotLoading(false);
  };

  // Sifremi Unuttum - Adim 3: completePasswordReset
  const handleForgotSubmitNewPassword = async () => {
    if (!forgotNewPassword.trim()) {
      flashMessage({ type: "danger", message: "Yeni şifrenizi giriniz" });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await completePasswordReset({
        password: forgotNewPassword,
        userToken: forgotUserToken,
        tokenType: 2,
        token: "",
      });
      if (res.data.hasError) {
        flashMessage({ type: "danger", message: res.data.errors?.[0] || "Bir hata oluştu" });
        setForgotLoading(false);
        return;
      }
      flashMessage({ type: "success", message: "Şifreniz başarıyla değiştirildi" });
      resetForgotModal();
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Bir hata oluştu",
      });
    }
    setForgotLoading(false);
  };

  // Sifremi Unuttum akisindaki buton handler
  const handleForgotAction = () => {
    if (forgotStep === "email") handleForgotSubmitEmail();
    else if (forgotStep === "otp") handleForgotSubmitOtp();
    else handleForgotSubmitNewPassword();
  };

  const [startScreenModalVisible, setStartScreenModalVisible] = useState(false);
  const dispatch = useDispatch();
  const selectedStartScreen = useSelector((state: any) => state.preferences.initialTab);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  const startScreenOptions = START_SCREEN_OPTIONS;

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hesabı Sil",
      "Hesabınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Hesabı Sil",
          style: "destructive",
          onPress: async () => {
            setDeleteAccountLoading(true);
            flashMessage({ type: "info", message: "Hesap silme talebi alındı" });
            setDeleteAccountLoading(false);
          },
        },
      ]
    );
  };

  if (isAuthenticated) {
    const licenceCount = user?.licences?.length || 0;
    const displayName = user?.username || "";
    const userEmail = user?.email || "";
    const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";
    const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

    const licenceList = user?.licences || [];
    const activeLicence = licenceList.find((l: any) => l.isActive);

    return (
      <View style={[s.container, { backgroundColor: theme.darkerBrand }]}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Profil Hero */}
          <View style={s.heroWrap}>
            <LinearGradient
              colors={[
                isDark ? "rgba(240,116,0,0.22)" : "rgba(240,116,0,0.13)",
                isDark ? "rgba(255,143,39,0.10)" : "rgba(255,143,39,0.06)",
                "transparent",
              ]}
              locations={[0, 0.55, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />

            <View style={s.heroOrbTopRight} pointerEvents="none">
              <LinearGradient
                colors={["#FFB978", "#F07400"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.heroOrbInner}
              />
            </View>
            <View style={s.heroOrbBottomLeft} pointerEvents="none">
              <LinearGradient
                colors={["#FF9D42", "#FF8F27"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.heroOrbInnerSmall}
              />
            </View>
            <View style={s.heroOrbMidRight} pointerEvents="none">
              <LinearGradient
                colors={["#FFD3A4", "#FFB978"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.heroOrbInnerTiny}
              />
            </View>

            <AvatarBounce>
              <View style={s.avatarSection}>
                <View
                  style={[
                    s.avatarOuterGlow,
                    {
                      backgroundColor: isDark
                        ? "rgba(240,116,0,0.18)"
                        : "rgba(240,116,0,0.12)",
                    },
                  ]}
                  pointerEvents="none"
                />
                <View
                  style={[
                    s.avatarShadowWrap,
                    Platform.select({
                      ios: {
                        shadowColor: accent,
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: isDark ? 0.55 : 0.4,
                        shadowRadius: 22,
                      },
                      android: { elevation: 14 },
                    }),
                  ]}
                >
                  <View style={[s.avatarRing, { borderColor: accent }]}>
                    <LinearGradient
                      colors={["#FFB978", "#FF9D42", "#FF8F27", "#F07400"]}
                      locations={[0, 0.35, 0.7, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={s.avatarGradient}
                    >
                      <Ionicons name="person" size={36} color="#fff" />
                    </LinearGradient>
                  </View>
                </View>
              </View>
            </AvatarBounce>

            <StaggerIn index={1}>
              <View style={s.titleSection}>
                <Text style={[s.welcomeTitle, { color: text, fontFamily: theme.boldFont }]}>
                  Hesabım
                </Text>
                <Text
                  style={[s.welcomeSub, { color: readable, fontFamily: theme.regularFont }]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                {isDemo && (
                  <View style={profileStyles.demoBadge}>
                    <Text style={[profileStyles.demoBadgeText, { fontFamily: theme.boldFont }]}>
                      Demo Hesap
                    </Text>
                  </View>
                )}
              </View>
            </StaggerIn>
          </View>

          {/* Kullanıcı Bilgileri */}
          <StaggerIn index={2}>
            <Text
              style={[
                profileStyles.sectionTitle,
                { color: subtle, fontFamily: theme.boldFont },
              ]}
            >
              KULLANICI BİLGİLERİ
            </Text>

            <View
              style={[
                profileStyles.infoCard,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <View style={profileStyles.infoRow}>
                <View style={[profileStyles.infoIconWrap, { backgroundColor: accent + "18" }]}>
                  <Ionicons name="person-outline" size={15} color={accent} />
                </View>
                <View style={profileStyles.infoContent}>
                  <Text style={[profileStyles.infoLabel, { color: subtle, fontFamily: theme.regularFont }]}>
                    Kullanıcı Adı
                  </Text>
                  <Text style={[profileStyles.infoValue, { color: text, fontFamily: theme.boldFont }]}>
                    {displayName || "—"}
                  </Text>
                </View>
              </View>

              <View style={[profileStyles.infoDivider, { backgroundColor: cardBorder }]} />

              <View style={profileStyles.infoRow}>
                <View style={[profileStyles.infoIconWrap, { backgroundColor: accent + "18" }]}>
                  <Ionicons name="mail-outline" size={15} color={accent} />
                </View>
                <View style={profileStyles.infoContent}>
                  <Text style={[profileStyles.infoLabel, { color: subtle, fontFamily: theme.regularFont }]}>
                    E-posta
                  </Text>
                  <Text style={[profileStyles.infoValue, { color: text, fontFamily: theme.boldFont }]} numberOfLines={1}>
                    {userEmail || "—"}
                  </Text>
                </View>
              </View>

              {getConnectedServer() && (
                <>
                  <View style={[profileStyles.infoDivider, { backgroundColor: cardBorder }]} />
                  <View style={profileStyles.infoRow}>
                    <View style={[profileStyles.infoIconWrap, { backgroundColor: accent + "18" }]}>
                      <Ionicons name="server-outline" size={15} color={accent} />
                    </View>
                    <View style={profileStyles.infoContent}>
                      <Text style={[profileStyles.infoLabel, { color: subtle, fontFamily: theme.regularFont }]}>
                        Sunucu
                      </Text>
                      <Text style={[profileStyles.infoValue, { color: text, fontFamily: theme.boldFont }]} numberOfLines={1}>
                        {getConnectedServer()}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </StaggerIn>

          {/* Hesap */}
          <StaggerIn index={3}>
            <Text
              style={[
                profileStyles.sectionTitle,
                { color: subtle, fontFamily: theme.boldFont },
              ]}
            >
              HESAP
            </Text>

            <ProfileMenuItem
              icon="briefcase-outline"
              label="Yatırımlarım"
              onPress={() => navigation.navigate("Tools", { screen: "Yatirimlarim" })}
              isDark={isDark}
              accent={accent}
              theme={theme}
            />

            <ProfileMenuItem
              icon="home-outline"
              label="Açılış Sayfası"
              onPress={() => setStartScreenModalVisible(true)}
              isDark={isDark}
              accent={accent}
              theme={theme}
            />
          </StaggerIn>

          {/* Lisans */}
          <StaggerIn index={4}>
            <Text
              style={[
                profileStyles.sectionTitle,
                { color: subtle, fontFamily: theme.boldFont },
              ]}
            >
              LİSANS
            </Text>

            <View
              style={[
                profileStyles.infoCard,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <View style={profileStyles.infoRow}>
                <View style={[profileStyles.infoIconWrap, { backgroundColor: accent + "18" }]}>
                  <Ionicons name="shield-checkmark-outline" size={15} color={accent} />
                </View>
                <View style={profileStyles.infoContent}>
                  <Text style={[profileStyles.infoLabel, { color: subtle, fontFamily: theme.regularFont }]}>
                    Lisans Durumu
                  </Text>
                  <Text style={[profileStyles.infoValue, { color: activeLicence ? theme.green : theme.red, fontFamily: theme.boldFont }]}>
                    {activeLicence ? "Aktif" : "Pasif"}
                  </Text>
                </View>
              </View>

              <View style={[profileStyles.infoDivider, { backgroundColor: cardBorder }]} />

              <View style={profileStyles.infoRow}>
                <View style={[profileStyles.infoIconWrap, { backgroundColor: accent + "18" }]}>
                  <Ionicons name="documents-outline" size={15} color={accent} />
                </View>
                <View style={profileStyles.infoContent}>
                  <Text style={[profileStyles.infoLabel, { color: subtle, fontFamily: theme.regularFont }]}>
                    Toplam Lisans
                  </Text>
                  <Text style={[profileStyles.infoValue, { color: text, fontFamily: theme.boldFont }]}>
                    {licenceCount}
                  </Text>
                </View>
              </View>

              {activeLicence?.expirationDate && (
                <>
                  <View style={[profileStyles.infoDivider, { backgroundColor: cardBorder }]} />
                  <View style={profileStyles.infoRow}>
                    <View style={[profileStyles.infoIconWrap, { backgroundColor: accent + "18" }]}>
                      <Ionicons name="calendar-outline" size={15} color={accent} />
                    </View>
                    <View style={profileStyles.infoContent}>
                      <Text style={[profileStyles.infoLabel, { color: subtle, fontFamily: theme.regularFont }]}>
                        Bitiş Tarihi
                      </Text>
                      <Text style={[profileStyles.infoValue, { color: text, fontFamily: theme.boldFont }]}>
                        {new Date(activeLicence.expirationDate).toLocaleDateString("tr-TR")}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            <ProfileMenuItem
              icon="cart-outline"
              label="Lisans Satın Al"
              onPress={() => flashMessage({ type: "info", message: "Yakında aktif olacak." })}
              isDark={isDark}
              accent={accent}
              theme={theme}
            />
          </StaggerIn>

          {/* Ayarlar */}
          <StaggerIn index={5}>
            <Text
              style={[
                profileStyles.sectionTitle,
                { color: subtle, fontFamily: theme.boldFont },
              ]}
            >
              AYARLAR
            </Text>

            <ProfileMenuItem
              icon={isDark ? "sunny-outline" : "moon-outline"}
              label="Tema Değiştir"
              onPress={() => toggleTheme(isDark ? "light" : "dark")}
              isDark={isDark}
              accent={accent}
              theme={theme}
              rightIcon={isDark ? "sunny" : "moon"}
            />
          </StaggerIn>

          {/* Hakkımızda */}
          <StaggerIn index={6}>
            <Text
              style={[
                profileStyles.sectionTitle,
                { color: subtle, fontFamily: theme.boldFont },
              ]}
            >
              HAKKIMIZDA
            </Text>

            <ProfileMenuItem
              icon="information-circle-outline"
              label="Hakkımızda"
              onPress={() => navigation.navigate("Hakkimizda")}
              isDark={isDark}
              accent={accent}
              theme={theme}
            />
          </StaggerIn>

          {/* Hesap Sil & Çıkış */}
          <StaggerIn index={7}>
            <View style={[profileStyles.dangerDivider, { backgroundColor: cardBorder }]} />

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                profileStyles.dangerMenuItem,
                {
                  backgroundColor: isDark ? "rgba(229,52,46,0.06)" : "rgba(229,52,46,0.04)",
                  borderColor: isDark ? "rgba(229,52,46,0.12)" : "rgba(229,52,46,0.08)",
                },
              ]}
              onPress={handleDeleteAccount}
              disabled={deleteAccountLoading}
            >
              <View style={[profileStyles.menuIconWrap, { backgroundColor: theme.red + "18" }]}>
                <Ionicons name="trash-outline" size={18} color={theme.red} />
              </View>
              <Text
                style={[
                  profileStyles.menuLabel,
                  { color: theme.red, fontFamily: theme.regularFont },
                ]}
              >
                Hesabı Sil
              </Text>
              {deleteAccountLoading ? (
                <ActivityIndicator size="small" color={theme.red} />
              ) : (
                <Ionicons name="chevron-forward" size={16} color={theme.red + "50"} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={profileStyles.logoutBtnWrapper}
              onPress={handleLogout}
            >
              <View
                style={[
                  profileStyles.logoutBtn,
                  {
                    backgroundColor: isDark ? "rgba(229,52,46,0.12)" : "rgba(229,52,46,0.08)",
                    borderColor: isDark ? "rgba(229,52,46,0.2)" : "rgba(229,52,46,0.15)",
                  },
                ]}
              >
                <Ionicons name="log-out-outline" size={18} color={theme.red} style={{ marginRight: 8 }} />
                <Text style={[profileStyles.logoutBtnText, { color: theme.red, fontFamily: theme.boldFont }]}>
                  Çıkış Yap
                </Text>
              </View>
            </TouchableOpacity>
          </StaggerIn>

          <VersionFooter />
        </ScrollView>

        {/* Açılış Sayfası Modal */}
        <Modal
          visible={startScreenModalVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setStartScreenModalVisible(false)}
        >
          <Pressable
            style={s.modalBackdrop}
            onPress={() => setStartScreenModalVisible(false)}
          >
            <Pressable
              style={[
                s.modalCard,
                {
                  backgroundColor: isDark ? "#181E26" : "#FFFFFF",
                  borderColor: cardBorder,
                },
              ]}
              onPress={() => {}}
            >
              <LinearGradient
                colors={["#F07400", "#FF9A3C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  s.modalIconWrap,
                  Platform.select({
                    ios: {
                      shadowColor: accent,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.4,
                      shadowRadius: 12,
                    },
                    android: { elevation: 8 },
                  }),
                ]}
              >
                <Ionicons name="home-outline" size={28} color="#fff" />
              </LinearGradient>

              <Text style={[s.modalTitle, { color: text, fontFamily: theme.boldFont }]}>
                Açılış Sayfası
              </Text>
              <Text
                style={[
                  s.modalDesc,
                  {
                    color: readable,
                    fontFamily: theme.regularFont,
                  },
                ]}
              >
                Uygulama açıldığında hangi sayfa görüntülensin?
              </Text>

              <View style={profileStyles.startScreenList}>
                {startScreenOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    activeOpacity={0.7}
                    style={[
                      profileStyles.startScreenOption,
                      {
                        backgroundColor: selectedStartScreen === option.key
                          ? accent + "18"
                          : cardBg,
                        borderColor: selectedStartScreen === option.key
                          ? accent + "40"
                          : cardBorder,
                      },
                    ]}
                    onPress={() => {
                      dispatch(updateInitialTab(option.key));
                      setStartScreenModalVisible(false);
                      flashMessage({ type: "success", message: `Açılış sayfası: ${option.label}` });
                    }}
                  >
                    <View style={[profileStyles.startScreenIconWrap, { backgroundColor: accent + "18" }]}>
                      <Ionicons name={option.icon as any} size={18} color={accent} />
                    </View>
                    <Text
                      style={[
                        profileStyles.startScreenLabel,
                        {
                          color: selectedStartScreen === option.key ? accent : text,
                          fontFamily: selectedStartScreen === option.key ? theme.boldFont : theme.regularFont,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selectedStartScreen === option.key && (
                      <Ionicons name="checkmark-circle" size={20} color={accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }

  /* ─── Giriş yapılmamış durum: Login formu ─── */

  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const inputBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)";
  const inputBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const placeholder = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)";
  const strong = isDark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.82)";

  // Modal icerik - step'e gore degisir
  const forgotModalTitle =
    forgotStep === "email" ? "Şifremi Unuttum" :
    forgotStep === "otp" ? "Doğrulama Kodu" : "Yeni Şifre";

  const forgotModalDesc =
    forgotStep === "email" ? "Lütfen üyelik sistemine kayıtlı e-posta adresinizi giriniz" :
    forgotStep === "otp" ? "E-posta adresinize gönderilen doğrulama kodunu giriniz" :
    "Yeni şifrenizi belirleyiniz";

  const forgotModalIcon =
    forgotStep === "email" ? "lock-open-outline" :
    forgotStep === "otp" ? "keypad-outline" : "key-outline";

  const forgotActionLabel =
    forgotStep === "email" ? "Şifremi Sıfırla" :
    forgotStep === "otp" ? "Kodu Doğrula" : "Şifreyi Güncelle";

  // isDark-bağımlı sabitler — render içi inline obje üretiminin önüne geç.
  const heroBgColors = useMemo(
    () =>
      [
        isDark ? "rgba(240,116,0,0.28)" : "rgba(240,116,0,0.16)",
        isDark ? "rgba(240,116,0,0.10)" : "rgba(255,156,67,0.07)",
        "transparent",
      ] as const,
    [isDark]
  );
  const brandStackShadow = useMemo(
    () =>
      Platform.select({
        ios: {
          shadowColor: ACCENT,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: isDark ? 0.55 : 0.4,
          shadowRadius: 22,
        },
        android: { elevation: 14 },
      }),
    [isDark]
  );

  return (
    <KeyboardAvoidingView
      style={[s.container, { backgroundColor: theme.darkerBrand }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero V2 — premium katmanlı tasarım */}
        <View style={s.heroV2}>
          {/* Backdrop: çok katmanlı derinlik */}
          <LinearGradient
            colors={heroBgColors}
            locations={[0, 0.55, 1]}
            start={GRADIENT_VERTICAL_START}
            end={GRADIENT_VERTICAL_END}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          {/* Blur-edalı 2 dekoratif orb */}
          <View
            style={[
              s.heroBlurOrbTL,
              {
                backgroundColor: isDark
                  ? "rgba(240,116,0,0.22)"
                  : "rgba(240,116,0,0.18)",
              },
            ]}
            pointerEvents="none"
          />
          <View
            style={[
              s.heroBlurOrbBR,
              {
                backgroundColor: isDark
                  ? "rgba(255,156,67,0.15)"
                  : "rgba(255,156,67,0.12)",
              },
            ]}
            pointerEvents="none"
          />

          {/* Squircle stack — 2 katman kart efekti */}
          <AvatarBounce>
            <View style={s.brandStackSection}>
              {/* Arka kart - hafif döndürülmüş, açık tonda */}
              <View
                style={[
                  s.brandStackBack,
                  {
                    backgroundColor: isDark
                      ? "rgba(240,116,0,0.18)"
                      : "rgba(240,116,0,0.14)",
                    borderColor: isDark
                      ? "rgba(240,116,0,0.30)"
                      : "rgba(240,116,0,0.25)",
                  },
                ]}
                pointerEvents="none"
              />

              {/* Ön kart - gradient ana element */}
              <View
                style={[
                  s.brandStackShadowWrap,
                  brandStackShadow,
                ]}
              >
                <LinearGradient
                  colors={BRAND_STACK_COLORS}
                  locations={BRAND_STACK_LOCATIONS}
                  start={BRAND_STACK_GRADIENT_START}
                  end={BRAND_STACK_GRADIENT_END}
                  style={s.brandStackFront}
                >
                  {/* Üst-sol ışıltı */}
                  <View
                    style={s.brandStackHighlight}
                    pointerEvents="none"
                  />
                  <Ionicons name="trending-up" size={34} color="#fff" />
                </LinearGradient>
              </View>

              {/* Güven rozeti - sağ alt taşan */}
              <View
                style={[
                  s.brandStackBadge,
                  {
                    backgroundColor: isDark ? "#181E26" : "#FFFFFF",
                    borderColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                  },
                  BRAND_STACK_BADGE_SHADOW,
                ]}
                pointerEvents="none"
              >
                <Ionicons
                  name="shield-checkmark"
                  size={12}
                  color={accent}
                />
              </View>
            </View>
          </AvatarBounce>

          {/* Title */}
          <StaggerIn index={1}>
            <View style={s.titleV2Section}>
              <Text
                style={[s.welcomeTitleV2, { color: text, fontFamily: theme.boldFont }]}
              >
                Giriş Yap ya da Üye Ol
              </Text>
              <View style={[s.titleV2Pill, { backgroundColor: accent }]} />
            </View>
          </StaggerIn>
        </View>

        {/* Login Form — stagger 1 */}
        <StaggerIn index={2}>
          <View>
            {/* Email */}
            <View style={s.fieldGroup}>
              <Text style={[s.label, { color: subtle, fontFamily: theme.boldFont }]}>E-POSTA</Text>
              <View
                style={[
                  s.inputRow,
                  {
                    backgroundColor: inputBg,
                    borderColor: emailFocused ? accent : inputBorder,
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={15}
                  color={emailFocused ? accent : subtle}
                  style={s.inputIcon}
                />
                <TextInput
                  style={[s.input, { color: text, fontFamily: theme.regularFont }]}
                  placeholder="mail@bigpara.com"
                  placeholderTextColor={placeholder}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {email.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setEmail("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={16} color={subtle} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[s.loginBtnWrapper, { marginTop: 22 }]}
              onPress={handleLogin}
              disabled={authLoading || continueLoading}
            >
              <LinearGradient
                colors={PRIMARY_BTN_COLORS}
                start={GRADIENT_HORIZONTAL_START}
                end={GRADIENT_HORIZONTAL_END}
                style={[s.loginBtn, PRIMARY_BTN_SHADOW]}
              >
                {authLoading || continueLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={18} color="#fff" style={s.iconRight8} />
                    <Text style={[s.loginBtnText, { fontFamily: theme.boldFont }]}>Devam</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </StaggerIn>

        {/* Bottom links — stagger 2 */}
        <StaggerIn index={3}>
          <View style={[s.legalBadge, { backgroundColor: accent + "14", borderColor: accent + "33" }]}>
            <View style={[s.legalBadgeIcon, { backgroundColor: accent }]}>
              <Ionicons name="alert" size={14} color="#fff" />
            </View>
            <View style={s.legalBadgeBody}>
              <Text style={[s.legalBadgeTitle, { color: accent, fontFamily: theme.boldFont }]}>
                Bilgilendirme
              </Text>
              <Text style={[s.legalText, { color: strong, fontFamily: theme.regularFont }]}>
                Hürriyet'in{" "}
                <Text style={{ fontFamily: theme.boldFont, color: accent }}>Aydınlatma Metni</Text>
                {" "}ve{" "}
                <Text style={{ fontFamily: theme.boldFont, color: accent }}>Üyelik Sözleşmesi</Text>
                'nde değişiklik yapılmıştır. Bu değişiklikleri gözden geçirebilirsiniz. Devam etmeniz ve giriş yapmanız halinde Üyelik Sözleşmesi'nin yeni halini kabul etmiş sayılırsınız.
              </Text>
            </View>
          </View>
        </StaggerIn>

        <VersionFooter />
      </ScrollView>

      {/* ─── Şifremi Unuttum Modal ─── */}
      <Modal
        visible={forgotVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={resetForgotModal}
      >
        <Pressable style={s.modalBackdrop} onPress={resetForgotModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={s.modalCenter}
          >
            <Pressable
              style={[
                s.modalCard,
                {
                  backgroundColor: isDark ? "#181E26" : "#FFFFFF",
                  borderColor: cardBorder,
                },
              ]}
              onPress={() => {}}
            >
              <LinearGradient
                colors={FORGOT_ICON_COLORS}
                start={GRADIENT_DIAGONAL_START}
                end={GRADIENT_DIAGONAL_END}
                style={[s.modalIconWrap, FORGOT_ICON_SHADOW]}
              >
                <Ionicons name={forgotModalIcon as any} size={28} color="#fff" />
              </LinearGradient>

              <Text style={[s.modalTitle, { color: text, fontFamily: theme.boldFont }]}>
                {forgotModalTitle}
              </Text>
              <Text
                style={[
                  s.modalDesc,
                  {
                    color: isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.68)",
                    fontFamily: theme.regularFont,
                  },
                ]}
              >
                {forgotModalDesc}
              </Text>

              {/* Step: email */}
              {forgotStep === "email" && (
                <View
                  style={[
                    s.inputRow,
                    {
                      backgroundColor: inputBg,
                      borderColor: forgotEmailFocused ? accent : inputBorder,
                      marginTop: 20,
                    },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={forgotEmailFocused ? accent : subtle}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={[s.input, { color: text, fontFamily: theme.regularFont }]}
                    placeholder="mail@bigpara.com"
                    placeholderTextColor={placeholder}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    onFocus={() => setForgotEmailFocused(true)}
                    onBlur={() => setForgotEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}

              {/* Step: otp */}
              {forgotStep === "otp" && (
                <View
                  style={[
                    s.inputRow,
                    {
                      backgroundColor: inputBg,
                      borderColor: forgotOtpFocused ? accent : inputBorder,
                      marginTop: 20,
                    },
                  ]}
                >
                  <Ionicons
                    name="keypad-outline"
                    size={16}
                    color={forgotOtpFocused ? accent : subtle}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={[s.input, { color: text, fontFamily: theme.regularFont }]}
                    placeholder="000000"
                    placeholderTextColor={placeholder}
                    value={forgotOtp}
                    onChangeText={setForgotOtp}
                    onFocus={() => setForgotOtpFocused(true)}
                    onBlur={() => setForgotOtpFocused(false)}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              )}

              {/* Step: newPassword */}
              {forgotStep === "newPassword" && (
                <View
                  style={[
                    s.inputRow,
                    {
                      backgroundColor: inputBg,
                      borderColor: forgotNewPasswordFocused ? accent : inputBorder,
                      marginTop: 20,
                    },
                  ]}
                >
                  <Ionicons
                    name="key-outline"
                    size={16}
                    color={forgotNewPasswordFocused ? accent : subtle}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={[s.input, { color: text, fontFamily: theme.regularFont }]}
                    placeholder="Yeni şifreniz"
                    placeholderTextColor={placeholder}
                    value={forgotNewPassword}
                    onChangeText={setForgotNewPassword}
                    onFocus={() => setForgotNewPasswordFocused(true)}
                    onBlur={() => setForgotNewPasswordFocused(false)}
                    secureTextEntry={!forgotShowPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setForgotShowPassword(!forgotShowPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={forgotShowPassword ? "eye-outline" : "eye-off-outline"}
                      size={15}
                      color={subtle}
                    />
                  </TouchableOpacity>
                </View>
              )}

              <View style={s.modalButtonRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={resetForgotModal}
                  style={[
                    s.modalSecondaryBtn,
                    {
                      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                      borderColor: inputBorder,
                    },
                  ]}
                >
                  <Ionicons
                    name="arrow-back"
                    size={16}
                    color={isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.68)"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      s.modalSecondaryText,
                      {
                        color: isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.68)",
                        fontFamily: theme.boldFont,
                      },
                    ]}
                  >
                    {forgotStep === "email" ? "Geri" : "İptal"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={s.modalPrimaryWrapper}
                  onPress={handleForgotAction}
                  disabled={forgotLoading}
                >
                  <LinearGradient
                    colors={PRIMARY_BTN_COLORS}
                    start={GRADIENT_HORIZONTAL_START}
                    end={GRADIENT_HORIZONTAL_END}
                    style={[s.modalPrimaryBtn, FORGOT_ACTION_SHADOW]}
                  >
                    {forgotLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="send-outline" size={15} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={[s.modalPrimaryText, { fontFamily: theme.boldFont }]}>
                          {forgotActionLabel}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },

  // Yardımcı stiller (inline obje üretimini engellemek için).
  iconRight8: { marginRight: 8 },

  /* Hero V2 (login form için premium tasarım) */
  heroV2: {
    marginHorizontal: -8,
    marginTop: 4,
    marginBottom: 22,
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
  },
  heroBlurOrbTL: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -60,
    left: -50,
    opacity: 0.55,
  },
  heroBlurOrbBR: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    bottom: -45,
    right: -40,
    opacity: 0.7,
  },

  /* Brand stack V2 — squircle (yumuşak köşeli kare) stack */
  brandStackSection: {
    width: 120,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
  },
  brandStackBack: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 22,
    borderWidth: 1,
    top: 10,
    left: 18,
    transform: [{ rotate: "-10deg" }],
  },
  brandStackShadowWrap: {
    width: 86,
    height: 86,
    borderRadius: 24,
  },
  brandStackFront: {
    flex: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  brandStackHighlight: {
    position: "absolute",
    top: -12,
    left: -12,
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.22)",
    transform: [{ rotate: "-12deg" }],
  },
  brandStackBadge: {
    position: "absolute",
    right: 12,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  /* Title V2 */
  titleV2Section: {
    alignItems: "center",
  },
  welcomeTitleV2: {
    fontSize: 23,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  titleV2Pill: {
    width: 34,
    height: 3,
    borderRadius: 2,
    marginTop: 10,
    opacity: 0.85,
  },

  /* Hero (avatar + welcome) */
  heroWrap: {
    marginHorizontal: -8,
    marginTop: 4,
    marginBottom: 18,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderRadius: 26,
    overflow: "hidden",
    position: "relative",
  },
  heroOrbTopRight: {
    position: "absolute",
    width: 160,
    height: 160,
    right: -55,
    top: -55,
    opacity: 0.32,
  },
  heroOrbBottomLeft: {
    position: "absolute",
    width: 100,
    height: 100,
    left: -35,
    bottom: -30,
    opacity: 0.22,
  },
  heroOrbMidRight: {
    position: "absolute",
    width: 50,
    height: 50,
    right: 24,
    top: 88,
    opacity: 0.28,
  },
  heroOrbInner: {
    flex: 1,
    borderRadius: 80,
  },
  heroOrbInnerSmall: {
    flex: 1,
    borderRadius: 50,
  },
  heroOrbInnerTiny: {
    flex: 1,
    borderRadius: 25,
  },

  /* Avatar */
  avatarSection: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatarOuterGlow: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    top: -22,
  },
  avatarShadowWrap: {
    borderRadius: 44,
    backgroundColor: "transparent",
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  avatarGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Title */
  titleSection: {
    alignItems: "center",
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    letterSpacing: -0.4,
  },
  welcomeSub: {
    fontSize: 13,
    marginTop: 5,
    letterSpacing: 0.1,
  },

  /* Fields */
  fieldGroup: { marginBottom: 12 },
  label: {
    fontSize: 9.5,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 6,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: { marginRight: 9 },
  input: {
    flex: 1,
    fontSize: 13.5,
    height: "100%",
  },

  /* Options */
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 6,
  },
  checkRow: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkLabel: { fontSize: 12.5 },
  forgotText: { fontSize: 12.5 },

  /* Login button */
  loginBtnWrapper: {
    borderRadius: 13,
    overflow: "hidden",
  },
  loginBtn: {
    height: 48,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 14.5,
    letterSpacing: 0.3,
  },

  /* Register */
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 14,
  },
  registerText: { fontSize: 13 },
  registerLink: { fontSize: 13 },

  /* Legal */
  legalBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 28,
    marginBottom: 20,
  },
  legalBadgeIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  legalBadgeBody: { flex: 1 },
  legalBadgeTitle: {
    fontSize: 12,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  legalText: {
    fontSize: 11.5,
    lineHeight: 17,
  },

  /* Forgot Password Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCenter: {
    width: "100%",
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: { elevation: 14 },
    }),
  },
  modalIconWrap: {
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  modalButtonRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginTop: 22,
  },
  modalSecondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  modalPrimaryWrapper: {
    flex: 1.6,
    borderRadius: 14,
    overflow: "hidden",
  },
  modalPrimaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  modalPrimaryText: {
    color: "#fff",
    fontSize: 14.5,
    letterSpacing: 0.3,
  },
});

const profileStyles = StyleSheet.create({
  demoBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(240,116,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(240,116,0,0.3)",
  },
  demoBadgeText: {
    fontSize: 10,
    color: "#F07400",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 9.5,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
  },
  logoutBtnWrapper: {
    borderRadius: 13,
    overflow: "hidden",
    marginTop: 24,
    marginBottom: 20,
  },
  logoutBtn: {
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  logoutBtnText: {
    fontSize: 14.5,
    letterSpacing: 0.3,
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13.5,
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 42,
  },
  dangerDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  dangerMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  startScreenList: {
    marginTop: 18,
    gap: 8,
  },
  startScreenOption: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  startScreenIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  startScreenLabel: {
    flex: 1,
    fontSize: 14,
  },
});

export default Account;
