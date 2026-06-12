import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// @ts-ignore - react-native-flags has no types
import Flag from "react-native-flags";
import { useNavigation } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { useTheme } from "../../../theme/ThemeContext";
import CountryPickerModal from "../../Auth/components/CountryPickerModal";
import { defaultCountry, Country } from "../../Auth/data/countries";

const ACCENT = "#F07400";
const CONTENT_MAX_WIDTH = 720;

// Voltran BFF destek talebi endpoint'i. Production geçişinde URL güncellenecek.
const SUPPORT_ENDPOINT =
  "https://voltran-bff-test.demirorenmedya.com/api/v1/hurriyet/Contact/SupportCases";

// API `source` parametresi: "5" mobil uygulamayı temsil eder.
const SOURCE_MOBILE = "5";

// Backend her zaman bir `title` bekliyor; UI'de ayrı bir alan istenmediği için sabit.
const SUPPORT_TITLE = "Mobil Uygulama - Destek Talebi";

const MIN_DESCRIPTION_LENGTH = 10;

const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

type SupportResponse = {
  hasError?: boolean;
  errors?: Array<{ description?: string; message?: string } | string>;
};

const BizeYazin = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const isDark = theme.themeDetail === "dark";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<Country>(defaultCountry);
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const horizontalPadding = useMemo(() => {
    if (width > CONTENT_MAX_WIDTH + 36) {
      return (width - CONTENT_MAX_WIDTH) / 2;
    }
    return 18;
  }, [width]);

  const palette = useMemo(() => {
    const text = theme.white;
    const muted = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.72)";
    const subtle = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.42)";
    const placeholder = isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.32)";
    const inputBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)";
    const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    const divider = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    return { text, muted, subtle, placeholder, inputBg, inputBorder, divider };
  }, [isDark, theme.white]);

  const formIsValid = useMemo(
    () =>
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      validateEmail(email.trim()) &&
      phone.trim().length > 0 &&
      description.trim().length >= MIN_DESCRIPTION_LENGTH,
    [firstName, lastName, email, phone, description],
  );

  const onPickerOpen = useCallback(() => setPickerVisible(true), []);
  const onPickerClose = useCallback(() => setPickerVisible(false), []);
  const onCountrySelect = useCallback((c: Country) => {
    setCountry(c);
    setPickerVisible(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (loading) return;

    if (!firstName.trim() || !lastName.trim()) {
      showMessage({ type: "warning", message: "Lütfen ad ve soyadınızı girin." });
      return;
    }
    if (!validateEmail(email.trim())) {
      showMessage({ type: "warning", message: "Geçerli bir e-posta adresi girin." });
      return;
    }
    if (!phone.trim()) {
      showMessage({ type: "warning", message: "Lütfen telefon numaranızı girin." });
      return;
    }
    if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      showMessage({
        type: "warning",
        message: `Mesajınız en az ${MIN_DESCRIPTION_LENGTH} karakter olmalı.`,
      });
      return;
    }

    setLoading(true);

    const body = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      emailAddress: email.trim(),
      areaCode: country.dialCode,
      phone: phone.trim(),
      title: SUPPORT_TITLE,
      description: description.trim(),
      source: SOURCE_MOBILE,
    };

    // Debug: gönderilen body
    console.log("[BizeYazin] POST", SUPPORT_ENDPOINT);
    console.log("[BizeYazin] request body:", body);

    try {
      const response = await fetch(SUPPORT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await response.json().catch(() => null)) as SupportResponse | null;

      // Debug: dönen status + body
      console.log("[BizeYazin] response status:", response.status, response.ok ? "OK" : "FAIL");
      console.log("[BizeYazin] response data:", data);

      if (!response.ok || data?.hasError) {
        const firstError = data?.errors?.[0];
        const errorMessage =
          typeof firstError === "string"
            ? firstError
            : firstError?.description || firstError?.message ||
              "Talebiniz gönderilemedi. Lütfen daha sonra tekrar deneyin.";
        console.log("[BizeYazin] error message shown:", errorMessage);
        showMessage({ type: "danger", message: errorMessage });
        return;
      }

      console.log("[BizeYazin] success - form reset + goBack");
      showMessage({
        type: "success",
        message: "Talebiniz başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.",
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDescription("");
      navigation.goBack();
    } catch (error) {
      // Debug: network hatası
      console.log("[BizeYazin] network error:", error);
      showMessage({
        type: "danger",
        message: "Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.",
      });
    } finally {
      setLoading(false);
    }
  }, [loading, firstName, lastName, email, country.dialCode, phone, description, navigation]);

  const renderLabel = (label: string) => (
    <Text
      style={[
        styles.label,
        { color: palette.subtle, fontFamily: theme.boldFont },
      ]}
    >
      {label}
    </Text>
  );

  const inputStyle = useMemo(
    () => [
      styles.input,
      {
        backgroundColor: palette.inputBg,
        borderColor: palette.inputBorder,
        color: palette.text,
        fontFamily: theme.regularFont,
      },
    ],
    [palette.inputBg, palette.inputBorder, palette.text, theme.regularFont],
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.darkerBrand }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: horizontalPadding },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <Text
          style={[
            styles.title,
            { color: palette.text, fontFamily: theme.boldFont },
          ]}
        >
          Bize Ulaşın
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: palette.muted, fontFamily: theme.regularFont },
          ]}
        >
          Görüş, öneri ve talepleriniz için aşağıdaki formu doldurabilirsiniz.
        </Text>

        <View style={[styles.divider, { backgroundColor: palette.divider }]} />

        {/* Ad - Soyad */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField, { marginRight: 8 }]}>
            {renderLabel("Ad")}
            <TextInput
              style={inputStyle}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Adınız"
              placeholderTextColor={palette.placeholder}
              autoCapitalize="words"
              returnKeyType="next"
              editable={!loading}
            />
          </View>
          <View style={[styles.field, styles.halfField, { marginLeft: 8 }]}>
            {renderLabel("Soyad")}
            <TextInput
              style={inputStyle}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Soyadınız"
              placeholderTextColor={palette.placeholder}
              autoCapitalize="words"
              returnKeyType="next"
              editable={!loading}
            />
          </View>
        </View>

        {/* E-posta */}
        <View style={styles.field}>
          {renderLabel("E-posta")}
          <TextInput
            style={inputStyle}
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@eposta.com"
            placeholderTextColor={palette.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            editable={!loading}
          />
        </View>

        {/* Telefon: ülke kodu + numara */}
        <View style={styles.field}>
          {renderLabel("Telefon")}
          <View style={styles.phoneRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPickerOpen}
              disabled={loading}
              style={[
                styles.countryButton,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                },
              ]}
            >
              <Flag code={country.flag} size={24} type="flat" />
              <Text
                style={[
                  styles.dialCode,
                  { color: palette.text, fontFamily: theme.boldFont },
                ]}
              >
                {country.dialCode}
              </Text>
              <Ionicons name="chevron-down" size={14} color={palette.subtle} />
            </TouchableOpacity>

            <TextInput
              style={[inputStyle, styles.phoneInput]}
              value={phone}
              onChangeText={setPhone}
              placeholder="5xx xxx xx xx"
              placeholderTextColor={palette.placeholder}
              keyboardType="phone-pad"
              returnKeyType="next"
              editable={!loading}
            />
          </View>
        </View>

        {/* Mesaj */}
        <View style={styles.field}>
          {renderLabel("Mesajınız")}
          <TextInput
            style={[
              inputStyle,
              styles.textarea,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Görüş, talep veya sorununuzu detaylı bir şekilde yazınız..."
            placeholderTextColor={palette.placeholder}
            multiline
            textAlignVertical="top"
            editable={!loading}
          />
          <Text
            style={[
              styles.counter,
              { color: palette.subtle, fontFamily: theme.regularFont },
            ]}
          >
            {description.trim().length} karakter
          </Text>
        </View>

        {/* Gönder */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={loading || !formIsValid}
          style={[
            styles.submitButton,
            {
              backgroundColor: loading || !formIsValid ? ACCENT + "80" : ACCENT,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="paper-plane-outline" size={18} color="#fff" />
              <Text
                style={[
                  styles.submitText,
                  { fontFamily: theme.boldFont },
                ]}
              >
                Gönder
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Bilgilendirme metni */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: palette.inputBg,
              borderColor: palette.inputBorder,
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={ACCENT}
            style={styles.infoIcon}
          />
          <Text
            style={[
              styles.infoText,
              { color: palette.muted, fontFamily: theme.regularFont },
            ]}
          >
            Talebiniz destek ekibine iletilir ve en kısa sürede tarafınıza dönüş
            yapılır. KVKK kapsamında paylaştığınız iletişim bilgileri yalnızca
            talebinizin değerlendirilmesi amacıyla işlenir.
          </Text>
        </View>
      </ScrollView>

      <CountryPickerModal
        visible={pickerVisible}
        selectedCode={country.code}
        onClose={onPickerClose}
        onSelect={onCountrySelect}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
  },
  field: {
    marginBottom: 14,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 11.5,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14.5,
  },
  textarea: {
    height: 130,
    paddingTop: 12,
    paddingBottom: 12,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  dialCode: {
    fontSize: 14,
    marginHorizontal: 6,
  },
  phoneInput: {
    flex: 1,
  },
  counter: {
    fontSize: 11,
    marginTop: 6,
    marginLeft: 2,
    alignSelf: "flex-end",
  },
  submitButton: {
    marginTop: 6,
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 15,
    letterSpacing: 0.3,
    marginLeft: 8,
  },
  infoBox: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
  },
});

export default BizeYazin;
