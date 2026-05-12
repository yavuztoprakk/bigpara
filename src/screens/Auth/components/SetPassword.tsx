import React, { useMemo, useState, useCallback } from "react";
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

// Module-level sabitler.
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

interface PasswordRules {
  minLength: boolean;
  upper: boolean;
  lower: boolean;
  digit: boolean;
  special: boolean;
  matches: boolean;
}

const evaluate = (password: string, confirm: string): PasswordRules => ({
  minLength: password.length >= 8,
  upper: /[A-Z]/.test(password),
  lower: /[a-z]/.test(password),
  digit: /\d/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
  matches: password.length > 0 && password === confirm,
});

const allPassed = (r: PasswordRules) =>
  r.minLength && r.upper && r.lower && r.digit && r.special && r.matches;

const SetPassword = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isDark = theme.themeDetail === "dark";

  const email: string = route.params?.email || "";
  const userToken: string = route.params?.userToken || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const accent = ACCENT;
  const inputBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)";
  const inputBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const placeholder = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)";
  const subtle = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)";
  const readable = isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.68)";
  const text = theme.white;
  const okColor = theme.green;

  const rules = useMemo(() => evaluate(password, confirm), [password, confirm]);
  const passed = allPassed(rules);

  const handleSubmit = () => {
    if (!passed) {
      flashMessage({
        type: "danger",
        message: "Lütfen şifre kurallarını kontrol ediniz",
      });
      return;
    }
    setLoading(true);
    // Lokal validasyon, API çağrısı yok. Sonraki ekrana parametrelerle geç.
    navigation.navigate("CompleteProfile", {
      email,
      userToken,
      password,
    });
    setTimeout(() => setLoading(false), 250);
  };

  const renderRule = useCallback(
    (label: string, ok: boolean) => (
      <View style={s.ruleRow}>
        <Ionicons
          name={ok ? "checkmark-circle" : "ellipse-outline"}
          size={14}
          color={ok ? okColor : subtle}
          style={s.iconRight8}
        />
        <Text
          style={[
            s.ruleText,
            {
              color: ok ? okColor : readable,
              fontFamily: ok ? theme.boldFont : theme.regularFont,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    ),
    [okColor, subtle, readable, theme.boldFont, theme.regularFont]
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
        <View style={s.iconWrap}>
          <LinearGradient
            colors={ICON_GRADIENT_COLORS}
            start={GRADIENT_DIAGONAL_START}
            end={GRADIENT_DIAGONAL_END}
            style={[s.iconGradient, ICON_SHADOW]}
          >
            <Ionicons name="key-outline" size={30} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={[s.title, { color: text, fontFamily: theme.boldFont }]}>
          Şifre Belirle
        </Text>
        <Text
          style={[s.desc, { color: readable, fontFamily: theme.regularFont }]}
        >
          Hesabınız için güvenli bir şifre oluşturun.
        </Text>

        {/* Şifre */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: subtle, fontFamily: theme.boldFont }]}>
            ŞİFRE
          </Text>
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
              placeholder="••••••••"
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
                size={15}
                color={subtle}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tekrar Şifre */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: subtle, fontFamily: theme.boldFont }]}>
            ŞİFRE TEKRAR
          </Text>
          <View
            style={[
              s.inputRow,
              {
                backgroundColor: inputBg,
                borderColor: confirmFocused ? accent : inputBorder,
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={15}
              color={confirmFocused ? accent : subtle}
              style={s.inputIcon}
            />
            <TextInput
              style={[s.input, { color: text, fontFamily: theme.regularFont }]}
              placeholder="••••••••"
              placeholderTextColor={placeholder}
              value={confirm}
              onChangeText={setConfirm}
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => setConfirmFocused(false)}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(!showConfirm)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showConfirm ? "eye-outline" : "eye-off-outline"}
                size={15}
                color={subtle}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Kural listesi */}
        <View style={s.rulesBox}>
          {renderRule("En az 8 karakter", rules.minLength)}
          {renderRule("Büyük harf içermeli", rules.upper)}
          {renderRule("Küçük harf içermeli", rules.lower)}
          {renderRule("Sayı içermeli", rules.digit)}
          {renderRule("Özel karakter içermeli", rules.special)}
          {renderRule("Şifreler eşleşmeli", rules.matches)}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={s.primaryWrapper}
          onPress={handleSubmit}
          disabled={loading || !passed}
        >
          <LinearGradient
            colors={passed ? PRIMARY_BTN_COLORS_ENABLED : PRIMARY_BTN_COLORS_DISABLED}
            start={GRADIENT_HORIZONTAL_START}
            end={GRADIENT_HORIZONTAL_END}
            style={[s.primaryBtn, passed ? PRIMARY_BTN_SHADOW : null]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={[s.primaryText, { fontFamily: theme.boldFont }]}>
                  Devam Et
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#fff"
                  style={s.iconLeft6}
                />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 32,
  },
  iconWrap: {
    alignSelf: "center",
    marginBottom: 18,
  },
  iconGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    letterSpacing: -0.3,
    textAlign: "center",
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 10,
    marginBottom: 22,
  },
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
  input: { flex: 1, fontSize: 13.5, height: "100%" },

  rulesBox: {
    marginTop: 4,
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
  },
  ruleText: { fontSize: 12.5, lineHeight: 18 },

  // Yardımcı stiller — inline obje üretimini engelle.
  iconRight8: { marginRight: 8 },
  iconLeft6: { marginLeft: 6 },

  primaryWrapper: {
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
});

export default SetPassword;
