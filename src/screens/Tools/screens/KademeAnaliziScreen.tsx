import React, { useState, useEffect, useMemo, useCallback } from "react";
import { withToolAds } from "../../../modules/ads/withToolAds";
import ToolFooterAd from "../../../modules/ads/ToolFooterAd";
import ToolMastheadAd from "../../../modules/ads/ToolMastheadAd";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../../theme/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { request } from "../../../modules/IdealClient";
import senetsBilgiReq from "../../../modules/IdealClient/request/senetsBilgi";
import symbolLevelStatsReq from "../../../modules/IdealClient/request/symbolLevelStats";
import {
  fetchSenetsBilgiStart,
  type SenetBilgi,
} from "../modules/senetsBilgi";
import { fetchKademeStart, type KademeLevel } from "../modules/kademeAnalizi";

const INTERVAL_OPTIONS = [
  { key: "gun", label: "Gün", value: "G" },
  { key: "1dk", label: "1 Dk", value: "1" },
  { key: "2dk", label: "2 Dk", value: "2" },
  { key: "5dk", label: "5 Dk", value: "5" },
  { key: "10dk", label: "10 Dk", value: "10" },
  { key: "30dk", label: "30 Dk", value: "30" },
  { key: "60dk", label: "60 Dk", value: "60" },
  { key: "s1", label: "1. Seans", value: "S1" },
  { key: "s2", label: "2. Seans", value: "S2" },
];

const formatLot = (raw: string): string => {
  if (!raw) return "-";
  const num = parseInt(raw.replace(/,/g, ""), 10);
  if (isNaN(num)) return raw;
  return num.toLocaleString("tr-TR");
};

const computeSummary = (data: KademeLevel[]) => {
  let volume = 0;
  let totalLot = 0;
  let buyLot = 0;
  let sellLot = 0;

  data.forEach((level) => {
    const lot = parseInt((level.lot || "0").replace(/,/g, ""), 10);
    const price = parseFloat((level.price || "0").replace(",", "."));
    const buy = parseInt(level.buy || "0", 10);
    const sell = parseInt(level.sell || "0", 10);

    totalLot += lot;
    volume += lot * price;
    buyLot += (lot * buy) / 100;
    sellLot += (lot * sell) / 100;
  });

  const wavg = totalLot > 0 ? volume / totalLot : 0;
  const diffLot = buyLot - sellLot;
  const diffPct = totalLot > 0 ? (Math.abs(diffLot) / totalLot) * 100 : 0;

  return {
    volume: Math.round(volume),
    totalLot: Math.round(totalLot),
    wavg,
    buyLot: Math.round(buyLot),
    sellLot: Math.round(sellLot),
    diffLot: Math.round(diffLot),
    diffPct,
  };
};

const KademeAnaliziScreen = () => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";
  const dispatch = useDispatch();

  const senetsBilgiState = useSelector((state: any) => state.senetsBilgi);
  const { data: senetsList, loading: senetsLoading } = senetsBilgiState ?? {
    data: [],
    loading: false,
  };

  const kademeState = useSelector((state: any) => state.kademeAnalizi);
  const { data: kademeData, loading: kademeLoading } = kademeState ?? {
    data: [],
    loading: false,
  };

  const [selectedSymbol, setSelectedSymbol] = useState<SenetBilgi | null>(null);
  const [selectedInterval, setSelectedInterval] = useState(INTERVAL_OPTIONS[0]);
  const [intervalDropdownOpen, setIntervalDropdownOpen] = useState(false);
  const [symbolModalVisible, setSymbolModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.95)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const inputBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const subtleText = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)";

  const summary = useMemo(() => {
    if (kademeData.length === 0) return null;
    return computeSummary(kademeData);
  }, [kademeData]);

  useEffect(() => {
    const needsFetch = senetsBilgiState.prefix !== "IMKBH" || senetsBilgiState.seri !== "";
    if ((senetsList.length === 0 || needsFetch) && !senetsLoading) {
      dispatch(fetchSenetsBilgiStart({ prefix: "IMKBH", seri: "" }));
      request(senetsBilgiReq, "IMKBH", "");
    }
  }, []);

  const sendLevelStatsReq = useCallback(
    (symbol: SenetBilgi, interval: string) => {
      const composite = `IMKBH'${symbol.a}`;
      dispatch(fetchKademeStart());
      request(symbolLevelStatsReq, composite, interval);
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

  const selectSymbol = (item: SenetBilgi) => {
    setSelectedSymbol(item);
    setSymbolModalVisible(false);
    sendLevelStatsReq(item, selectedInterval.value);
  };

  const renderHeader = () => (
    <View style={[styles.headerRow, { borderBottomColor: cardBorder, backgroundColor: theme.darkerBrand }]}>
      <Text style={[styles.hCol, styles.colPrice, { color: theme.yellow, fontFamily: theme.boldFont }]}>Fiyat</Text>
      <Text style={[styles.hCol, styles.colLot, { color: theme.yellow, fontFamily: theme.boldFont }]}>Lot</Text>
      <Text style={[styles.hCol, styles.colPct, { color: theme.yellow, fontFamily: theme.boldFont }]}>%</Text>
      <Text style={[styles.hCol, styles.colBuy, { color: theme.yellow, fontFamily: theme.boldFont }]}>A%</Text>
      <Text style={[styles.hCol, styles.colSell, { color: theme.yellow, fontFamily: theme.boldFont }]}>S%</Text>
    </View>
  );

  const renderRow = useCallback(
    ({ item, index }: { item: KademeLevel; index: number }) => {
      const buyNum = parseFloat((item.buy || "0").replace(",", "."));
      const sellNum = parseFloat((item.sell || "0").replace(",", "."));
      const isBuyDominant = buyNum > sellNum;

      return (
        <View
          style={[
            styles.dataRow,
            { borderBottomColor: cardBorder },
            index % 2 === 0 && { backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" },
          ]}
        >
          <Text style={[styles.cell, styles.colPrice, { color: theme.white, fontFamily: theme.boldFont }]}>
            {item.price}
          </Text>
          <Text style={[styles.cell, styles.colLot, { color: theme.yellow, fontFamily: theme.regularFont }]}>
            {formatLot(item.lot)}
          </Text>
          <Text style={[styles.cell, styles.colPct, { color: theme.white, fontFamily: theme.regularFont }]}>
            {item.percent}
          </Text>
          <Text
            style={[
              styles.cell,
              styles.colBuy,
              { color: isBuyDominant ? theme.green : subtleText, fontFamily: theme.regularFont },
            ]}
          >
            {item.buy}
          </Text>
          <Text
            style={[
              styles.cell,
              styles.colSell,
              { color: !isBuyDominant ? theme.red : subtleText, fontFamily: theme.regularFont },
            ]}
          >
            {item.sell}
          </Text>
        </View>
      );
    },
    [theme, cardBorder, isDark, subtleText]
  );

  const renderSymbolRow = useCallback(
    ({ item }: { item: SenetBilgi }) => {
      const isSelected = selectedSymbol?.a === item.a;
      return (
        <TouchableOpacity style={styles.modalRow} activeOpacity={0.6} onPress={() => selectSymbol(item)}>
          <View style={[styles.radioOuter, { borderColor: isSelected ? theme.yellow : inputBorder }]}>
            {isSelected && <View style={[styles.radioInner, { backgroundColor: theme.yellow }]} />}
          </View>
          <View style={styles.modalRowText}>
            <Text style={[styles.modalCode, { color: theme.white, fontFamily: theme.boldFont }]}>{item.a}</Text>
            {item.f ? (
              <Text style={[styles.modalName, { color: subtleText, fontFamily: theme.regularFont }]} numberOfLines={1}>
                {item.f}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedSymbol, theme, inputBorder, subtleText]
  );

  // Sembol + Periyot filtre çubuğu — masthead'in altında her state'te ortak göstermek için.
  const filterBar = (
    <View style={styles.filterRow}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.filterCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
        onPress={() => { setSearch(""); setSymbolModalVisible(true); }}
      >
        <Text style={[styles.filterLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Sembol</Text>
        <View style={styles.filterValueRow}>
          <Text
            style={[styles.filterValue, { color: theme.white, fontFamily: theme.boldFont }]}
            numberOfLines={1}
          >
            {senetsLoading ? "..." : selectedSymbol ? selectedSymbol.a : "Seç"}
          </Text>
          <Ionicons name="chevron-down" size={14} color={theme.gray} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.filterCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
        onPress={() => setIntervalDropdownOpen(!intervalDropdownOpen)}
      >
        <Text style={[styles.filterLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Periyot</Text>
        <View style={styles.filterValueRow}>
          <Text
            style={[styles.filterValue, { color: theme.white, fontFamily: theme.boldFont }]}
            numberOfLines={1}
          >
            {selectedInterval.label}
          </Text>
          <Ionicons
            name={intervalDropdownOpen ? "chevron-up" : "chevron-down"}
            size={14}
            color={theme.gray}
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
      {/* İçerik */}
      {kademeLoading ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <ToolMastheadAd />
          {filterBar}
          <View style={styles.centerContent}>
            <ActivityIndicator size="small" color={theme.yellow} />
          </View>
          <ToolFooterAd />
        </ScrollView>
      ) : kademeData.length > 0 ? (
        <View style={{ flex: 1 }}>
          {/* Kademe tablosu — scroll edilebilir */}
          <FlatList
            data={kademeData}
            keyExtractor={(_, i) => `${i}`}
            renderItem={renderRow}
            ListHeaderComponent={
              <>
                <ToolMastheadAd />
                {filterBar}
                {renderHeader()}
              </>
            }
            ListFooterComponent={ToolFooterAd}
            initialNumToRender={30}
            maxToRenderPerBatch={30}
            getItemLayout={(_, index) => ({ length: 40, offset: 40 * (index + 1), index })}
          />

          {/* Özet mini tablo — en altta sabit */}
          {summary && (
            <View style={[styles.summaryContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", borderTopColor: cardBorder }]}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCell}>
                  <Text style={[styles.summaryLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Hacim</Text>
                  <Text style={[styles.summaryValue, { color: theme.white, fontFamily: theme.boldFont }]}>
                    {formatLot(String(summary.volume))}
                  </Text>
                </View>
                <View style={styles.summaryCell}>
                  <Text style={[styles.summaryLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Lot</Text>
                  <Text style={[styles.summaryValue, { color: theme.white, fontFamily: theme.boldFont }]}>
                    {formatLot(String(summary.totalLot))}
                  </Text>
                </View>
                <View style={styles.summaryCell}>
                  <Text style={[styles.summaryLabel, { color: subtleText, fontFamily: theme.regularFont }]}>A. Ort.</Text>
                  <Text style={[styles.summaryValue, { color: theme.white, fontFamily: theme.boldFont }]}>
                    {summary.wavg.toFixed(4).replace(".", ",")}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCell}>
                  <Text style={[styles.summaryLabel, { color: subtleText, fontFamily: theme.regularFont }]}>A. Lot</Text>
                  <Text style={[styles.summaryValue, { color: theme.green, fontFamily: theme.boldFont }]}>
                    {formatLot(String(summary.buyLot))}
                  </Text>
                </View>
                <View style={styles.summaryCell}>
                  <Text style={[styles.summaryLabel, { color: subtleText, fontFamily: theme.regularFont }]}>S. Lot</Text>
                  <Text style={[styles.summaryValue, { color: theme.red, fontFamily: theme.boldFont }]}>
                    {formatLot(String(summary.sellLot))}
                  </Text>
                </View>
                <View style={styles.summaryCell}>
                  <Text style={[styles.summaryLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Fark</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color: summary.diffLot > 0 ? theme.green : summary.diffLot < 0 ? theme.red : theme.white,
                        fontFamily: theme.boldFont,
                      },
                    ]}
                  >
                    {formatLot(String(summary.diffLot))} ({summary.diffPct.toFixed(2).replace(".", ",")}%)
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <ToolMastheadAd />
          {filterBar}
          <View style={styles.centerContent}>
            <Text style={{ color: subtleText, fontFamily: theme.regularFont, fontSize: 13 }}>
              {selectedSymbol ? "Veri bekleniyor..." : "Sembol seçin"}
            </Text>
          </View>
          <ToolFooterAd />
        </ScrollView>
      )}

      {/* Periyot dropdown */}
      {intervalDropdownOpen && (
        <TouchableOpacity
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.4)" }]}
          activeOpacity={1}
          onPress={() => setIntervalDropdownOpen(false)}
        >
          <View
            style={[styles.intervalModal, { backgroundColor: isDark ? "#1c1c1e" : "#fff", borderColor: cardBorder }]}
          >
            {INTERVAL_OPTIONS.map((option) => {
              const isActive = selectedInterval.key === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.7}
                  style={[styles.dropdownItem, isActive && { backgroundColor: theme.yellow + "15" }]}
                  onPress={() => {
                    setSelectedInterval(option);
                    setIntervalDropdownOpen(false);
                    if (selectedSymbol) sendLevelStatsReq(selectedSymbol, option.value);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: isActive ? theme.yellow : theme.white,
                      fontFamily: isActive ? theme.boldFont : theme.regularFont,
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
        <View style={[styles.modalContainer, { backgroundColor: theme.darkerBrand }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSymbolModalVisible(false)}>
              <Text style={{ fontSize: 14, color: theme.gray, fontFamily: theme.regularFont }}>Vazgeç</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, color: theme.white, fontFamily: theme.boldFont }}>Sembol Seçimi</Text>
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
                  style={[styles.modalSeparator, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  filterRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  filterCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterLabel: { fontSize: 11, marginBottom: 4 },
  filterValueRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  filterValue: { fontSize: 14, flex: 1 },

  headerRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dataRow: {
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hCol: { fontSize: 12, textAlign: "center" },
  cell: { fontSize: 13, textAlign: "center" },
  colPrice: { width: "18%", textAlign: "left" },
  colLot: { width: "20%", textAlign: "right" },
  colPct: { width: "14%", textAlign: "right" },
  colBuy: { width: "24%", textAlign: "right", paddingRight: 8 },
  colSell: { width: "24%", textAlign: "left", paddingLeft: 8 },

  centerContent: { flex: 1, alignItems: "center", justifyContent: "center" },

  summaryContainer: {
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  summaryRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  summaryCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  summaryLabel: { fontSize: 10, marginBottom: 2 },
  summaryValue: { fontSize: 12 },

  intervalModal: {
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
  modalRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 56, gap: 12 },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  modalRowText: { flex: 1, justifyContent: "center" },
  modalCode: { fontSize: 14, marginBottom: 2 },
  modalName: { fontSize: 11.5 },
  modalSeparator: { height: 1, marginLeft: 50 },
});

export default withToolAds(KademeAnaliziScreen, "kademe-analizi");
