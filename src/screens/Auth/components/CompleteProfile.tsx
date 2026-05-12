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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
// @ts-ignore - react-native-flags has no types
import Flag from "react-native-flags";
import { useTheme } from "../../../theme/ThemeContext";
import flashMessage from "../../../modules/flashMessage";
import { registerAndLogin } from "../../../modules/BigParaClient";
import { generateTOTP } from "../../../modules/BigParaClient/totp";
import { login as idealClientLogin } from "../../../modules/IdealClient";
import { transitionOverlayRef } from "../../../modules/transitionOverlay";
import {
  login as setAuthLoading,
  setVoltranTokens,
} from "../modules/auth";
import store from "../../../store";
import CountryPickerModal from "./CountryPickerModal";
import { defaultCountry, Country } from "../data/countries";

const TOTP_SECRET = "JBSWY3DPEHPK3PXP";

// Module-level sabitler.
const ACCENT = "#F07400";
const PRIMARY_BTN_COLORS = ["#F07400", "#FF8C1A"] as const;
const GRADIENT_HORIZONTAL_START = { x: 0, y: 0 } as const;
const GRADIENT_HORIZONTAL_END = { x: 1, y: 0 } as const;

const PRIMARY_BTN_SHADOW = Platform.select({
  ios: {
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  android: { elevation: 6 },
});

const CompleteProfile = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isDark = theme.themeDetail === "dark";

  const email: string = route.params?.email || "";
  const initialUserToken: string = route.params?.userToken || "";
  const password: string = route.params?.password || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(defaultCountry);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  const [agreeETK, setAgreeETK] = useState(false);
  const [agreeContract, setAgreeContract] = useState(false);

  const [loading, setLoading] = useState(false);

  const accent = ACCENT;
  const inputBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)";
  const inputBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const placeholder = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)";
  const subtle = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)";
  const readable = isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.68)";
  const strong = isDark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.82)";
  const text = theme.white;

  const phoneRaw = phone.replace(/\D/g, "");

  const validate = (): string | null => {
    if (!firstName.trim()) return "Ad alanı zorunludur";
    if (!lastName.trim()) return "Soyad alanı zorunludur";
    if (phoneRaw.length > 0 && phoneRaw.length < 7) {
      return "Telefon numarası geçerli değil";
    }
    if (!agreeContract) {
      return "Üyelik Sözleşmesi ve Kullanım Koşulları onayı zorunludur";
    }
    if (!agreeETK) {
      return "ETK Bilgilendirme Metni onayı zorunludur";
    }
    return null;
  };

  const performRegister = async (mismatch: boolean) => {
    const res = await registerAndLogin({
      userName: "",
      email: email.trim(),
      phoneNumber: phoneRaw,
      phoneCountryCode: phoneRaw ? country.dialCode : "",
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userToken: initialUserToken,
      password,
      allowedForInformation: agreeETK,
      allowedForKVKK: agreeContract,
      whichPlatformId: Platform.OS === "ios" ? 3 : 4,
      referrer: "",
      ipAddress: "",
      macAddress: "",
      userNameMismatch: mismatch,
      brandArrivalChannel: null,
      tokenType: 2,
      token: generateTOTP(TOTP_SECRET),
    });

    // 202: UserNameMismatch popup'ı (mevcut Register.tsx:201-226 örüntüsü)
    if (res.status === 202 && !mismatch) {
      setLoading(false);
      // Alert açılırken overlay gizlensin; kullanıcı seçim yapacak.
      transitionOverlayRef.current?.hide();
      Alert.alert(
        "İsim Uyuşmazlığı",
        "Farklı bir mecrada farklı isim/soyisim ile kayıtlı olduğunuz tespit edildi. Devam etmek istiyor musunuz?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Devam",
            onPress: async () => {
              setLoading(true);
              transitionOverlayRef.current?.show();
              try {
                await performRegister(true);
              } catch (e: any) {
                flashMessage({
                  type: "danger",
                  message:
                    e?.response?.data?.errors?.[0] || "Bir hata oluştu",
                });
                setLoading(false);
                transitionOverlayRef.current?.hide();
              }
            },
          },
        ]
      );
      return;
    }

    if (res.data.hasError) {
      flashMessage({
        type: "danger",
        message: res.data.errors?.[0] || "Kayıt sırasında bir hata oluştu",
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
    // Race kondisyonunu kırmak için kısa gecikme (mevcut Register.tsx:250-252 örüntüsü)
    setTimeout(() => {
      idealClientLogin(`usergck_${email.trim()}`, "ColendiMenkul1", true, "0", "0");
    }, 400);
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      flashMessage({ type: "danger", message: err });
      return;
    }

    setLoading(true);
    // Global bigpara overlay'i tap anında göster.
    transitionOverlayRef.current?.show();
    try {
      await performRegister(false);
      // performRegister kendi içinde başarı/hata yollarını yönetiyor.
      // Hata olursa setLoading(false) zaten orada çağrılır, hide()'i de
      // catch bloğunda yapacağız (alttaki catch buraya gelir).
    } catch (error: any) {
      flashMessage({
        type: "danger",
        message: error?.response?.data?.errors?.[0] || "Bir hata oluştu",
      });
      setLoading(false);
      transitionOverlayRef.current?.hide();
    }
  };

  const onPickerClose = useCallback(() => setPickerVisible(false), []);
  const onCountrySelect = useCallback((c: Country) => setCountry(c), []);

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
        <Text style={[s.title, { color: text, fontFamily: theme.boldFont }]}>
          Üyeliğini Tamamla
        </Text>
        <Text
          style={[s.subtitle, { color: readable, fontFamily: theme.regularFont }]}
        >
          Üyeliğinizi tamamlamak için aşağıdaki bilgileri doldurunuz.{" "}
          <Text style={{ color: accent, fontFamily: theme.boldFont }}>(*)</Text>
          'lı alanlar zorunludur.
        </Text>

        {/* Ad */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: subtle, fontFamily: theme.boldFont }]}>
            AD<Text style={{ color: accent }}>*</Text>
          </Text>
          <View
            style={[
              s.inputRow,
              {
                backgroundColor: inputBg,
                borderColor: firstNameFocused ? accent : inputBorder,
              },
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
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: subtle, fontFamily: theme.boldFont }]}>
            SOYAD<Text style={{ color: accent }}>*</Text>
          </Text>
          <View
            style={[
              s.inputRow,
              {
                backgroundColor: inputBg,
                borderColor: lastNameFocused ? accent : inputBorder,
              },
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

        {/* Telefon (ülke kodu seçici + numara) */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: subtle, fontFamily: theme.boldFont }]}>
            TELEFON NUMARASI
          </Text>
          <View style={s.phoneRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setPickerVisible(true)}
              style={[
                s.countryBtn,
                { backgroundColor: inputBg, borderColor: inputBorder },
              ]}
            >
              <Flag code={country.flag} size={24} type="flat" />
              <Text
                style={[
                  s.dialText,
                  { color: text, fontFamily: theme.boldFont },
                ]}
              >
                {country.dialCode}
              </Text>
              <Ionicons name="chevron-down" size={14} color={subtle} />
            </TouchableOpacity>

            <View
              style={[
                s.phoneInputRow,
                {
                  backgroundColor: inputBg,
                  borderColor: phoneFocused ? accent : inputBorder,
                },
              ]}
            >
              <TextInput
                style={[s.input, { color: text, fontFamily: theme.regularFont }]}
                placeholder="5554443322"
                placeholderTextColor={placeholder}
                value={phone}
                onChangeText={(v) => setPhone(v.replace(/\D/g, ""))}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>
        </View>

        {/* Checkbox 1: Üyelik Sözleşmesi & Kullanım Koşulları (allowedForKVKK) */}
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
          <Text
            style={[s.consentText, { color: strong, fontFamily: theme.regularFont }]}
          >
            <Text style={{ color: accent, fontFamily: theme.boldFont }}>
              Üyelik Sözleşmesi
            </Text>{" "}
            ve{" "}
            <Text style={{ color: accent, fontFamily: theme.boldFont }}>
              Kullanım Koşulları
            </Text>
            'nı okudum, onaylıyorum.
          </Text>
        </TouchableOpacity>

        {/* Checkbox 2: ETK Bilgilendirme (allowedForInformation) */}
        <TouchableOpacity
          style={s.consentRow}
          onPress={() => setAgreeETK(!agreeETK)}
          activeOpacity={0.7}
        >
          <View
            style={[
              s.checkbox,
              {
                borderColor: agreeETK ? accent : inputBorder,
                backgroundColor: agreeETK ? accent : "transparent",
              },
            ]}
          >
            {agreeETK && <Ionicons name="checkmark" size={11} color="#fff" />}
          </View>
          <Text
            style={[s.consentText, { color: strong, fontFamily: theme.regularFont }]}
          >
            Kişisel verilerimin Demirören Medya tarafından reklam, promosyon,
            tanıtım vb. ticari elektronik ileti gönderilmek üzere işlenmesini ve
            tarafıma ticari elektronik ileti gönderilmesini,{" "}
            <Text style={{ color: accent, fontFamily: theme.boldFont }}>
              Demirören Medya ETK Bilgilendirme Metni
            </Text>
            'nde açıklanan kurallar çerçevesinde kabul ediyorum.
          </Text>
        </TouchableOpacity>

        {/* Bilgilendirme paragrafları (checkbox değil) */}
        <Text
          style={[s.infoParagraph, { color: readable, fontFamily: theme.regularFont }]}
        >
          Demirören Medya Yatırımları Ticaret Anonim Şirketi tarafından işlenen
          kişisel verileriniz hakkında{" "}
          <Text style={{ color: accent, fontFamily: theme.boldFont }}>
            Üye Aydınlatma Metni
          </Text>
          'ni inceleyebilirsiniz.
        </Text>

        <Text
          style={[s.infoParagraph, { color: readable, fontFamily: theme.regularFont }]}
        >
          Üyelik Sözleşmesini kabul etmeniz halinde; kişisel verilerinizin
          Üyelik Sözleşmesi ile belirlenen Grup Şirketleri'ne ve yurt dışına{" "}
          <Text style={{ color: accent, fontFamily: theme.boldFont }}>
            Açık Rıza Metni
          </Text>{" "}
          kapsamında aktarılmasına açık rıza verdiğiniz kabul edilecektir. Açık
          rıza vermek istememeniz durumunda Grup Şirketleri tarafından sunulan
          hizmetlerden üye olmadan faydalanabilirsiniz.
        </Text>

        {/* Submit */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={s.primaryWrapper}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={PRIMARY_BTN_COLORS}
            start={GRADIENT_HORIZONTAL_START}
            end={GRADIENT_HORIZONTAL_END}
            style={[s.primaryBtn, PRIMARY_BTN_SHADOW]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-done-outline"
                  size={18}
                  color="#fff"
                  style={s.iconRight6}
                />
                <Text style={[s.primaryText, { fontFamily: theme.boldFont }]}>
                  Üyeliğini Tamamla
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
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

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 32,
  },

  // Yardımcı stiller — inline obje üretimini engellemek için.
  iconRight6: { marginRight: 6 },
  title: {
    fontSize: 22,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
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

  /* Phone */
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 10,
    height: 44,
    gap: 6,
  },
  dialText: {
    fontSize: 13.5,
  },
  phoneInputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    height: 44,
  },

  /* Checkboxes */
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 2,
    marginTop: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },
  consentText: { flex: 1, fontSize: 12.5, lineHeight: 18 },

  infoParagraph: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  primaryWrapper: {
    borderRadius: 13,
    overflow: "hidden",
    marginTop: 18,
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

export default CompleteProfile;
