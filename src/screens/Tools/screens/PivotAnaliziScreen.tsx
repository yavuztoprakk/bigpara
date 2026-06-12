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
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../../theme/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { request } from "../../../modules/IdealClient";
import senetsBilgiReq from "../../../modules/IdealClient/request/senetsBilgi";
import pivotAnaliziReq from "../../../modules/IdealClient/request/pivotAnalizi";
import {
  fetchSenetsBilgiStart,
  type SenetBilgi,
} from "../modules/senetsBilgi";
import { fetchPivotAnaliziStart } from "../modules/pivotAnalizi";

const PERIOD_OPTIONS = [
  { key: "5dk", label: "5 Dakikalık", value: "5" },
  { key: "60dk", label: "60 Dakikalık", value: "60" },
  { key: "gunluk", label: "Günlük", value: "G" },
  { key: "aylik", label: "Aylık", value: "A" },
  { key: "yillik", label: "Yıllık", value: "Y" },
];

const FIXED_DATA_TYPE = "P,W,F,C";

const PivotAnaliziScreen = () => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";
  const dispatch = useDispatch();

  const senetsBilgiState = useSelector((state: any) => state.senetsBilgi);
  const { data: senetsList, loading: senetsLoading } = senetsBilgiState ?? {
    data: [],
    loading: false,
  };

  const pivotState = useSelector((state: any) => state.pivotAnalizi);
  const { data: pivotData, loading: pivotLoading } = pivotState ?? {
    data: null,
    loading: false,
  };

  const [selectedSymbol, setSelectedSymbol] = useState<SenetBilgi | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_OPTIONS[0]);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [symbolModalVisible, setSymbolModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const cardBg = isDark
    ? "rgba(255,255,255,0.035)"
    : "rgba(255,255,255,0.95)";
  const cardBorder = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const inputBorder = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(0,0,0,0.08)";
  const subtleText = isDark
    ? "rgba(255,255,255,0.50)"
    : "rgba(0,0,0,0.45)";

  useEffect(() => {
    const needsFetch = senetsBilgiState.prefix !== "FX" || senetsBilgiState.seri !== "";
    if ((senetsList.length === 0 || needsFetch) && !senetsLoading) {
      dispatch(fetchSenetsBilgiStart({ prefix: "FX", seri: "" }));
      request(senetsBilgiReq, "FX", "");
    }
  }, []);

  const sendPivotReq = useCallback(
    (symbol: SenetBilgi, period: string) => {
      const composite = `FX'${symbol.a}`;
      dispatch(fetchPivotAnaliziStart());
      request(pivotAnaliziReq, composite, FIXED_DATA_TYPE, period);
    },
    [dispatch]
  );

  const filteredSenets = useMemo(() => {
    if (!search.trim()) return senetsList;
    const q = search.toUpperCase().trim();
    return senetsList.filter(
      (s: SenetBilgi) =>
        s.a.toUpperCase().includes(q) ||
        (s.f && s.f.toUpperCase().includes(q))
    );
  }, [senetsList, search]);

  const openSymbolModal = () => {
    setSearch("");
    setSymbolModalVisible(true);
  };

  const selectSymbol = (item: SenetBilgi) => {
    setSelectedSymbol(item);
    setSymbolModalVisible(false);
    sendPivotReq(item, selectedPeriod.value);
  };

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
              {
                borderColor: isSelected ? theme.yellow : inputBorder,
              },
            ]}
          >
            {isSelected && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: theme.yellow },
                ]}
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
    [selectedSymbol, theme, inputBorder, subtleText]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ToolMastheadAd />
        {/* Sembol + Periyot yan yana */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.filterCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
            onPress={openSymbolModal}
          >
            <View style={styles.filterLabelRow}>
              <Ionicons name="trending-up-outline" size={13} color={subtleText} />
              <Text style={[styles.filterLabel, { color: subtleText, fontFamily: theme.regularFont }]}>
                Sembol
              </Text>
            </View>
            <View style={styles.filterValueRow}>
              <Text
                style={[styles.filterValue, { color: theme.white, fontFamily: theme.boldFont }]}
                numberOfLines={1}
              >
                {senetsLoading
                  ? "..."
                  : selectedSymbol
                  ? selectedSymbol.a
                  : "Seç"}
              </Text>
              <Ionicons name="chevron-down" size={14} color={theme.gray} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.filterCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
            onPress={() => setPeriodDropdownOpen(!periodDropdownOpen)}
          >
            <View style={styles.filterLabelRow}>
              <Ionicons name="time-outline" size={13} color={subtleText} />
              <Text style={[styles.filterLabel, { color: subtleText, fontFamily: theme.regularFont }]}>
                Periyot
              </Text>
            </View>
            <View style={styles.filterValueRow}>
              <Text
                style={[styles.filterValue, { color: theme.white, fontFamily: theme.boldFont }]}
                numberOfLines={1}
              >
                {selectedPeriod.label}
              </Text>
              <Ionicons
                name={periodDropdownOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color={theme.gray}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Periyot dropdown spacer kaldırıldı — overlay ScrollView dışında */}

        {/* Sonuç alanı */}
        {pivotLoading ? (
          <View
            style={[
              styles.resultCard,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <View style={styles.centerContent}>
              <ActivityIndicator size="small" color={theme.yellow} />
            </View>
          </View>
        ) : pivotData ? (
          <>
            {/* OHLC bilgi kartı */}
            <View
              style={[
                styles.card,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              {[
                { label: "Açılış", value: pivotData.o },
                { label: "Kapanış", value: pivotData.c },
                { label: "Yüksek", value: pivotData.h },
                { label: "Düşük", value: pivotData.l },
              ].map((row, i) => (
                <View key={row.label}>
                  {i > 0 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: cardBorder },
                      ]}
                    />
                  )}
                  <View style={styles.ohlcRow}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.white,
                        fontFamily: theme.boldFont,
                      }}
                    >
                      {row.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.white,
                        fontFamily: theme.regularFont,
                      }}
                    >
                      {row.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Pivot tablosu */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  paddingBottom: 4,
                },
              ]}
            >
              {/* Tablo başlığı */}
              <View
                style={[
                  styles.tableHeaderRow,
                  { borderBottomColor: cardBorder },
                ]}
              >
                <View style={styles.tableLabel} />
                {["Pivot", "Woodie", "Fibonacci", "Camarilla"].map((h) => (
                  <View key={h} style={styles.tableCol}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: theme.yellow,
                        fontFamily: theme.boldFont,
                        textAlign: "center",
                      }}
                    >
                      {h}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Tablo satırları */}
              {["r3", "r2", "r1", "pv", "s1", "s2", "s3"].map(
                (field, rowIdx) => {
                  const rowLabel =
                    field === "pv"
                      ? "Pivot"
                      : field.toUpperCase().replace("R", "R").replace("S", "S");
                  const isResistance = field.startsWith("r");
                  const isSupport = field.startsWith("s");
                  const labelColor = isResistance
                    ? theme.green
                    : isSupport
                    ? theme.red
                    : theme.yellow;
                  const tpOrder = ["P", "W", "F", "C"];

                  return (
                    <View key={field}>
                      {rowIdx > 0 && (
                        <View
                          style={[
                            styles.divider,
                            { backgroundColor: cardBorder, marginHorizontal: 0 },
                          ]}
                        />
                      )}
                      <View style={styles.tableRow}>
                        <View style={styles.tableLabel}>
                          <Text
                            style={{
                              fontSize: 13,
                              color: labelColor,
                              fontFamily: theme.boldFont,
                            }}
                          >
                            {rowLabel}
                          </Text>
                        </View>
                        {tpOrder.map((tp) => {
                          const item = pivotData.list?.find(
                            (x: any) => x.tp === tp
                          );
                          const val = item?.[field];
                          return (
                            <View key={tp} style={styles.tableCol}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: theme.white,
                                  fontFamily: theme.regularFont,
                                  textAlign: "center",
                                }}
                              >
                                {val != null ? val : "-"}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                }
              )}
            </View>

            {/* Açıklama */}
            <View
              style={[
                styles.card,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <Ionicons name="information-circle-outline" size={18} color={theme.yellow} />
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.yellow,
                      fontFamily: theme.boldFont,
                    }}
                  >
                    AÇIKLAMA
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    color: subtleText,
                    fontFamily: theme.regularFont,
                    lineHeight: 22,
                  }}
                >
                  R (Resistance) — Direnç noktasını ifade eder{"\n"}S (Support)
                  — Destek noktasını ifade eder
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View
            style={[
              styles.resultCard,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <View style={styles.centerContent}>
              <Text
                style={{
                  color: subtleText,
                  fontFamily: theme.regularFont,
                  fontSize: 13,
                }}
              >
                {selectedSymbol ? "Veri bekleniyor..." : "Sembol seçin"}
              </Text>
            </View>
          </View>
        )}
        <ToolFooterAd />
      </ScrollView>

      {/* Periyot dropdown modal */}
      {periodDropdownOpen && (
        <TouchableOpacity
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.4)" }]}
          activeOpacity={1}
          onPress={() => setPeriodDropdownOpen(false)}
        >
          <View
            style={[
              styles.periodModal,
              { backgroundColor: isDark ? "#1c1c1e" : "#fff", borderColor: cardBorder },
            ]}
          >
            {PERIOD_OPTIONS.map((option) => {
              const isActive = selectedPeriod.key === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.7}
                  style={[
                    styles.dropdownItem,
                    isActive && { backgroundColor: theme.yellow + "15" },
                  ]}
                  onPress={() => {
                    setSelectedPeriod(option);
                    setPeriodDropdownOpen(false);
                    if (selectedSymbol) {
                      sendPivotReq(selectedSymbol, option.value);
                    }
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: isActive ? theme.yellow : theme.white,
                      fontFamily: isActive
                        ? theme.boldFont
                        : theme.regularFont,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      )}

      {/* Sembol Seçim Modal */}
      <Modal
        visible={symbolModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSymbolModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.darkerBrand },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSymbolModalVisible(false)}>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.gray,
                  fontFamily: theme.regularFont,
                }}
              >
                Vazgeç
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 16,
                color: theme.white,
                fontFamily: theme.boldFont,
              }}
            >
              Sembol Seçimi
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.modalSearchWrapper}>
            <View
              style={[
                styles.modalSearchContainer,
                { backgroundColor: inputBg, borderColor: inputBorder },
              ]}
            >
              <Ionicons name="search-outline" size={18} color={subtleText} />
              <TextInput
                style={[
                  styles.modalSearchInput,
                  { color: theme.white, fontFamily: theme.regularFont },
                ]}
                placeholder="Sembol ara..."
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

          {senetsLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="small" color={theme.yellow} />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  filterCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  filterLabel: { fontSize: 11 },
  filterValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterValue: { fontSize: 14, flex: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },

  periodModal: {
    position: "absolute",
    top: 75,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 11 },

  ohlcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableLabel: { width: 50, paddingLeft: 6 },
  tableCol: { flex: 1, alignItems: "center" },

  resultCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 200,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  centerContent: {
    flex: 1,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
  },

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
  modalLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalRowText: { flex: 1, justifyContent: "center" },
  modalCode: { fontSize: 14, marginBottom: 2 },
  modalName: { fontSize: 11.5 },
  modalSeparator: { height: 1, marginLeft: 50 },
});

export default withToolAds(PivotAnaliziScreen, "pivot-analizi");
