import React, { useState, useCallback } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../theme/ThemeContext";
import flashMessage from "../../../modules/flashMessage";
import { verifyOTP, reGenerateOTP } from "../../../modules/BigParaClient";
import { generateTOTP } from "../../../modules/BigParaClient/totp";
import { transitionOverlayRef } from "../../../modules/transitionOverlay";

const TOTP_SECRET = "JBSWY3DPEHPK3PXP";
const OTP_LENGTH = 5;

// Module-level sabitler — JSX inline obje üretimini engelle.
const ACCENT = "#F07400";
const ICON_GRADIENT_COLORS = ["#F07400", "#FF9A3C"] as const;
const PRIMARY_BTN_COLORS_ENABLED = ["#F07400", "#FF8C1A"] as const;
const PRIMARY_BTN_COLORS_DISABLED = ["#9aa0a6", "#9aa0a6"] as const;
const GRADIENT_DIAGONAL_START = { x: 0, y: 0 } as const;
const GRADIENT_DIAGONAL_END = { x: 1, y: 1 } as const;
const GRADIENT_HORIZONTAL_START = { x: 0, y: 0 } as const;
const GRADIENT_HORIZONTAL_END = { x: 1, y: 0 } as const;

const ICON_SHADOW = Platform.select({
  ios: {
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  android: { elevation: 8 },
});

const PRIMARY_BTN_SHADOW = Platform.select({
  ios: {
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  android: { elevation: 6 },
});

const OtpVerify = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isDark = theme.themeDetail === "dark";

  const email: string = route.params?.email || "";
  const initialUserToken: string = route.params?.userToken || "";

  const [userToken, setUserToken] = useState(initialUserToken);
  const [otpCode, setOtpCode] = useState("");
  const [otpFocused, setOtpFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const accent = ACCENT;
  const inputBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)";
  const inputBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const placeholder = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)";
  const subtle = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)";
  const readable = isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.68)";
  const text = theme.white;

  const handleVerify = async () => {
    if (otpCode.length !== OTP_LENGTH) {
      flashMessage({
        type: "danger",
        message: `Lütfen ${OTP_LENGTH} haneli doğrulama kodunu giriniz`,
      });
      return;
    }

    setLoading(true);
    // Global bigpara overlay'i tap anında göster — buton-içi spinner yerine
    // logo+3 nokta loader.
    transitionOverlayRef.current?.show();
    try {
      const res = await verifyOTP({
        userToken,
        code: otpCode.trim(),
        tokenType: 2,
        token: generateTOTP(TOTP_SECRET),
      });

      if (res.data.hasError) {
        flashMessage({
          type: "danger",
          message: res.data.errors?.[0] || "Hatalı doğrulama kodu",
        });
        setLoading(false);
        transitionOverlayRef.current?.hide();
        return;
      }

      const verifiedToken = res.data.result?.userToken || userToken;
      setLoading(false);
      // navigation.replace onStateChange'i tetikleyip mevcut overlay fade-out
      // logic'ine bağlanır, hide gerekmiyor.
      navigation.replace("SetPassword", {
        email,
        userToken: verifiedToken,
      });
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Bir hata oluştu",
      });
      setLoading(false);
      transitionOverlayRef.current?.hide();
    }
  };

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await reGenerateOTP({
        otpTypeEmail: "true",
        userToken,
        phoneNumber: "",
        email,
        phoneCountryCode: "",
      });
      if (res.data.hasError) {
        flashMessage({
          type: "danger",
          message: res.data.errors?.[0] || "Kod gönderilemedi",
        });
      } else {
        flashMessage({
          type: "success",
          message: "Doğrulama kodu tekrar gönderildi",
        });
      }
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Kod gönderilemedi",
      });
    }
    setResendLoading(false);
  };

  const handleOtpChange = (value: string) => {
    // Sadece rakam, max OTP_LENGTH hane
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtpCode(digits);
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
        <View style={s.iconWrap}>
          <LinearGradient
            colors={ICON_GRADIENT_COLORS}
            start={GRADIENT_DIAGONAL_START}
            end={GRADIENT_DIAGONAL_END}
            style={[s.iconGradient, ICON_SHADOW]}
          >
            <Ionicons name="mail-open-outline" size={32} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={[s.title, { color: text, fontFamily: theme.boldFont }]}>
          Doğrulama Kodu
        </Text>
        <Text
          style={[s.desc, { color: readable, fontFamily: theme.regularFont }]}
        >
          <Text style={{ fontFamily: theme.boldFont, color: text }}>
            {email}
          </Text>{" "}
          adresine gönderilen{" "}
          <Text style={{ fontFamily: theme.boldFont, color: text }}>
            {OTP_LENGTH} haneli
          </Text>{" "}
          doğrulama kodunu giriniz
        </Text>

        <View style={s.fieldGroup}>
          <View
            style={[
              s.inputRow,
              {
                backgroundColor: inputBg,
                borderColor: otpFocused ? accent : inputBorder,
              },
            ]}
          >
            <Ionicons
              name="keypad-outline"
              size={16}
              color={otpFocused ? accent : subtle}
              style={s.inputIcon}
            />
            <TextInput
              style={[
                s.input,
                {
                  color: text,
                  fontFamily: theme.boldFont,
                  letterSpacing: 8,
                  textAlign: "center",
                  fontSize: 18,
                },
              ]}
              placeholder={"•".repeat(OTP_LENGTH)}
              placeholderTextColor={placeholder}
              value={otpCode}
              onChangeText={handleOtpChange}
              onFocus={() => setOtpFocused(true)}
              onBlur={() => setOtpFocused(false)}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              autoFocus
            />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={s.primaryWrapper}
          onPress={handleVerify}
          disabled={loading || otpCode.length !== OTP_LENGTH}
        >
          <LinearGradient
            colors={
              otpCode.length === OTP_LENGTH
                ? PRIMARY_BTN_COLORS_ENABLED
                : PRIMARY_BTN_COLORS_DISABLED
            }
            start={GRADIENT_HORIZONTAL_START}
            end={GRADIENT_HORIZONTAL_END}
            style={[
              s.primaryBtn,
              otpCode.length === OTP_LENGTH ? PRIMARY_BTN_SHADOW : null,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#fff"
                  style={s.iconRight6}
                />
                <Text style={[s.primaryText, { fontFamily: theme.boldFont }]}>
                  Doğrula
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={s.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleResend}
            disabled={resendLoading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={[
                s.actionPrimary,
                { color: accent, fontFamily: theme.boldFont },
              ]}
            >
              {resendLoading ? "Gönderiliyor..." : "Tekrar Gönder"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={goBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={[
                s.actionGhost,
                { color: readable, fontFamily: theme.regularFont },
              ]}
            >
              Geri Dön
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 32,
    alignItems: "center",
  },
  iconWrap: { marginBottom: 22 },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    letterSpacing: -0.3,
    marginBottom: 10,
    textAlign: "center",
  },
  desc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  fieldGroup: {
    alignSelf: "stretch",
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: "100%" },

  // Yardımcı stiller — inline obje üretimini engellemek için.
  iconRight6: { marginRight: 6 },

  primaryWrapper: {
    alignSelf: "stretch",
    borderRadius: 13,
    overflow: "hidden",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  primaryText: {
    color: "#fff",
    fontSize: 14.5,
    letterSpacing: 0.3,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginTop: 18,
    paddingHorizontal: 4,
  },
  actionPrimary: { fontSize: 13 },
  actionGhost: { fontSize: 13 },
});

export default OtpVerify;
