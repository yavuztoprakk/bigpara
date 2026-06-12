import React, { useCallback, useEffect, useMemo, useState } from "react";
import { withToolAds } from "../../../modules/ads/withToolAds";
import ToolFooterAd from "../../../modules/ads/ToolFooterAd";
import ToolMastheadAd from "../../../modules/ads/ToolMastheadAd";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { request } from "../../../modules/IdealClient";
import senetsBilgiReq from "../../../modules/IdealClient/request/senetsBilgi";
import {
  fetchSenetsBilgiStart,
  type SenetBilgi,
} from "../modules/senetsBilgi";

const ACCENT = "#F07400";

const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
] as const;

// "1 Haziran 2026" formatı — salt okunur tarih kartı için.
const formatDate = (date: Date): string => {
  const dd = date.getDate();
  const mon = MONTHS_TR[date.getMonth()];
  const yy = date.getFullYear();
  return `${dd} ${mon} ${yy}`;
};

type SortDirection = "asc" | "desc";

const PerformansAnaliziScreen = () => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";
  const dispatch = useDispatch();

  // Sayfa her açılışta bugün/dün — kullanıcı değiştiremez.
  const dates = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return { date1: today, date2: yesterday };
  }, []);

  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [symbolModalVisible, setSymbolModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  // Modal'da düzenleme sırasında geçici seçim — onaylayınca selectedSymbols'a yansır.
  const [draftSymbols, setDraftSymbols] = useState<Set<string>>(new Set());

  const senetsBilgiState = useSelector((state: any) => state.senetsBilgi);
  const { data: senetsList, loading: senetsLoading } = senetsBilgiState ?? {
    data: [],
    loading: false,
  };

  // MaliTablolarScreen ile aynı pattern — hisseleri (IMKBH/E) tek seferde fetch et.
  useEffect(() => {
    const needsFetch =
      senetsBilgiState?.prefix !== "IMKBH" || senetsBilgiState?.seri !== "E";
    if ((senetsList.length === 0 || needsFetch) && !senetsLoading) {
      dispatch(fetchSenetsBilgiStart({ prefix: "IMKBH", seri: "E" }));
      request(senetsBilgiReq, "IMKBH", "E");
    }
  }, []);

  const text = theme.white;
  const muted = isDark ? "rgba(255,255,255,0.62)" : "rgba(0,0,0,0.62)";
  const subtle = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.40)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const inputBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

  const toggleSort = useCallback(() => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const openSymbolModal = useCallback(() => {
    // Modal açılınca mevcut seçimleri taslağa kopyala.
    setDraftSymbols(new Set(selectedSymbols));
    setSearch("");
    setSymbolModalVisible(true);
  }, [selectedSymbols]);

  const closeSymbolModal = useCallback(() => {
    setSymbolModalVisible(false);
  }, []);

  const confirmSymbolSelection = useCallback(() => {
    setSelectedSymbols(Array.from(draftSymbols));
    setSymbolModalVisible(false);
  }, [draftSymbols]);

  const toggleDraftSymbol = useCallback((code: string) => {
    setDraftSymbols((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const removeSymbol = useCallback((code: string) => {
    setSelectedSymbols((prev) => prev.filter((c) => c !== code));
  }, []);

  const filteredSenets = useMemo(() => {
    if (!search.trim()) return senetsList;
    const q = search.toUpperCase().trim();
    return senetsList.filter(
      (s: SenetBilgi) =>
        s.a.toUpperCase().includes(q) || (s.f && s.f.toUpperCase().includes(q))
    );
  }, [senetsList, search]);

  const renderSymbolRow = useCallback(
    ({ item }: { item: SenetBilgi }) => {
      const isSelected = draftSymbols.has(item.a);
      return (
        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.modalRow}
          onPress={() => toggleDraftSymbol(item.a)}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: isSelected ? ACCENT : inputBorder,
                backgroundColor: isSelected ? ACCENT : "transparent",
              },
            ]}
          >
            {isSelected ? (
              <Ionicons name="checkmark" size={14} color="#fff" />
            ) : null}
          </View>
          <View style={styles.modalRowText}>
            <Text
              style={[
                styles.modalCode,
                { color: text, fontFamily: theme.boldFont },
              ]}
            >
              {item.a}
            </Text>
            {item.f ? (
              <Text
                style={[
                  styles.modalName,
                  { color: subtle, fontFamily: theme.regularFont },
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
    [draftSymbols, inputBorder, text, theme.boldFont, theme.regularFont, subtle, toggleDraftSymbol]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ToolMastheadAd />
        {/* Tarih 1 — Bugün (salt okunur) */}
        <ReadOnlyDateRow
          label="Tarih 1"
          value={formatDate(dates.date1)}
          hint="Bugün"
          cardBg={cardBg}
          cardBorder={cardBorder}
          muted={muted}
          text={text}
          subtle={subtle}
          theme={theme}
        />

        {/* Tarih 2 — Dün (salt okunur) */}
        <ReadOnlyDateRow
          label="Tarih 2"
          value={formatDate(dates.date2)}
          hint="Dün"
          cardBg={cardBg}
          cardBorder={cardBorder}
          muted={muted}
          text={text}
          subtle={subtle}
          theme={theme}
        />

        {/* Sıralama */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.row, { backgroundColor: cardBg, borderColor: cardBorder }]}
          onPress={toggleSort}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name={sortDirection === "asc" ? "arrow-up" : "arrow-down"}
              size={16}
              color={ACCENT}
              style={styles.rowIcon}
            />
            <View>
              <Text style={[styles.rowLabel, { color: muted, fontFamily: theme.regularFont }]}>
                Sıralama
              </Text>
              <Text style={[styles.rowValue, { color: text, fontFamily: theme.boldFont }]}>
                {sortDirection === "asc" ? "Artan" : "Azalan"}
              </Text>
            </View>
          </View>
          <Ionicons name="swap-vertical" size={18} color={subtle} />
        </TouchableOpacity>

        {/* Sembol Ekle/Çıkar */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.row, { backgroundColor: cardBg, borderColor: cardBorder }]}
          onPress={openSymbolModal}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="add-circle-outline"
              size={16}
              color={ACCENT}
              style={styles.rowIcon}
            />
            <View>
              <Text style={[styles.rowLabel, { color: muted, fontFamily: theme.regularFont }]}>
                Sembol
              </Text>
              <Text style={[styles.rowValue, { color: text, fontFamily: theme.boldFont }]}>
                {selectedSymbols.length > 0
                  ? `${selectedSymbols.length} sembol seçili`
                  : "Sembol Ekle / Çıkar"}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={subtle} />
        </TouchableOpacity>

        {/* Seçili sembol chip'leri */}
        {selectedSymbols.length > 0 ? (
          <View style={styles.chipsWrap}>
            {selectedSymbols.map((code) => (
              <View
                key={code}
                style={[styles.chip, { backgroundColor: ACCENT + "18", borderColor: ACCENT + "40" }]}
              >
                <Text style={[styles.chipText, { color: ACCENT, fontFamily: theme.boldFont }]}>
                  {code}
                </Text>
                <TouchableOpacity
                  onPress={() => removeSymbol(code)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={styles.chipClose}
                >
                  <Ionicons name="close" size={12} color={ACCENT} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}
        <ToolFooterAd />
      </ScrollView>

      {/* Sembol Seçim Modal — multi-select */}
      <Modal
        visible={symbolModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSymbolModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.darkerBrand }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeSymbolModal}>
              <Text style={{ fontSize: 14, color: muted, fontFamily: theme.regularFont }}>
                Vazgeç
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, color: text, fontFamily: theme.boldFont }}>
              Sembol Seçimi
            </Text>
            <TouchableOpacity onPress={confirmSymbolSelection}>
              <Text style={{ fontSize: 14, color: ACCENT, fontFamily: theme.boldFont }}>
                Onayla
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearchWrapper}>
            <View
              style={[
                styles.modalSearchContainer,
                { backgroundColor: inputBg, borderColor: inputBorder },
              ]}
            >
              <Ionicons name="search-outline" size={18} color={subtle} />
              <TextInput
                style={[
                  styles.modalSearchInput,
                  { color: text, fontFamily: theme.regularFont },
                ]}
                placeholder="Sembol ara..."
                placeholderTextColor={subtle}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {search.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color={subtle} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Seçim sayacı */}
          <View style={styles.modalCounter}>
            <Text style={{ fontSize: 12, color: subtle, fontFamily: theme.regularFont }}>
              {draftSymbols.size} sembol seçili
            </Text>
          </View>

          {senetsLoading ? (
            <View style={styles.modalLoading}>
              <LottieView
                source={require("../../../../assets/lottie/loading-dots.json")}
                autoPlay
                loop
                renderMode="HARDWARE"
                style={{ width: 50, height: 50 }}
              />
            </View>
          ) : (
            <FlatList
              data={filteredSenets}
              keyExtractor={(item: SenetBilgi) => item.a}
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
              getItemLayout={(_, index) => ({
                length: 56,
                offset: 56 * index,
                index,
              })}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

// Salt okunur tarih satırı (Tarih 1 / Tarih 2 ortak görünüm).
const ReadOnlyDateRow: React.FC<{
  label: string;
  value: string;
  hint: string;
  cardBg: string;
  cardBorder: string;
  muted: string;
  text: string;
  subtle: string;
  theme: any;
}> = ({ label, value, hint, cardBg, cardBorder, muted, text, subtle, theme }) => (
  <View style={[styles.row, { backgroundColor: cardBg, borderColor: cardBorder }]}>
    <View style={styles.rowLeft}>
      <Ionicons name="calendar-outline" size={16} color={ACCENT} style={styles.rowIcon} />
      <View>
        <Text style={[styles.rowLabel, { color: muted, fontFamily: theme.regularFont }]}>
          {label}
        </Text>
        <Text style={[styles.rowValue, { color: text, fontFamily: theme.boldFont }]}>
          {value}
        </Text>
      </View>
    </View>
    <View style={styles.hintPill}>
      <Text style={{ fontSize: 11, color: subtle, fontFamily: theme.regularFont }}>
        {hint}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowIcon: { marginRight: 12 },
  rowLabel: { fontSize: 11, letterSpacing: 0.3, marginBottom: 2 },
  rowValue: { fontSize: 14.5 },
  hintPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(240,116,0,0.10)",
  },

  // Seçili sembol chip'leri
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12.5, letterSpacing: 0.3 },
  chipClose: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  // Sembol modal
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
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    height: "100%" as any,
  },
  modalCounter: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  modalLoading: { flex: 1, alignItems: "center", justifyContent: "center" },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalRowText: { flex: 1, justifyContent: "center" },
  modalCode: { fontSize: 14, marginBottom: 2 },
  modalName: { fontSize: 11.5 },
  modalSeparator: { height: 1, marginLeft: 50 },
});

export default withToolAds(PerformansAnaliziScreen, "performans-analizi");
