import React, { useState } from "react";
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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as idealClientLogin } from "../../../modules/IdealClient";
import { login as setAuthLoading, resetLogin, setVoltranTokens } from "../../Auth/modules/auth";
import store from "../../../store";
import flashMessage from "../../../modules/flashMessage";
import {
  checkUserExists,
  verifyOTP,
  registerAndLogin,
  reGenerateOTP,
} from "../../../modules/BigParaClient";
import { generateTOTP } from "../../../modules/BigParaClient/totp";

const TOTP_SECRET = "JBSWY3DPEHPK3PXP";

const Register = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isDark = theme.themeDetail === "dark";

  const prefilledEmail = route.params?.email || "";
  const prefilledUserToken = route.params?.userToken || "";

  // Adim kontrolu
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [userToken, setUserToken] = useState(prefilledUserToken);

  // Form alanlari
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [agreeKvkk, setAgreeKvkk] = useState(false);
  const [agreeContract, setAgreeContract] = useState(false);

  // OTP alani
  const [otpCode, setOtpCode] = useState("");
  const [otpFocused, setOtpFocused] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const accent = "#F07400";
  const inputBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)";
  const inputBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const placeholder = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)";
  const subtle = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)";
  const readable = isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.68)";
  const strong = isDark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.82)";
  const text = theme.white;

  // Form -> checkUserExists + otpSend
  const handleFormSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      flashMessage({ type: "danger", message: "Ad ve soyad girilmesi zorunludur" });
      return;
    }
    if (!email.trim()) {
      flashMessage({ type: "danger", message: "E-posta girilmesi zorunludur" });
      return;
    }
    if (!password.trim()) {
      flashMessage({ type: "danger", message: "Şifre girilmesi zorunludur" });
      return;
    }
    if (!agreeKvkk) {
      flashMessage({ type: "danger", message: "Üyelik sözleşmesini onaylamanız gerekmektedir" });
      return;
    }

    setLoading(true);
    try {
      let token = userToken;

      if (!token) {
        // Login'den gelmediyse (dogrudan Register'a geldiyse) checkUserExists cagir
        const totp = generateTOTP(TOTP_SECRET);
        console.log("[VOLTRAN-REGISTER] checkUserExists...");
        const checkRes = await checkUserExists({
          email: email.trim(),
          phoneNumber: "",
          phoneCountryCode: "",
          tokenType: 2,
          token: totp,
        });

        if (checkRes.data.hasError) {
          flashMessage({ type: "danger", message: checkRes.data.errors?.[0] || "Bir hata oluştu" });
          setLoading(false);
          return;
        }

        if (checkRes.data.result?.hasUser) {
          flashMessage({ type: "danger", message: "Bu e-posta ile zaten kayıtlı bir hesap bulunmaktadır. Giriş yapabilirsiniz." });
          setLoading(false);
          return;
        }

        token = checkRes.data.result?.userToken || "";
        setUserToken(token);
      }

      // checkUserExists hasUser=false oldugunda backend otomatik OTP gonderiyor
      console.log("[VOLTRAN-REGISTER] OTP otomatik gonderildi, dogrulama ekranina geciliyor...");
      setStep("otp");
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Bir hata oluştu",
      });
    }
    setLoading(false);
  };

  // OTP dogrula + registerAndLogin
  const handleOtpSubmit = async () => {
    if (!otpCode.trim()) {
      flashMessage({ type: "danger", message: "Doğrulama kodunu giriniz" });
      return;
    }

    setLoading(true);
    try {
      const totp = generateTOTP(TOTP_SECRET);

      // Adim 3: verifyOTP
      console.log("[VOLTRAN-REGISTER] Adım 3: verifyOTP...");
      const verifyRes = await verifyOTP({
        userToken: userToken,
        code: otpCode.trim(),
        tokenType: 2,
        token: totp,
      });

      if (verifyRes.data.hasError) {
        flashMessage({ type: "danger", message: verifyRes.data.errors?.[0] || "Hatalı OTP kodu" });
        setLoading(false);
        return;
      }

      const verifiedToken = verifyRes.data.result?.userToken || userToken;

      await performRegister(verifiedToken, false);
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Bir hata oluştu",
      });
    }
    setLoading(false);
  };

  const performRegister = async (token: string, mismatch: boolean) => {
    const regTotp = generateTOTP(TOTP_SECRET);
    console.log("[VOLTRAN-REGISTER] registerAndLogin...", { mismatch });
    const regRes = await registerAndLogin({
      userName: "",
      email: email.trim(),
      phoneNumber: "",
      phoneCountryCode: "",
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userToken: token,
      password: password,
      allowedForInformation: agreeContract,
      allowedForKVKK: agreeKvkk,
      whichPlatformId: Platform.OS === "ios" ? 3 : 4,
      referrer: "",
      ipAddress: "",
      macAddress: "",
      userNameMismatch: mismatch,
      brandArrivalChannel: null,
      tokenType: 2,
      token: regTotp,
    });

    if (regRes.status === 202 && !mismatch) {
      setLoading(false);
      Alert.alert(
        "İsim Uyuşmazlığı",
        "Farklı bir mecrada farklı isim/soyisim ile kayıtlı olduğunuz tespit edildi. Devam etmek istiyor musunuz?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Devam",
            onPress: async () => {
              setLoading(true);
              try {
                await performRegister(token, true);
              } catch (e: any) {
                flashMessage({
                  type: "danger",
                  message: e?.response?.data?.errors?.[0] || "Bir hata oluştu",
                });
              }
              setLoading(false);
            },
          },
        ]
      );
      return;
    }

    if (regRes.data.hasError) {
      flashMessage({ type: "danger", message: regRes.data.errors?.[0] || "Kayıt sırasında hata oluştu" });
      return;
    }

    const result = regRes.data.result!;
    console.log("[VOLTRAN-REGISTER] Kayıt başarılı, token'lar kaydediliyor...");
    store.dispatch(setVoltranTokens({
      voltranUserId: result.id,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      refreshTokenExpireDate: result.refreshTokenExpireDate,
      firstName: result.firstName,
      lastName: result.lastName,
      voltranEmail: result.email,
    }));

    setStep("success");

    store.dispatch(setAuthLoading({ remember: false, demo: false }));
    const symbolLength =
      (await AsyncStorage.getItem("@symbolDefinationlength")) || "0";
    setTimeout(() => {
      idealClientLogin(email.trim(), password, false, symbolLength, "1");
    }, 400);
  };

  // OTP tekrar gonder
  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await reGenerateOTP({
        otpTypeEmail: "true",
        userToken: userToken,
        phoneNumber: "",
        email: email.trim(),
        phoneCountryCode: "",
      });
      flashMessage({ type: "success", message: "Doğrulama kodu tekrar gönderildi" });
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Kod gönderilemedi",
      });
    }
    setResendLoading(false);
  };

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
        {step === "form" ? (
          <>
            {/* Ad */}
            <View style={s.field}>
              <Text style={[s.label, { color: subtle, fontFamily: theme.boldFont }]}>AD</Text>
              <View
                style={[
                  s.inputRow,
                  { backgroundColor: inputBg, borderColor: firstNameFocused ? accent : inputBorder },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={15}
                  color={firstNameFocused ? accent : subtle}
                  style={s.inputIcon}
                />
                <TextInput
                  style={[s.input, { color: text, fontFamily: theme.regularFont }]}
                  placeholder="Adınız"
                  placeholderTextColor={placeholder}
                  value={firstName}
                  onChangeText={setFirstName}
                  onFocus={() => setFirstNameFocused(true)}
                  onBlur={() => setFirstNameFocused(false)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Soyad */}
            <View style={s.field}>
              <Text style={[s.label, { color: subtle, fontFamily: theme.boldFont }]}>SOYAD</Text>
              <View
                style={[
                  s.inputRow,
                  { backgroundColor: inputBg, borderColor: lastNameFocused ? accent : inputBorder },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={15}
                  color={lastNameFocused ? accent : subtle}
                  style={s.inputIcon}
                />
                <TextInput
                  style={[s.input, { color: text, fontFamily: theme.regularFont }]}
                  placeholder="Soyadınız"
                  placeholderTextColor={placeholder}
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => setLastNameFocused(true)}
                  onBlur={() => setLastNameFocused(false)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* E-Posta */}
            <View style={s.field}>
              <Text style={[s.label, { color: subtle, fontFamily: theme.boldFont }]}>E-POSTA</Text>
              <View
                style={[
                  s.inputRow,
                  { backgroundColor: inputBg, borderColor: emailFocused ? accent : inputBorder },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={15}
                  color={emailFocused ? accent : subtle}
                  style={s.inputIcon}
                />
                <TextInput
                  style={[s.input, { color: prefilledEmail ? subtle : text, fontFamily: theme.regularFont }]}
                  placeholder="mail@bigpara.com"
                  placeholderTextColor={placeholder}
                  value={email}
                  onChangeText={prefilledEmail ? undefined : setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!prefilledEmail}
                />
              </View>
            </View>

            {/* Şifre */}
            <View style={s.field}>
              <Text style={[s.label, { color: subtle, fontFamily: theme.boldFont }]}>ŞİFRE</Text>
              <View
                style={[
                  s.inputRow,
                  { backgroundColor: inputBg, borderColor: passwordFocused ? accent : inputBorder },
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
                  placeholder="••••••••"
                  placeholderTextColor={placeholder}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={15}
                    color={subtle}
                  />
                </TouchableOpacity>
              </View>
              <View style={s.hintRow}>
                <Ionicons name="information-circle-outline" size={12} color={accent} style={{ marginRight: 5, marginTop: 1 }} />
                <Text style={[s.hintText, { color: accent, fontFamily: theme.regularFont }]}>
                  Şifreniz en az 8 karakter olmalıdır. 1 büyük harf, 1 küçük harf, 1 sembol ve 1 sayı içermelidir.
                </Text>
              </View>
            </View>

            {/* Aydınlatma metni */}
            <Text style={[s.privacyText, { color: strong, fontFamily: theme.regularFont }]}>
              Kişisel verilerinizin işlenmesine ilişkin ayrıntılı bilgi için{" "}
              <Text style={{ color: accent, fontFamily: theme.boldFont }}>Aydınlatma Metni</Text>
              'ni inceleyebilirsiniz.
            </Text>

            {/* Checkboxes */}
            <TouchableOpacity
              style={s.consentRow}
              onPress={() => setAgreeKvkk(!agreeKvkk)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  s.checkbox,
                  {
                    borderColor: agreeKvkk ? accent : inputBorder,
                    backgroundColor: agreeKvkk ? accent : "transparent",
                  },
                ]}
              >
                {agreeKvkk && <Ionicons name="checkmark" size={11} color="#fff" />}
              </View>
              <Text style={[s.consentText, { color: strong, fontFamily: theme.regularFont }]}>
                <Text style={{ color: accent, fontFamily: theme.boldFont }}>
                  Üyelik Sözleşmesini & Kullanım Koşullarını
                </Text>{" "}
                okudum onaylıyorum.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.consentRow}
              onPress={() => setAgreeContract(!agreeContract)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  s.checkbox,
                  {
                    borderColor: agreeContract ? accent : inputBorder,
                    backgroundColor: agreeContract ? accent : "transparent",
                  },
                ]}
              >
                {agreeContract && <Ionicons name="checkmark" size={11} color="#fff" />}
              </View>
              <Text style={[s.consentText, { color: strong, fontFamily: theme.regularFont }]}>
                Kampanya ve yeniliklerden haberdar olmak için{" "}
                <Text style={{ color: accent, fontFamily: theme.boldFont }}>
                  Açıklanan Kurallar
                </Text>{" "}
                çerçevesinde elektronik ileti almak istiyorum.
              </Text>
            </TouchableOpacity>

            {/* Devam Et */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={s.primaryWrapper}
              onPress={handleFormSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={["#F07400", "#FF8C1A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  s.primaryBtn,
                  Platform.select({
                    ios: {
                      shadowColor: accent,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                    },
                    android: { elevation: 6 },
                  }),
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={[s.primaryText, { fontFamily: theme.boldFont }]}>Devam Et</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Giriş Yap */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              style={s.ghostBtn}
            >
              <Text style={[s.ghostText, { color: readable, fontFamily: theme.regularFont }]}>
                Hesabın var mı?{" "}
                <Text style={{ color: accent, fontFamily: theme.boldFont }}>Giriş Yap</Text>
              </Text>
            </TouchableOpacity>
          </>
        ) : step === "otp" ? (
          <>
            {/* OTP adimi */}
            <View style={s.otpSection}>
              <View style={s.otpIconWrap}>
                <LinearGradient
                  colors={["#F07400", "#FF9A3C"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.otpIconGradient}
                >
                  <Ionicons name="mail-open-outline" size={32} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={[s.otpTitle, { color: text, fontFamily: theme.boldFont }]}>
                Doğrulama Kodu
              </Text>
              <Text style={[s.otpDesc, { color: readable, fontFamily: theme.regularFont }]}>
                <Text style={{ fontFamily: theme.boldFont }}>{email}</Text> adresine gönderilen
                6 haneli doğrulama kodunu giriniz
              </Text>

              <View style={[s.field, { alignSelf: "stretch" }]}>
                <View
                  style={[
                    s.inputRow,
                    { backgroundColor: inputBg, borderColor: otpFocused ? accent : inputBorder },
                  ]}
                >
                  <Ionicons
                    name="keypad-outline"
                    size={15}
                    color={otpFocused ? accent : subtle}
                    style={s.inputIcon}
                  />
                  <TextInput
                    style={[s.input, { color: text, fontFamily: theme.regularFont, letterSpacing: 4, textAlign: "center" }]}
                    placeholder="000000"
                    placeholderTextColor={placeholder}
                    value={otpCode}
                    onChangeText={setOtpCode}
                    onFocus={() => setOtpFocused(true)}
                    onBlur={() => setOtpFocused(false)}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              {/* Dogrula ve Tamamla */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[s.primaryWrapper, { alignSelf: "stretch" }]}
                onPress={handleOtpSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#F07400", "#FF8C1A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    s.primaryBtn,
                    Platform.select({
                      ios: {
                        shadowColor: accent,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                      },
                      android: { elevation: 6 },
                    }),
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={[s.primaryText, { fontFamily: theme.boldFont }]}>Doğrula ve Tamamla</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Tekrar gonder + Geri */}
              <View style={[s.otpActions, { alignSelf: "stretch" }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleResendOtp}
                  disabled={resendLoading}
                >
                  <Text style={[s.otpActionText, { color: accent, fontFamily: theme.boldFont }]}>
                    {resendLoading ? "Gönderiliyor..." : "Tekrar Gönder"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => { setStep("form"); setOtpCode(""); }}
                >
                  <Text style={[s.otpActionText, { color: readable, fontFamily: theme.regularFont }]}>
                    Geri Dön
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : step === "success" ? (
          <View style={s.successSection}>
            <View style={s.otpIconWrap}>
              <LinearGradient
                colors={["#34C759", "#30D158"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.otpIconGradient}
              >
                <Ionicons name="checkmark-done-outline" size={36} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={[s.otpTitle, { color: text, fontFamily: theme.boldFont }]}>
              Üyelik Oluşturuldu!
            </Text>
            <Text style={[s.otpDesc, { color: readable, fontFamily: theme.regularFont }]}>
              Hesabınız başarıyla oluşturuldu. Yönlendiriliyorsunuz...
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 32 },

  /* Field */
  field: { marginBottom: 12 },
  label: {
    fontSize: 9.5, letterSpacing: 0.7, textTransform: "uppercase",
    marginBottom: 6, marginLeft: 2,
  },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: 11, paddingHorizontal: 12, height: 44,
  },
  inputIcon: { marginRight: 9 },
  input: { flex: 1, fontSize: 13.5, height: "100%" },

  /* Şifre hint */
  hintRow: {
    flexDirection: "row", alignItems: "flex-start",
    marginTop: 6, paddingHorizontal: 2,
  },
  hintText: { flex: 1, fontSize: 11, lineHeight: 16 },

  /* Aydınlatma */
  privacyText: {
    fontSize: 12, lineHeight: 18,
    marginTop: 6, marginBottom: 14, paddingHorizontal: 2,
  },

  /* Checkboxes */
  consentRow: {
    flexDirection: "row", alignItems: "flex-start",
    marginBottom: 11, paddingHorizontal: 2,
  },
  checkbox: {
    width: 18, height: 18, borderRadius: 5, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 0,
  },
  consentText: { flex: 1, fontSize: 12.5, lineHeight: 18 },

  /* Butonlar */
  primaryWrapper: { borderRadius: 13, overflow: "hidden", marginTop: 18 },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    height: 48,
  },
  primaryText: { color: "#fff", fontSize: 14.5, letterSpacing: 0.3 },
  ghostBtn: {
    alignItems: "center", justifyContent: "center", paddingVertical: 14, marginTop: 2,
  },
  ghostText: { fontSize: 13 },

  /* Basari ekrani */
  successSection: { alignItems: "center", paddingTop: 60, flex: 1, justifyContent: "center" },

  /* OTP adimi */
  otpSection: { alignItems: "center", paddingTop: 20 },
  otpIconWrap: { marginBottom: 20 },
  otpIconGradient: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
  },
  otpTitle: { fontSize: 22, letterSpacing: -0.3, marginBottom: 8 },
  otpDesc: { fontSize: 13, lineHeight: 19, textAlign: "center", paddingHorizontal: 10, marginBottom: 24 },
  otpActions: {
    flexDirection: "row", justifyContent: "space-between",
    width: "100%", marginTop: 16, paddingHorizontal: 4,
  },
  otpActionText: { fontSize: 13 },
});

export default Register;
