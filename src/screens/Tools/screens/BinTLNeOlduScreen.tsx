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
  Dimensions,
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
import Svg, { Rect, Line as SvgLine, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCREEN_PADDING = 16;
const CHART_HEIGHT = 200;
const CHART_INNER_PADDING = 16;
const FIXED_AMOUNT = "1000";
const ACCENT = "#F07400";

const DEFAULT_SYMBOLS = [
  "IMKBX'XU100",
  "FX'EURTRY",
  "FX'USDTRY",
  "SERPIY'SGLD",
];

const PERIOD_OPTIONS = [
  { key: "gunluk", label: "Günlük", value: "G" },
  { key: "haftalik", label: "Haftalık", value: "H" },
  { key: "aylik", label: "Aylık", value: "A" },
  { key: "yillik", label: "Yıllık", value: "Y" },
];

const formatTL = (value: number, decimals = 1) =>
  value.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }) + "₺";

const formatTLFull = (value: number) =>
  "₺" +
  value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const BinTLNeOlduScreen = () => {
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

  useEffect(() => {
    const needsFetch =
      senetsBilgiState.prefix !== "" || senetsBilgiState.seri !== "TUM";
    if ((senetsList.length === 0 || needsFetch) && !senetsLoading) {
      dispatch(fetchSenetsBilgiStart({ prefix: "", seri: "TUM" }));
      request(senetsBilgiReq, "", "TUM");
    }
  }, []);

  const sendReq = useCallback(
    (syms: string[], period: string) => {
      dispatch(fetchParamNeOlduStart());
      request(paramNeOlduReq, syms.join(","), period, FIXED_AMOUNT);
    },
    [dispatch]
  );

  useEffect(() => {
    sendReq(symbols, selectedPeriod.value);
  }, [selectedPeriod, symbols]);

  useEffect(() => {
    if (data?.list) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [data]);

  const list: ParamNeOlduItem[] = data?.list ?? [];
  const p1 = data?.p1 ?? 1000;

  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const inputBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const subtleText = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

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

  const removeSymbol = useCallback((composite: string) => {
    setSymbols((prev) => (prev.length > 1 ? prev.filter((s) => s !== composite) : prev));
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

  // Chart hesabı: tüm değerler + 1000TL referansı dahil min/max
  const chartData = useMemo(() => {
    if (list.length === 0) return null;
    const values = list.map((i) => i.r);
    const allValues = [...values, p1];
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = Math.max(maxVal - minVal, p1 * 0.05) || 1;
    const pad = range * 0.25;
    const chartMin = minVal - pad;
    const chartMax = maxVal + pad;
    const chartRange = chartMax - chartMin;
    const availableWidth = SCREEN_WIDTH - SCREEN_PADDING * 2 - CHART_INNER_PADDING * 2;
    const colWidth = availableWidth / list.length;
    const barWidth = Math.min(colWidth * 0.55, 44);
    const refY = ((chartMax - p1) / chartRange) * CHART_HEIGHT;
    return { chartMin, chartMax, chartRange, colWidth, barWidth, refY, availableWidth };
  }, [list, p1]);

  // Özet metrikler
  const summary = useMemo(() => {
    if (list.length === 0) return null;
    const totalCurrent = list.reduce((s, it) => s + it.r, 0);
    const totalBase = p1 * list.length;
    const avgGainPct = totalBase > 0 ? ((totalCurrent - totalBase) / totalBase) * 100 : 0;
    const best = list.reduce((a, b) => (a.r > b.r ? a : b));
    const worst = list.reduce((a, b) => (a.r < b.r ? a : b));
    return { avgGainPct, best, worst };
  }, [list, p1]);

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

  const avgColor = summary
    ? summary.avgGainPct === 0
      ? theme.gray
      : summary.avgGainPct > 0
      ? theme.green
      : theme.red
    : theme.gray;

  return (
    <View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ToolMastheadAd />
        {/* HERO CARD */}
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
              <Text style={[styles.heroAmount, { color: theme.headerTint, fontFamily: theme.boldFont }]}>
                ₺1.000
              </Text>
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
              <Text style={[styles.heroMetaValue, { color: avgColor, fontFamily: theme.boldFont }]}>
                {summary
                  ? `${summary.avgGainPct >= 0 ? "+" : ""}${summary.avgGainPct.toFixed(2)}%`
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

        {/* PERIOD CHIPS */}
        <View style={styles.periodWrap}>
          <Text style={[styles.periodTitle, { color: theme.gray, fontFamily: theme.regularFont }]}>
            Zaman Aralığı
          </Text>
          <View style={[styles.periodTrack, { backgroundColor: inputBg, borderColor: inputBorder }]}>
            {PERIOD_OPTIONS.map((option) => {
              const isActive = selectedPeriod.key === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPeriod(option)}
                  style={[styles.periodChip, isActive && { backgroundColor: ACCENT }]}
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

        {/* CHART CARD */}
        <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.chartHeaderRow}>
            <Text style={[styles.chartTitle, { color: theme.headerTint, fontFamily: theme.boldFont }]}>
              ₺1.000 yatırılsaydı
            </Text>
            <View style={styles.refLegend}>
              <View style={[styles.refDot, { backgroundColor: ACCENT }]} />
              <Text style={[styles.refLegendText, { color: theme.gray, fontFamily: theme.regularFont }]}>
                Referans
              </Text>
            </View>
          </View>

          {loading && list.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={ACCENT} />
            </View>
          ) : list.length === 0 || !chartData ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="bar-chart-outline" size={36} color={theme.gray} />
              <Text style={[styles.loadingText, { color: theme.gray, fontFamily: theme.regularFont }]}>
                Veri bekleniyor...
              </Text>
            </View>
          ) : (
            <>
              {/* Bar üstü değer rozetleri */}
              <View style={styles.valueRow}>
                {list.map((item) => {
                  const isPositive = item.r > p1;
                  const isEqual = Math.abs(item.r - p1) < 0.01;
                  const color = isEqual ? theme.gray : isPositive ? theme.green : theme.red;
                  return (
                    <View
                      key={item.s}
                      style={[styles.valueCell, { width: chartData.colWidth }]}
                    >
                      <Text
                        style={[styles.valueText, { color, fontFamily: theme.boldFont }]}
                        numberOfLines={1}
                      >
                        {formatTL(item.r)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* SVG Bar Chart */}
              <View style={styles.chartArea}>
                <Svg
                  width={chartData.availableWidth}
                  height={CHART_HEIGHT}
                >
                  <Defs>
                    <SvgLinearGradient id="gainGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={theme.green} stopOpacity="0.95" />
                      <Stop offset="1" stopColor={theme.green} stopOpacity="0.55" />
                    </SvgLinearGradient>
                    <SvgLinearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={theme.red} stopOpacity="0.95" />
                      <Stop offset="1" stopColor={theme.red} stopOpacity="0.55" />
                    </SvgLinearGradient>
                    <SvgLinearGradient id="neutralGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop
                        offset="0"
                        stopColor={isDark ? "#9AA0A6" : "#B0B6BC"}
                        stopOpacity="0.85"
                      />
                      <Stop
                        offset="1"
                        stopColor={isDark ? "#9AA0A6" : "#B0B6BC"}
                        stopOpacity="0.45"
                      />
                    </SvgLinearGradient>
                  </Defs>

                  {/* Bars */}
                  {list.map((item, idx) => {
                    const barH = Math.max(
                      ((item.r - chartData.chartMin) / chartData.chartRange) * CHART_HEIGHT,
                      8
                    );
                    const isPositive = item.r > p1;
                    const isEqual = Math.abs(item.r - p1) < 0.01;
                    const colCenter = chartData.colWidth * idx + chartData.colWidth / 2;
                    const barX = colCenter - chartData.barWidth / 2;
                    const barY = CHART_HEIGHT - barH;
                    const gradId = isEqual
                      ? "neutralGrad"
                      : isPositive
                      ? "gainGrad"
                      : "lossGrad";
                    return (
                      <Rect
                        key={item.s}
                        x={barX}
                        y={barY}
                        width={chartData.barWidth}
                        height={barH}
                        rx={chartData.barWidth / 4}
                        fill={`url(#${gradId})`}
                      />
                    );
                  })}

                  {/* Dashed reference line ₺1.000 */}
                  <SvgLine
                    x1={0}
                    y1={chartData.refY}
                    x2={chartData.availableWidth}
                    y2={chartData.refY}
                    stroke={ACCENT}
                    strokeWidth={1.5}
                    strokeDasharray="5,4"
                    opacity={0.9}
                  />
                </Svg>
              </View>

              {/* Sembol etiketleri */}
              <View style={styles.labelRow}>
                {list.map((item) => {
                  const code = item.s.split("'")[1] || item.s;
                  return (
                    <View
                      key={item.s}
                      style={[styles.labelCell, { width: chartData.colWidth }]}
                    >
                      <Text
                        style={[
                          styles.labelText,
                          { color: theme.gray, fontFamily: theme.regularFont },
                        ]}
                        numberOfLines={1}
                      >
                        {code}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* DETAIL LIST */}
        {list.length > 0 && (
          <View style={styles.detailList}>
            {list.map((item) => {
              const code = item.s.split("'")[1] || item.s;
              const isPositive = item.r > p1;
              const isEqual = Math.abs(item.r - p1) < 0.01;
              const color = isEqual ? theme.gray : isPositive ? theme.green : theme.red;
              const pillBg = isEqual
                ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")
                : isPositive
                ? (isDark ? "rgba(76,175,80,0.16)" : "rgba(76,175,80,0.12)")
                : (isDark ? "rgba(244,67,54,0.18)" : "rgba(244,67,54,0.10)");
              const delta = item.r - p1;
              return (
                <View
                  key={item.s}
                  style={[styles.detailCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                >
                  <SymbolLogo code={code} size={36} />
                  <View style={styles.detailInfo}>
                    <Text
                      style={[styles.detailCode, { color: theme.headerTint, fontFamily: theme.boldFont }]}
                      numberOfLines={1}
                    >
                      {code}
                    </Text>
                    <Text
                      style={[styles.detailSub, { color: theme.gray, fontFamily: theme.regularFont }]}
                      numberOfLines={1}
                    >
                      {item.s.split("'")[0] || "—"}
                    </Text>
                  </View>
                  <View style={styles.detailValues}>
                    <View style={[styles.gainPill, { backgroundColor: pillBg }]}>
                      <Ionicons
                        name={isEqual ? "remove" : isPositive ? "trending-up" : "trending-down"}
                        size={11}
                        color={color}
                        style={{ marginRight: 3 }}
                      />
                      <Text style={[styles.gainPillText, { color, fontFamily: theme.boldFont }]}>
                        {isPositive && !isEqual ? "+" : ""}
                        {item.n.toFixed(2)}%
                      </Text>
                    </View>
                    <Text
                      style={[styles.detailAmount, { color: theme.headerTint, fontFamily: theme.boldFont }]}
                    >
                      {formatTLFull(item.r)}
                    </Text>
                    {!isEqual && (
                      <Text style={[styles.detailDelta, { color, fontFamily: theme.regularFont }]}>
                        {delta >= 0 ? "+" : ""}
                        {formatTLFull(delta)}
                      </Text>
                    )}
                  </View>
                  {symbols.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeSymbol(item.s)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={18} color={subtleText} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
        <ToolFooterAd />
      </ScrollView>

      {/* MODAL */}
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
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
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

  // HERO
  heroCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 22,
  },
  heroTop: { flexDirection: "row", alignItems: "center" },
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
  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(240,116,0,0.18)",
    marginVertical: 14,
  },
  heroBottom: { flexDirection: "row", alignItems: "center" },
  heroMeta: { flex: 1 },
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
  heroCtaText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  // PERIOD
  periodWrap: { marginBottom: 16 },
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

  // CHART CARD
  chartCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 16,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  chartTitle: { fontSize: 14, letterSpacing: -0.2 },
  refLegend: { flexDirection: "row", alignItems: "center", gap: 5 },
  refDot: { width: 8, height: 8, borderRadius: 4 },
  refLegendText: { fontSize: 11 },

  valueRow: { flexDirection: "row", marginBottom: 8 },
  valueCell: { alignItems: "center" },
  valueText: { fontSize: 11 },

  chartArea: { alignItems: "center" },

  labelRow: { flexDirection: "row", marginTop: 8 },
  labelCell: { alignItems: "center" },
  labelText: { fontSize: 11 },

  loadingContainer: {
    height: CHART_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 13 },

  // DETAIL LIST
  detailList: { gap: 10 },
  detailCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  detailInfo: { flex: 1, marginLeft: 12 },
  detailCode: { fontSize: 15, letterSpacing: -0.2 },
  detailSub: { fontSize: 10.5, marginTop: 2 },
  detailValues: { alignItems: "flex-end" },
  gainPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    marginBottom: 5,
  },
  gainPillText: { fontSize: 12 },
  detailAmount: { fontSize: 14, letterSpacing: -0.2 },
  detailDelta: { fontSize: 11, marginTop: 1 },
  removeBtn: { marginLeft: 8, padding: 2 },

  // MODAL
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
  modalListContent: { paddingBottom: 32 },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 64,
    gap: 12,
  },
  modalRowText: { flex: 1, justifyContent: "center" },
  modalCode: { fontSize: 14, marginBottom: 2 },
  modalName: { fontSize: 11.5 },
  modalSeparator: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
});

export default withToolAds(BinTLNeOlduScreen, "bintl-ne-oldu");
