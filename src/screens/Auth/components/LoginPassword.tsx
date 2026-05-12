import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../theme/ThemeContext";
import flashMessage from "../../../modules/flashMessage";
import {
  userLogin,
  initiatePasswordReset,
  verifyPasswordResetOtp,
  completePasswordReset,
} from "../../../modules/BigParaClient";
import { generateTOTP } from "../../../modules/BigParaClient/totp";
import { login as idealClientLogin } from "../../../modules/IdealClient";
import { transitionOverlayRef } from "../../../modules/transitionOverlay";
import {
  login as setAuthLoading,
  setVoltranTokens,
} from "../modules/auth";
import store from "../../../store";

const TOTP_SECRET = "JBSWY3DPEHPK3PXP";

// Module-level sabitler — JSX inline obje üretimini engellemek için.
const ACCENT = "#F07400";
const ORB_TOP_COLORS = ["#FFB978", "#F07400"] as const;
const ORB_BOTTOM_COLORS = ["#FF9D42", "#FF8F27"] as const;
const AVATAR_COLORS = ["#F07400", "#FF9A3C"] as const;
const PRIMARY_BTN_COLORS = ["#F07400", "#FF8C1A"] as const;
const MODAL_ICON_COLORS = ["#F07400", "#FF9A3C"] as const;

const GRADIENT_DIAGONAL_START = { x: 0, y: 0 } as const;
const GRADIENT_DIAGONAL_END = { x: 1, y: 1 } as const;
const GRADIENT_HORIZONTAL_START = { x: 0, y: 0 } as const;
const GRADIENT_HORIZONTAL_END = { x: 1, y: 0 } as const;

// Devam butonu disabled-modu için kısık opaklıkta renk tuple'ı.
const PRIMARY_BTN_COLORS_DISABLED = [
  "rgba(240,116,0,0.45)",
  "rgba(255,140,26,0.45)",
] as const;

// Devam butonu shadow (canSubmit=true iken inline kullanılan) module-level.
const PRIMARY_BTN_SHADOW = Platform.select({
  ios: {
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  android: { elevation: 6 },
});

const buildInitials = (firstName?: string, lastName?: string, email?: string) => {
  const fn = (firstName || "").trim();
  const ln = (lastName || "").trim();
  if (fn || ln) {
    return `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();
  }
  const em = (email || "").trim();
  return em.charAt(0).toUpperCase() || "?";
};

const LoginPassword = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isDark = theme.themeDetail === "dark";

  const email: string = route.params?.email || "";
  const firstName: string = route.params?.firstName || "";
  const lastName: string = route.params?.lastName || "";
  const profileImageUrl: string = route.params?.profileImageUrl || "";
  const isFirstLogin: boolean = !!route.params?.isFirstLogin;

  const greeting = isFirstLogin ? "Hoşgeldin!" : "Tekrardan Hoşgeldin!";
  const fullName = `${firstName} ${lastName}`.trim() || email;
  const initials = buildInitials(firstName, lastName, email);

  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Şifremi Unuttum modal state (Account.tsx eski akış)
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "newPassword">(
    "email"
  );
  const [forgotEmail, setForgotEmail] = useState(email);
  const [forgotEmailFocused, setForgotEmailFocused] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotOtpFocused, setForgotOtpFocused] = useState(false);
  const [forgotUserToken, setForgotUserToken] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotNewPasswordFocused, setForgotNewPasswordFocused] = useState(false);
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const accent = ACCENT;
  const inputBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)";
  const inputBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const placeholder = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)";
  const subtle = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)";
  const readable = isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.68)";
  const strong = isDark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.82)";
  const text = theme.white;
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  // Arka plan gradient renkleri tema değiştiğinde yenilensin.
  const bgGradientColors = useMemo(
    () =>
      [
        isDark ? "rgba(240,116,0,0.06)" : "rgba(240,116,0,0.04)",
        "transparent",
        isDark ? "rgba(240,116,0,0.03)" : "rgba(240,116,0,0.02)",
      ] as const,
    [isDark]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleLogin = async () => {
    if (!password.trim()) {
      flashMessage({ type: "danger", message: "Şifrenizi giriniz" });
      return;
    }
    setLoading(true);
    // Global bigpara overlay'i tap anında göster — kullanıcı doğrudan
    // logo+3 nokta loader'ı görür, buton-içi spinner değil.
    transitionOverlayRef.current?.show();
    try {
      const res = await userLogin({
        email: email.trim(),
        phoneNumber: "",
        phoneCountryCode: "",
        password,
        brandArrivalChannel: null,
        tokenType: 2,
        token: generateTOTP(TOTP_SECRET),
      });

      if (res.data.hasError) {
        flashMessage({
          type: "danger",
          message: res.data.errors?.[0] || "Giriş başarısız",
        });
        setLoading(false);
        transitionOverlayRef.current?.hide();
        return;
      }

      const result = res.data.result!;
      store.dispatch(
        setVoltranTokens({
          voltranUserId: result.id,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          refreshTokenExpireDate: result.refreshTokenExpireDate,
          firstName: result.firstName,
          lastName: result.lastName,
          voltranEmail: result.email,
        })
      );

      store.dispatch(setAuthLoading({ remember: false, demo: false }));
      // Not: Başarı durumunda overlay açık kalır — WebSocket login success
      // + Stack switch sonrası onStateChange mevcut fade-out logic'ine bağlanır.
      setTimeout(() => {
        idealClientLogin(`usergck_${email.trim()}`, "ColendiMenkul1", true, "0", "0");
      }, 400);
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Bir hata oluştu",
      });
      setLoading(false);
      transitionOverlayRef.current?.hide();
    }
  };

  // Şifremi Unuttum akışı (eski Account.tsx ile aynı)
  const resetForgotModal = () => {
    setForgotVisible(false);
    setForgotStep("email");
    setForgotEmail(email);
    setForgotOtp("");
    setForgotUserToken("");
    setForgotNewPassword("");
    setForgotLoading(false);
    setForgotShowPassword(false);
  };

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
        token: generateTOTP(TOTP_SECRET),
      });
      if (res.data.hasError) {
        flashMessage({
          type: "danger",
          message: res.data.errors?.[0] || "Bir hata oluştu",
        });
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
        token: generateTOTP(TOTP_SECRET),
      });
      if (res.data.hasError) {
        flashMessage({
          type: "danger",
          message: res.data.errors?.[0] || "Hatalı OTP kodu",
        });
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
        token: generateTOTP(TOTP_SECRET),
      });
      if (res.data.hasError) {
        flashMessage({
          type: "danger",
          message: res.data.errors?.[0] || "Bir hata oluştu",
        });
        setForgotLoading(false);
        return;
      }
      flashMessage({
        type: "success",
        message: "Şifreniz başarıyla değiştirildi",
      });
      resetForgotModal();
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Bir hata oluştu",
      });
    }
    setForgotLoading(false);
  };

  const handleForgotAction = () => {
    if (forgotStep === "email") handleForgotSubmitEmail();
    else if (forgotStep === "otp") handleForgotSubmitOtp();
    else handleForgotSubmitNewPassword();
  };

  const forgotModalTitle =
    forgotStep === "email"
      ? "Şifremi Unuttum"
      : forgotStep === "otp"
      ? "Doğrulama Kodu"
      : "Yeni Şifre";

  const forgotModalDesc =
    forgotStep === "email"
      ? "Lütfen üyelik sistemine kayıtlı e-posta adresinizi giriniz"
      : forgotStep === "otp"
      ? "E-posta adresinize gönderilen doğrulama kodunu giriniz"
      : "Yeni şifrenizi belirleyiniz";

  const forgotModalIcon =
    forgotStep === "email"
      ? "lock-open-outline"
      : forgotStep === "otp"
      ? "keypad-outline"
      : "key-outline";

  const forgotActionLabel =
    forgotStep === "email"
      ? "Şifremi Sıfırla"
      : forgotStep === "otp"
      ? "Kodu Doğrula"
      : "Şifreyi Güncelle";

  const canSubmit = password.trim().length > 0 && !loading;

  return (
    <KeyboardAvoidingView
      style={[s.container, { backgroundColor: theme.darkerBrand }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Hafif arka plan gradienti — Welcome ile devamlılık */}
      <LinearGradient
        colors={bgGradientColors}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Dekoratif orb'lar — küçük versiyon */}
      <View style={s.orbTopRight} pointerEvents="none">
        <LinearGradient
          colors={ORB_TOP_COLORS}
          start={GRADIENT_DIAGONAL_START}
          end={GRADIENT_DIAGONAL_END}
          style={s.orbInner}
        />
      </View>
      <View style={s.orbBottomLeft} pointerEvents="none">
        <LinearGradient
          colors={ORB_BOTTOM_COLORS}
          start={GRADIENT_DIAGONAL_START}
          end={GRADIENT_DIAGONAL_END}
          style={s.orbInnerSmall}
        />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[s.title, { color: text, fontFamily: theme.boldFont }]}>
          {greeting}
        </Text>
        <Text
          style={[s.subtitle, { color: readable, fontFamily: theme.regularFont }]}
        >
          Hesabına devam etmek için şifreni gir
        </Text>

        <View
          style={[
            s.userCard,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.025)",
            },
          ]}
        >
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={s.avatarImage} />
          ) : (
            <LinearGradient
              colors={AVATAR_COLORS}
              start={GRADIENT_DIAGONAL_START}
              end={GRADIENT_DIAGONAL_END}
              style={s.avatarFallback}
            >
              <Text style={[s.avatarText, { fontFamily: theme.boldFont }]}>
                {initials}
              </Text>
            </LinearGradient>
          )}

          <View style={s.userInfo}>
            <Text
              style={[s.userName, { color: text, fontFamily: theme.boldFont }]}
              numberOfLines={1}
            >
              {fullName.toLocaleUpperCase("tr-TR")}
            </Text>
            <Text
              style={[
                s.userEmail,
                { color: readable, fontFamily: theme.regularFont },
              ]}
              numberOfLines={1}
            >
              {email}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={s.changeBtn}
          >
            <LinearGradient
              colors={PRIMARY_BTN_COLORS}
              start={GRADIENT_DIAGONAL_START}
              end={GRADIENT_DIAGONAL_END}
              style={s.changeBtnInner}
            >
              <Text
                style={[
                  s.changeText,
                  { color: "#fff", fontFamily: theme.boldFont },
                ]}
              >
                Değiştir
              </Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Şifre input */}
        <View style={s.fieldGroup}>
          <View
            style={[
              s.inputRow,
              {
                backgroundColor: inputBg,
                borderColor: passwordFocused ? accent : inputBorder,
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={15}
              color={passwordFocused ? accent : subtle}
              style={s.inputIcon}
            />
            <TextInput
              style={[s.input, { color: text, fontFamily: theme.regularFont }]}
              placeholder="Şifrenizi girin"
              placeholderTextColor={placeholder}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={16}
                color={subtle}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Şifreni mi unuttun? Sıfırla */}
        <View style={s.forgotRow}>
          <View style={s.forgotBadge}>
            <Ionicons name="key-outline" size={12} color="#fff" />
          </View>
          <Text
            style={[
              s.forgotText,
              { color: readable, fontFamily: theme.regularFont },
            ]}
          >
            Şifreni mi unuttun?{" "}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setForgotEmail(email);
              setForgotVisible(true);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={[
                s.forgotLink,
                { color: accent, fontFamily: theme.boldFont },
              ]}
            >
              Sıfırla
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bilgilendirme metni — tek vurgulu sade hâl */}
        <View
          style={[
            s.legalBox,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(0,0,0,0.02)",
              borderColor: cardBorder,
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={15}
            color={accent}
            style={s.iconLegalInfo}
          />
          <Text
            style={[s.legalText, { color: readable, fontFamily: theme.regularFont }]}
          >
            <Text style={{ color: strong, fontFamily: theme.boldFont }}>
              Aydınlatma Metni
            </Text>{" "}
            ve Üyelik Sözleşmesi'nde değişiklik yapılmıştır. Devam etmeniz
            halinde Üyelik Sözleşmesi'ni kabul ettiğiniz ve kişisel
            verilerinizin Grup Şirketleri'ne ve yurt dışına Açık Rıza Metni
            kapsamında aktarılmasına açık rıza verdiğiniz kabul edilecektir.
          </Text>
        </View>

        {/* Devam butonu */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[s.primaryWrapper, !canSubmit && s.disabledOpacity]}
          onPress={handleLogin}
          disabled={!canSubmit}
        >
          <LinearGradient
            colors={canSubmit ? PRIMARY_BTN_COLORS : PRIMARY_BTN_COLORS_DISABLED}
            start={GRADIENT_HORIZONTAL_START}
            end={GRADIENT_HORIZONTAL_END}
            style={[s.primaryBtn, canSubmit ? PRIMARY_BTN_SHADOW : null]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="log-in-outline"
                  size={18}
                  color="#fff"
                  style={s.iconRight8}
                />
                <Text style={[s.primaryText, { fontFamily: theme.boldFont }]}>
                  Devam
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Şifremi Unuttum Modal */}
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
                colors={MODAL_ICON_COLORS}
                start={GRADIENT_DIAGONAL_START}
                end={GRADIENT_DIAGONAL_END}
                style={s.modalIconWrap}
              >
                <Ionicons name={forgotModalIcon as any} size={28} color="#fff" />
              </LinearGradient>

              <Text
                style={[
                  s.modalTitle,
                  { color: text, fontFamily: theme.boldFont },
                ]}
              >
                {forgotModalTitle}
              </Text>
              <Text
                style={[
                  s.modalDesc,
                  { color: readable, fontFamily: theme.regularFont },
                ]}
              >
                {forgotModalDesc}
              </Text>

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
                    style={[
                      s.input,
                      { color: text, fontFamily: theme.regularFont },
                    ]}
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
                    style={[
                      s.input,
                      { color: text, fontFamily: theme.regularFont },
                    ]}
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
                    style={[
                      s.input,
                      { color: text, fontFamily: theme.regularFont },
                    ]}
                    placeholder="Yeni şifreniz"
                    placeholderTextColor={placeholder}
                    value={forgotNewPassword}
                    onChangeText={setForgotNewPassword}
                    onFocus={() => setForgotNewPasswordFocused(true)}
                    onBlur={() => setForgotNewPasswordFocused(false)}
                    secureTextEntry={!forgotShowPassword}
                    autoCapitalize="none"
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
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                      borderColor: inputBorder,
                    },
                  ]}
                >
                  <Ionicons
                    name="arrow-back"
                    size={16}
                    color={readable}
                    style={s.iconRight6}
                  />
                  <Text
                    style={[
                      s.modalSecondaryText,
                      { color: readable, fontFamily: theme.boldFont },
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
                    style={s.modalPrimaryBtn}
                  >
                    {forgotLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons
                          name="send-outline"
                          size={15}
                          color="#fff"
                          style={s.iconRight6}
                        />
                        <Text
                          style={[
                            s.modalPrimaryText,
                            { fontFamily: theme.boldFont },
                          ]}
                        >
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
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 32,
  },

  /* Dekoratif orb'lar — Welcome ekranıyla görsel devamlılık */
  orbTopRight: {
    position: "absolute",
    width: 160,
    height: 160,
    right: -60,
    top: -60,
    opacity: 0.15,
  },
  orbBottomLeft: {
    position: "absolute",
    width: 120,
    height: 120,
    left: -45,
    bottom: 80,
    opacity: 0.12,
  },
  orbInner: {
    flex: 1,
    borderRadius: 80,
  },
  orbInnerSmall: {
    flex: 1,
    borderRadius: 60,
  },

  title: {
    fontSize: 24,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 22,
    letterSpacing: 0.2,
  },

  /* Kullanıcı kartı (önceki userRow yerine) */
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 22,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 1 },
    }),
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  userEmail: {
    fontSize: 12.5,
    marginTop: 2,
  },
  changeBtn: {
    borderRadius: 8,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#F07400",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  changeBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },

  /* Bilgilendirme kutusu */
  legalBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 22,
  },

  /* Input */
  fieldGroup: { marginBottom: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, height: "100%" },

  /* Şifreni mi unuttun */
  forgotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  forgotBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#F07400",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#F07400",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  forgotText: { fontSize: 13 },
  forgotLink: { fontSize: 13 },

  /* Bilgilendirme */
  legalText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  // Yardımcı stiller — inline obje üretimini engellemek için.
  iconRight8: { marginRight: 8 },
  iconRight6: { marginRight: 6 },
  iconLegalInfo: { marginRight: 8, marginTop: 1 },
  disabledOpacity: { opacity: 0.6 },

  /* Devam butonu */
  primaryWrapper: {
    borderRadius: 13,
    overflow: "hidden",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  primaryText: {
    color: "#fff",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  /* Modal */
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

export default LoginPassword;
