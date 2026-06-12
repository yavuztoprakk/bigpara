import React, { useState, useMemo, useEffect, useCallback } from "react";
import { withToolAds } from "../../../modules/ads/withToolAds";
import ToolFooterAd from "../../../modules/ads/ToolFooterAd";
import ToolMastheadAd from "../../../modules/ads/ToolMastheadAd";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../../theme/ThemeContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { addYatirim } from "../modules/yatirimlar";
import { request } from "../../../modules/IdealClient";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";
import senetsBilgiReq from "../../../modules/IdealClient/request/senetsBilgi";
import {
  fetchSenetsBilgiStart,
  type SenetBilgi,
} from "../modules/senetsBilgi";

const YeniYatirimScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();

  // Sembol listesi senetsBilgi slice'ından stabil ref ile geliyor — Kademe
  // ekranı ile aynı yapı; canlı akıştan etkilenmediği için modal kilitlenmez.
  const senetsBilgiState = useSelector((state: any) => state.senetsBilgi);
  const { data: senetsList, loading: senetsLoading } = senetsBilgiState ?? {
    data: [],
    loading: false,
  };

  const [selectedSymbol, setSelectedSymbol] = useState<SenetBilgi | null>(
    route.params?.selectedSymbol ?? null
  );
  const [symbolModalVisible, setSymbolModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const [miktar, setMiktar] = useState("");
  const [alisFiyati, setAlisFiyati] = useState("");
  const [miktarFocused, setMiktarFocused] = useState(false);
  const [fiyatFocused, setFiyatFocused] = useState(false);

  const isDark = theme.themeDetail === "dark";
  const accent = "#F07400";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const subtleText = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.40)";
  const readable = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)";

  // Liste hazır değilse defansif fetch (Yatırımlarım açılmadan direkt
  // gelinmesi durumu için).
  useEffect(() => {
    const needsFetch =
      senetsBilgiState.prefix !== "" || senetsBilgiState.seri !== "TUM";
    if ((senetsList.length === 0 || needsFetch) && !senetsLoading) {
      dispatch(fetchSenetsBilgiStart({ prefix: "", seri: "TUM" }));
      request(senetsBilgiReq, "", "TUM");
    }
  }, []);

  const filteredSenets = useMemo(() => {
    if (!search.trim()) return senetsList;
    const q = search.toUpperCase().trim();
    return senetsList.filter(
      (s: SenetBilgi) =>
        s.a.toUpperCase().includes(q) ||
        (s.f && s.f.toUpperCase().includes(q))
    );
  }, [senetsList, search]);

  const openSymbolModal = useCallback(() => {
    setSearch("");
    setSymbolModalVisible(true);
  }, []);

  const selectSymbol = useCallback((item: SenetBilgi) => {
    setSelectedSymbol(item);
    setSymbolModalVisible(false);
    // Seçilen sembole anında subscribe ol — canlı fiyat akışı için.
    if (item.d) request(symbolSend, "", item.d);
  }, []);

  const renderSymbolRow = useCallback(
    ({ item }: { item: SenetBilgi }) => {
      const isSelected = selectedSymbol?.a === item.a;
      return (
        <TouchableOpacity
          style={styles.modalRow}
          activeOpacity={0.6}
          onPress={() => selectSymbol(item)}
        >
          <View
            style={[
              styles.radioOuter,
              { borderColor: isSelected ? accent : inputBorder },
            ]}
          >
            {isSelected && (
              <View
                style={[styles.radioInner, { backgroundColor: accent }]}
              />
            )}
          </View>
          <View style={styles.modalRowText}>
            <Text
              style={[
                styles.modalCode,
                { color: theme.white, fontFamily: theme.boldFont },
              ]}
            >
              {item.a}
            </Text>
            {item.f ? (
              <Text
                style={[
                  styles.modalName,
                  { color: subtleText, fontFamily: theme.regularFont },
                ]}
                numberOfLines={1}
              >
                {item.f}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedSymbol, theme, subtleText, inputBorder, accent, selectSymbol]
  );

  const totalAmount = parseFloat(miktar || "0") * parseFloat(alisFiyati || "0");
  const isFormValid = selectedSymbol && miktar && alisFiyati;

  const handleSave = () => {
    if (!selectedSymbol) {
      Alert.alert("Uyarı", "Lütfen bir sembol seçiniz.");
      return;
    }
    if (!miktar || !alisFiyati) {
      Alert.alert("Uyarı", "Lütfen miktar ve alış fiyatı giriniz.");
      return;
    }

    request(symbolSend, "", selectedSymbol.d);

    const yatirim = {
      sembolKodu: selectedSymbol.a,
      sirketAdi: selectedSymbol.f,
      composite: selectedSymbol.d,
      miktar: parseFloat(miktar),
      alisFiyati: parseFloat(alisFiyati),
    };

    dispatch(addYatirim(yatirim));
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.darkerBrand }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ToolMastheadAd />
        {/* Hero illüstrasyon */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[
              isDark ? "rgba(240,116,0,0.14)" : "rgba(240,116,0,0.08)",
              "transparent",
            ]}
            locations={[0, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[styles.heroIconWrap, {
            backgroundColor: accent,
            ...Platform.select({
              ios: { shadowColor: accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
              android: {},
            }),
          }]}>
            <Ionicons name="trending-up" size={28} color="#fff" />
          </View>
          <Text style={[styles.heroTitle, { color: theme.white, fontFamily: theme.boldFont }]}>
            Yeni Yatırım Ekle
          </Text>
          <Text style={[styles.heroSub, { color: readable, fontFamily: theme.regularFont }]}>
            Portföyünüze yatırım ekleyerek takip edin
          </Text>
        </View>

        {/* Form kartı */}
        <View style={[styles.formCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>

          {/* Sembol seçimi */}
          <Text style={[styles.label, { color: subtleText, fontFamily: theme.boldFont }]}>
            Sembol
          </Text>
          <TouchableOpacity
            style={[
              styles.symbolSelector,
              {
                backgroundColor: inputBg,
                borderColor: selectedSymbol ? accent + "40" : inputBorder,
              },
            ]}
            activeOpacity={0.7}
            onPress={openSymbolModal}
          >
            {selectedSymbol ? (
              <View style={styles.selectedSymbolRow}>
                <View style={[styles.symbolIconWrap, { backgroundColor: accent + "18" }]}>
                  <Ionicons name="analytics-outline" size={16} color={accent} />
                </View>
                <View style={styles.symbolTextWrap}>
                  <Text style={[styles.symbolCode, { color: accent, fontFamily: theme.boldFont }]}>
                    {selectedSymbol.a}
                  </Text>
                  <Text style={[styles.symbolName, { color: readable, fontFamily: theme.regularFont }]} numberOfLines={1}>
                    {selectedSymbol.f}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.placeholderRow}>
                <View style={[styles.symbolIconWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                  <Ionicons name="search-outline" size={16} color={subtleText} />
                </View>
                <Text style={[styles.placeholderText, { color: subtleText, fontFamily: theme.regularFont }]}>
                  Sembol seçimi için tıklayınız
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color={subtleText} />
          </TouchableOpacity>

          {/* Miktar ve Fiyat — yan yana */}
          <View style={styles.fieldsRow}>
            <View style={styles.fieldHalf}>
              <Text style={[styles.label, { color: subtleText, fontFamily: theme.boldFont }]}>
                Miktar (Lot)
              </Text>
              <View style={[
                styles.inputWrap,
                {
                  backgroundColor: inputBg,
                  borderColor: miktarFocused ? accent : inputBorder,
                },
              ]}>
                <Ionicons name="layers-outline" size={16} color={miktarFocused ? accent : subtleText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.white, fontFamily: theme.regularFont }]}
                  placeholder="100"
                  placeholderTextColor={subtleText}
                  value={miktar}
                  onChangeText={setMiktar}
                  onFocus={() => setMiktarFocused(true)}
                  onBlur={() => setMiktarFocused(false)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.fieldHalf}>
              <Text style={[styles.label, { color: subtleText, fontFamily: theme.boldFont }]}>
                Alış Fiyatı (TL)
              </Text>
              <View style={[
                styles.inputWrap,
                {
                  backgroundColor: inputBg,
                  borderColor: fiyatFocused ? accent : inputBorder,
                },
              ]}>
                <Ionicons name="cash-outline" size={16} color={fiyatFocused ? accent : subtleText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.white, fontFamily: theme.regularFont }]}
                  placeholder="25.40"
                  placeholderTextColor={subtleText}
                  value={alisFiyati}
                  onChangeText={setAlisFiyati}
                  onFocus={() => setFiyatFocused(true)}
                  onBlur={() => setFiyatFocused(false)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Toplam tutar kartı */}
        {miktar && alisFiyati ? (
          <View style={[styles.totalCard, {
            backgroundColor: isDark ? "rgba(240,116,0,0.08)" : "rgba(240,116,0,0.05)",
            borderColor: accent + "20",
          }]}>
            <View style={styles.totalLeft}>
              <View style={[styles.totalIconWrap, { backgroundColor: accent + "18" }]}>
                <Ionicons name="wallet-outline" size={18} color={accent} />
              </View>
              <View>
                <Text style={[styles.totalLabel, { color: subtleText, fontFamily: theme.regularFont }]}>
                  Toplam Tutar
                </Text>
                <Text style={[styles.totalValue, { color: accent, fontFamily: theme.boldFont }]}>
                  {totalAmount.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  TL
                </Text>
              </View>
            </View>
            <View style={styles.totalBreakdown}>
              <Text style={[styles.breakdownText, { color: readable, fontFamily: theme.regularFont }]}>
                {miktar} lot x {parseFloat(alisFiyati || "0").toFixed(2)} TL
              </Text>
            </View>
          </View>
        ) : null}

        {/* Kaydet butonu */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={!isFormValid}
          style={[styles.saveBtnWrap, !isFormValid && { opacity: 0.4 }]}
        >
          <LinearGradient
            colors={["#F07400", "#FF8C1A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.saveBtn,
              Platform.select({
                ios: { shadowColor: accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
                android: {},
              }),
            ]}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.saveBtnText, { fontFamily: theme.boldFont }]}>
              Yatırımı Kaydet
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <ToolFooterAd />
      </ScrollView>

      {/* Sembol Seçim Modal — Kademe ile birebir aynı yapı */}
      <Modal
        visible={symbolModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSymbolModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.darkerBrand }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSymbolModalVisible(false)}>
              <Text style={{ fontSize: 14, color: subtleText, fontFamily: theme.regularFont }}>
                Vazgeç
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, color: theme.white, fontFamily: theme.boldFont }}>
              Sembol Seçimi
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.modalSearchWrapper}>
            <View style={[styles.modalSearchContainer, { backgroundColor: inputBg, borderColor: inputBorder }]}>
              <Ionicons name="search-outline" size={18} color={subtleText} />
              <TextInput
                style={[styles.modalSearchInput, { color: theme.white, fontFamily: theme.regularFont }]}
                placeholder="Sembol ara..."
                placeholderTextColor={subtleText}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={18} color={subtleText} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {senetsLoading && senetsList.length === 0 ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="small" color={accent} />
            </View>
          ) : (
            <FlatList
              data={filteredSenets}
              keyExtractor={(item: SenetBilgi) => item.a + item.d}
              renderItem={renderSymbolRow}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.modalSeparator,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.06)",
                    },
                  ]}
                />
              )}
              contentContainerStyle={{ paddingBottom: 32 }}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={30}
              maxToRenderPerBatch={30}
              windowSize={10}
              getItemLayout={(_, index) => ({ length: 56, offset: 56 * index, index })}
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  heroWrap: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 4,
    borderRadius: 20,
    overflow: "hidden",
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 20,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    letterSpacing: 0.1,
  },

  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },

  label: {
    fontSize: 9.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
    marginLeft: 2,
    marginTop: 12,
  },
  symbolSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
  },
  placeholderRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  placeholderText: {
    fontSize: 13,
    marginLeft: 10,
  },
  selectedSymbolRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  symbolIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  symbolTextWrap: {
    flex: 1,
  },
  symbolCode: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  symbolName: {
    fontSize: 11,
    marginTop: 1,
  },

  fieldsRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldHalf: {
    flex: 1,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: "100%",
  },

  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 6,
  },
  totalLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  totalLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  totalValue: {
    fontSize: 18,
    letterSpacing: -0.3,
    marginTop: 1,
  },
  totalBreakdown: {
    alignItems: "flex-end",
  },
  breakdownText: {
    fontSize: 11,
  },

  saveBtnWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 20,
  },
  saveBtn: {
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  // Modal — Kademe ile birebir aynı yapı
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalSearchWrapper: { paddingHorizontal: 16, paddingBottom: 8 },
  modalSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  modalSearchInput: { flex: 1, fontSize: 14, marginLeft: 8, height: "100%" as any },
  modalLoading: { flex: 1, alignItems: "center", justifyContent: "center" },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  modalRowText: { flex: 1, justifyContent: "center" },
  modalCode: { fontSize: 14, marginBottom: 2 },
  modalName: { fontSize: 11.5 },
  modalSeparator: { height: 1, marginLeft: 50 },
});

export default withToolAds(YeniYatirimScreen, "yeni-yatirim");
