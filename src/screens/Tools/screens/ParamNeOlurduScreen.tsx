import React, { useState, useEffect, useMemo, useCallback } from "react";
import { withToolAds } from "../../../modules/ads/withToolAds";
import ToolFooterAd from "../../../modules/ads/ToolFooterAd";
import ToolMastheadAd from "../../../modules/ads/ToolMastheadAd";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../../theme/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { request } from "../../../modules/IdealClient";
import paramNeOlduReq from "../../../modules/IdealClient/request/paramNeOldu";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";
import senetsBilgiReq from "../../../modules/IdealClient/request/senetsBilgi";
import {
  fetchParamNeOlduStart,
  type ParamNeOlduItem,
} from "../modules/paramNeOldu";
import {
  fetchSenetsBilgiStart,
  type SenetBilgi,
} from "../modules/senetsBilgi";
import SymbolLogo from "../../../components/SymbolLogo";
import store from "../../../store";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_SYMBOLS = [
  "IMKBX'XU100",
  "FX'EURTRY",
  "FX'USDTRY",
  "SERPIY'SGLD",
];

const PERIOD_OPTIONS = [
  { key: "bugun", label: "Bugün", value: "G" },
  { key: "hafta", label: "Hafta", value: "H" },
  { key: "ay", label: "Ay", value: "A" },
  { key: "yil", label: "Yıl", value: "Y" },
];

const ACCENT = "#F07400";
const SCREEN_PADDING = 16;

const SymbolCard = ({
  item,
  baseAmount,
  theme,
  isDark,
}: {
  item: ParamNeOlduItem;
  baseAmount: number;
  theme: any;
  isDark: boolean;
}) => {
  const isPositive = item.n >= 0;
  const isZero = item.n === 0;
  const color = isZero ? theme.gray : isPositive ? theme.green : theme.red;
  const code = item.s.split("'")[1] || item.s;
  const delta = item.r - baseAmount;

  const pillBg = isZero
    ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")
    : isPositive
    ? (isDark ? "rgba(76,175,80,0.16)" : "rgba(76,175,80,0.12)")
    : (isDark ? "rgba(244,67,54,0.18)" : "rgba(244,67,54,0.10)");

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  return (
    <View style={[styles.symbolCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <SymbolLogo code={code} size={40} />
      <View style={styles.symbolCardInfo}>
        <Text
          style={[styles.symbolCardCode, { color: theme.headerTint, fontFamily: theme.boldFont }]}
          numberOfLines={1}
        >
          {code}
        </Text>
        <Text
          style={[styles.symbolCardSub, { color: theme.gray, fontFamily: theme.regularFont }]}
          numberOfLines={1}
        >
          {item.s.split("'")[0] || "—"}
        </Text>
      </View>
      <View style={styles.symbolCardValues}>
        <View style={[styles.gainPill, { backgroundColor: pillBg }]}>
          <Ionicons
            name={isZero ? "remove" : isPositive ? "trending-up" : "trending-down"}
            size={11}
            color={color}
            style={{ marginRight: 3 }}
          />
          <Text style={[styles.gainPillText, { color, fontFamily: theme.boldFont }]}>
            {isPositive && !isZero ? "+" : ""}
            {item.n.toFixed(2)}%
          </Text>
        </View>
        <Text style={[styles.amountText, { color: theme.headerTint, fontFamily: theme.boldFont }]}>
          ₺{item.r.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        {!isZero && (
          <Text style={[styles.deltaText, { color, fontFamily: theme.regularFont }]}>
            {delta >= 0 ? "+" : ""}
            ₺{delta.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        )}
      </View>
    </View>
  );
};

const ParamNeOlurduScreen = () => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";
  const dispatch = useDispatch();
  const paramNeOlduState = useSelector((state: any) => state.paramNeOldu);
  const { data, loading } = paramNeOlduState ?? { data: null, loading: false };

  // Sembol listesi Kademe Analizi ile aynı kaynaktan: senetsBilgi slice'ı
  // (REST tek atışlık, canlı akıştan etkilenmez, sort yok → kilitlenme yok).
  const senetsBilgiState = useSelector((state: any) => state.senetsBilgi);
  const { data: senetsList, loading: senetsLoading } = senetsBilgiState ?? {
    data: [],
    loading: false,
  };

  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_OPTIONS[0]);
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("1000");
  const [editingAmount, setEditingAmount] = useState(false);

  useEffect(() => {
    const needsFetch =
      senetsBilgiState.prefix !== "" || senetsBilgiState.seri !== "TUM";
    if ((senetsList.length === 0 || needsFetch) && !senetsLoading) {
      dispatch(fetchSenetsBilgiStart({ prefix: "", seri: "TUM" }));
      request(senetsBilgiReq, "", "TUM");
    }
  }, []);

  const sendReq = useCallback(
    (syms: string[], period: string, p1: string) => {
      dispatch(fetchParamNeOlduStart());
      request(paramNeOlduReq, syms.join(","), period, p1);
    },
    [dispatch]
  );

  useEffect(() => {
    const p1 = amount.replace(/[^0-9]/g, "") || "1000";
    sendReq(symbols, selectedPeriod.value, p1);
  }, [selectedPeriod, symbols, amount]);

  useEffect(() => {
    if (data?.list) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [data]);

  const list: ParamNeOlduItem[] = data?.list ?? [];
  const baseAmount = data?.p1 ?? Number(amount || 1000);

  // Hero özet: toplam getiri, en iyi/en kötü performer
  const summary = useMemo(() => {
    if (list.length === 0) return null;
    const baseAmount = data?.p1 ?? Number(amount || 1000);
    const totalCurrent = list.reduce((s, it) => s + it.r, 0);
    const totalBase = baseAmount * list.length;
    const totalGainPct = totalBase > 0 ? ((totalCurrent - totalBase) / totalBase) * 100 : 0;
    const best = list.reduce((a, b) => (a.n > b.n ? a : b));
    const worst = list.reduce((a, b) => (a.n < b.n ? a : b));
    return { totalGainPct, best, worst };
  }, [list, data, amount]);

  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const inputBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const subtleText = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)";

  const openModal = () => {
    setSearch("");
    setModalVisible(true);
  };

  const selectSymbol = useCallback((item: SenetBilgi) => {
    if (!item.a) return;
    // paramNeOldu API'si "PREFIX'KOD" composite formatı bekler.
    // SenetBilgi.b "Pazar tipi" alanı IMKBH/FX/IMKBX/SERPIY gibi prefix tutar;
    // önce state.symbols'taki kesin composite, yoksa b'+a heuristic.
    const fromSymbols = store.getState().symbols?.[item.a]?.composite;
    const composite = fromSymbols || (item.b ? `${item.b}'${item.a}` : null);
    if (!composite) return;
    setSymbols((prev) => (prev.includes(composite) ? prev : [...prev, composite]));
    setModalVisible(false);
    // Seçilen sembole anında subscribe ol — canlı fiyat akışı için.
    if (item.d) request(symbolSend, "", item.d);
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

  const renderSymbolRow = useCallback(
    ({ item }: { item: SenetBilgi }) => {
      const fromSymbols = store.getState().symbols?.[item.a]?.composite;
      const composite = fromSymbols || (item.b ? `${item.b}'${item.a}` : null);
      const isAdded = composite ? symbols.includes(composite) : false;
      return (
        <TouchableOpacity
          style={styles.modalRow}
          activeOpacity={0.6}
          onPress={() => selectSymbol(item)}
        >
          <SymbolLogo code={item.a} size={32} />
          <View style={styles.modalRowText}>
            <Text style={[styles.modalCode, { color: theme.headerTint, fontFamily: theme.boldFont }]}>
              {item.a}
            </Text>
            {item.f ? (
              <Text
                style={[styles.modalName, { color: subtleText, fontFamily: theme.regularFont }]}
                numberOfLines={1}
              >
                {item.f}
              </Text>
            ) : null}
          </View>
          {isAdded && <Ionicons name="checkmark-circle" size={20} color={theme.green} />}
        </TouchableOpacity>
      );
    },
    [symbols, theme, subtleText, selectSymbol]
  );

  const summaryColor = summary
    ? summary.totalGainPct === 0
      ? theme.gray
      : summary.totalGainPct > 0
      ? theme.green
      : theme.red
    : theme.gray;

  return (
    <View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ToolMastheadAd />
        {/* HERO CARD: Bakiye + Sembol Ekle CTA */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? "rgba(240,116,0,0.10)" : "rgba(240,116,0,0.06)",
              borderColor: isDark ? "rgba(240,116,0,0.22)" : "rgba(240,116,0,0.18)",
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroFlag}>
              <Text style={styles.heroFlagEmoji}>🇹🇷</Text>
            </View>
            <View style={styles.heroBalanceWrap}>
              <Text style={[styles.heroLabel, { color: theme.gray, fontFamily: theme.regularFont }]}>
                Yatırılan Bakiye
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setEditingAmount(true)}>
                {editingAmount ? (
                  <View style={[styles.amountInputWrap, { borderColor: ACCENT }]}>
                    <Text style={[styles.amountPrefix, { color: theme.headerTint, fontFamily: theme.boldFont }]}>₺</Text>
                    <TextInput
                      style={[styles.amountInput, { color: theme.headerTint, fontFamily: theme.boldFont }]}
                      value={amount}
                      onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ""))}
                      keyboardType="numeric"
                      autoFocus
                      selectTextOnFocus
                      onBlur={() => {
                        if (!amount || amount === "0") setAmount("1000");
                        setEditingAmount(false);
                      }}
                      onSubmitEditing={() => {
                        if (!amount || amount === "0") setAmount("1000");
                        setEditingAmount(false);
                      }}
                    />
                  </View>
                ) : (
                  <View style={styles.amountRow}>
                    <Text style={[styles.heroAmount, { color: theme.headerTint, fontFamily: theme.boldFont }]}>
                      ₺{Number(amount || "1000").toLocaleString("tr-TR")}
                    </Text>
                    <Ionicons name="pencil" size={13} color={theme.gray} style={{ marginLeft: 8 }} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroBottom}>
            <View style={styles.heroMeta}>
              <Text style={[styles.heroMetaLabel, { color: theme.gray, fontFamily: theme.regularFont }]}>
                Karşılaştırılan
              </Text>
              <Text style={[styles.heroMetaValue, { color: theme.headerTint, fontFamily: theme.boldFont }]}>
                {symbols.length} varlık
              </Text>
            </View>
            <View style={styles.heroMetaSep} />
            <View style={styles.heroMeta}>
              <Text style={[styles.heroMetaLabel, { color: theme.gray, fontFamily: theme.regularFont }]}>
                Ortalama Getiri
              </Text>
              <Text
                style={[
                  styles.heroMetaValue,
                  { color: summaryColor, fontFamily: theme.boldFont },
                ]}
              >
                {summary
                  ? `${summary.totalGainPct >= 0 ? "+" : ""}${(summary.totalGainPct / list.length).toFixed(2)}%`
                  : "—"}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.heroCta, { backgroundColor: ACCENT }]}
              onPress={openModal}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.heroCtaText}>Sembol Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PERIOD SEGMENTED CHIPS */}
        <View style={styles.periodWrap}>
          <Text style={[styles.periodTitle, { color: theme.gray, fontFamily: theme.regularFont }]}>
            Zaman Aralığı
          </Text>
          <View
            style={[
              styles.periodTrack,
              { backgroundColor: inputBg, borderColor: inputBorder },
            ]}
          >
            {PERIOD_OPTIONS.map((option) => {
              const isActive = selectedPeriod.key === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPeriod(option)}
                  style={[
                    styles.periodChip,
                    isActive && { backgroundColor: ACCENT },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: isActive ? "#FFFFFF" : theme.gray,
                      fontFamily: isActive ? theme.boldFont : theme.regularFont,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SECTION HEADER */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.headerTint, fontFamily: theme.boldFont }]}>
            {selectedPeriod.label} sonunda ne olurdu?
          </Text>
          {summary && (
            <Text style={[styles.sectionHint, { color: theme.gray, fontFamily: theme.regularFont }]}>
              En iyi:{" "}
              <Text style={{ color: theme.green, fontFamily: theme.boldFont }}>
                {summary.best.s.split("'")[1] || summary.best.s}
              </Text>
            </Text>
          )}
        </View>

        {/* SYMBOL CARDS */}
        {loading && list.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={ACCENT} />
          </View>
        ) : list.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="bar-chart-outline" size={36} color={theme.gray} />
            <Text style={[styles.loadingText, { color: theme.gray, fontFamily: theme.regularFont }]}>
              Veri bekleniyor...
            </Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {list.map((item) => (
              <SymbolCard
                key={item.s}
                item={item}
                baseAmount={baseAmount}
                theme={theme}
                isDark={isDark}
              />
            ))}
          </View>
        )}
        <ToolFooterAd />
      </ScrollView>

      {/* Sembol Seçim Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.darkerBrand }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalCancel, { color: theme.gray, fontFamily: theme.regularFont }]}>
                Kapat
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.headerTint, fontFamily: theme.boldFont }]}>
              Sembol Seç
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.modalSearchWrapper}>
            <View style={[styles.modalSearchContainer, { backgroundColor: inputBg, borderColor: inputBorder }]}>
              <Ionicons name="search-outline" size={18} color={subtleText} />
              <TextInput
                style={[styles.modalSearchInput, { color: theme.headerTint, fontFamily: theme.regularFont }]}
                placeholder="Sembol veya şirket adı ara..."
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
              <ActivityIndicator size="small" color={ACCENT} />
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
                    { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" },
                  ]}
                />
              )}
              contentContainerStyle={styles.modalListContent}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={30}
              maxToRenderPerBatch={30}
              windowSize={10}
              getItemLayout={(_, index) => ({ length: 64, offset: 64 * index, index })}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: SCREEN_PADDING, paddingTop: 18, paddingBottom: 40 },

  // HERO CARD
  heroCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 22,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroFlag: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(240,116,0,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroFlagEmoji: { fontSize: 28 },
  heroBalanceWrap: { marginLeft: 14, flex: 1 },
  heroLabel: { fontSize: 11.5, marginBottom: 4, letterSpacing: 0.3 },
  heroAmount: { fontSize: 26, letterSpacing: -0.5 },
  amountRow: { flexDirection: "row", alignItems: "center" },
  amountInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    paddingBottom: 2,
  },
  amountPrefix: { fontSize: 26, marginRight: 2 },
  amountInput: { fontSize: 26, minWidth: 90, padding: 0 },

  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(240,116,0,0.18)",
    marginVertical: 14,
  },
  heroBottom: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroMeta: {
    flex: 1,
  },
  heroMetaLabel: { fontSize: 10.5, marginBottom: 3, letterSpacing: 0.3 },
  heroMetaValue: { fontSize: 14 },
  heroMetaSep: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: "rgba(240,116,0,0.18)",
    marginHorizontal: 12,
  },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 11,
    marginLeft: 12,
  },
  heroCtaText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // PERIOD CHIPS
  periodWrap: { marginBottom: 20 },
  periodTitle: { fontSize: 11, marginBottom: 8, letterSpacing: 0.3 },
  periodTrack: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  periodChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 9,
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: { fontSize: 15, letterSpacing: -0.2 },
  sectionHint: { fontSize: 11 },

  // SYMBOL CARDS
  cardList: { gap: 10 },
  symbolCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  symbolCardInfo: { flex: 1, marginLeft: 12 },
  symbolCardCode: { fontSize: 15, letterSpacing: -0.2 },
  symbolCardSub: { fontSize: 10.5, marginTop: 2 },
  symbolCardValues: {
    alignItems: "flex-end",
  },
  gainPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    marginBottom: 5,
  },
  gainPillText: { fontSize: 12 },
  amountText: { fontSize: 14, letterSpacing: -0.2 },
  deltaText: { fontSize: 11, marginTop: 1 },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 13 },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalCancel: { fontSize: 14 },
  modalTitle: { fontSize: 16 },
  modalSearchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
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
    height: "100%",
  },
  modalLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalListContent: { paddingBottom: 32 },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 64,
    gap: 12,
  },
  modalRowText: {
    flex: 1,
    justifyContent: "center",
  },
  modalCode: { fontSize: 14, marginBottom: 2 },
  modalName: { fontSize: 11.5 },
  modalSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
});

export default withToolAds(ParamNeOlurduScreen, "param-ne-olurdu");
