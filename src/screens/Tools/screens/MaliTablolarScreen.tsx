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
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../../theme/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { request } from "../../../modules/IdealClient";
import senetsBilgiReq from "../../../modules/IdealClient/request/senetsBilgi";
import servisApiReq from "../../../modules/IdealClient/request/servisApi";
import {
  fetchSenetsBilgiStart,
  type SenetBilgi,
} from "../modules/senetsBilgi";
import { fetchBilancoRaporStart } from "../modules/bilancoRapor";
import LottieView from "lottie-react-native";

const TABS = [
  { key: "balanceSheet", label: "Bilanço", icon: "wallet-outline" },
  { key: "incomeStatement", label: "Gelir", icon: "trending-up-outline" },
  { key: "cashFlowStatement", label: "Nakit Akışı", icon: "swap-horizontal-outline" },
] as const;

type TableName = (typeof TABS)[number]["key"];

interface PeriodOption {
  label: string;
  year: number;
  quarter: number;
}

const generatePeriods = (): PeriodOption[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const periods: PeriodOption[] = [];
  const quarterMonths = [
    { month: 3, quarter: 1 },
    { month: 6, quarter: 2 },
    { month: 9, quarter: 3 },
    { month: 12, quarter: 4 },
  ];

  for (let y = currentYear; y >= currentYear - 4; y--) {
    for (let i = quarterMonths.length - 1; i >= 0; i--) {
      const { month, quarter } = quarterMonths[i];
      if (y === currentYear && month >= currentMonth) continue;
      periods.push({
        label: `${y}/${String(month).padStart(2, "0")}`,
        year: y,
        quarter,
      });
    }
  }
  return periods;
};

const PERIOD_OPTIONS = generatePeriods();

interface TableItem {
  name: string;
  abstract: boolean;
  preferredLabel: string | null;
  description: string;
  value: { amount: string; currency: string } | null;
  tableItems: TableItem[] | null;
}

interface FlatRow {
  key: string;
  description: string;
  amount: string | null;
  depth: number;
  isAbstract: boolean;
  isTotal: boolean;
  ancestorAbstractKeys: string[];
  hasChildren: boolean;
}

const formatAmount = (raw: string): string => {
  const negative = raw.startsWith("-");
  const digits = raw.replace("-", "");
  const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return negative ? `-${formatted}` : formatted;
};

const flattenTableItems = (
  items: TableItem[] | null,
  depth: number,
  parentKey: string,
  ancestorAbstractKeys: string[] = []
): FlatRow[] => {
  if (!items) return [];
  const rows: FlatRow[] = [];
  items.forEach((item, idx) => {
    const key = `${parentKey}_${idx}`;
    const isTotal =
      item.preferredLabel === "totalLabel" ||
      item.preferredLabel === "alternativeTotalLabel";
    const hasChildren = !!(item.tableItems && item.tableItems.length > 0);

    rows.push({
      key,
      description: item.description,
      amount: item.value ? formatAmount(item.value.amount) : null,
      depth,
      isAbstract: item.abstract,
      isTotal,
      ancestorAbstractKeys: [...ancestorAbstractKeys],
      hasChildren,
    });

    if (hasChildren) {
      const newAncestors = item.abstract
        ? [...ancestorAbstractKeys, key]
        : ancestorAbstractKeys;
      rows.push(...flattenTableItems(item.tableItems, depth + 1, key, newAncestors));
    }
  });
  return rows;
};

const MaliTablolarScreen = () => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";
  const dispatch = useDispatch();

  const senetsBilgiState = useSelector((state: any) => state.senetsBilgi);
  const { data: senetsList, loading: senetsLoading } = senetsBilgiState ?? {
    data: [],
    loading: false,
  };

  const bilancoState = useSelector((state: any) => state.bilancoRapor);
  const { data: bilancoData, loading: bilancoLoading } = bilancoState ?? {
    data: null,
    loading: false,
  };

  const [selectedSymbol, setSelectedSymbol] = useState<SenetBilgi | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_OPTIONS[0]);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TableName>("balanceSheet");
  const [symbolModalVisible, setSymbolModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.95)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const inputBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const subtleText = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)";

  useEffect(() => {
    const needsFetch = senetsBilgiState.prefix !== "IMKBH" || senetsBilgiState.seri !== "E";
    if ((senetsList.length === 0 || needsFetch) && !senetsLoading) {
      dispatch(fetchSenetsBilgiStart({ prefix: "IMKBH", seri: "E" }));
      request(senetsBilgiReq, "IMKBH", "E");
    }
  }, []);

  const sendBilancoReq = useCallback(
    (symbol: string, tableName: TableName, period: PeriodOption) => {
      const query = `BilancoRapor/BilancoRapor?Symbol=${symbol}&Year=${period.year}&Quarter=${period.quarter}&TableName=${tableName}&Language=Tr`;
      dispatch(fetchBilancoRaporStart());
      request(servisApiReq, query);
    },
    [dispatch]
  );

  const flatRows = useMemo((): FlatRow[] => {
    if (!bilancoData?.data?.tables?.tableItems) return [];
    return flattenTableItems(bilancoData.data.tables.tableItems, 0, "root");
  }, [bilancoData]);

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCollapsedSections(new Set());
  }, [bilancoData]);

  const visibleRows = useMemo(() => {
    return flatRows.filter(row =>
      row.ancestorAbstractKeys.every(k => !collapsedSections.has(k))
    );
  }, [flatRows, collapsedSections]);

  const toggleSection = useCallback((key: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
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

  const selectSymbol = (item: SenetBilgi) => {
    setSelectedSymbol(item);
    setSymbolModalVisible(false);
    sendBilancoReq(item.a, activeTab, selectedPeriod);
  };

  const handleTabChange = (tabKey: TableName) => {
    setActiveTab(tabKey);
    if (selectedSymbol) {
      sendBilancoReq(selectedSymbol.a, tabKey, selectedPeriod);
    }
  };

  const handlePeriodChange = (period: PeriodOption) => {
    setSelectedPeriod(period);
    setPeriodDropdownOpen(false);
    if (selectedSymbol) {
      sendBilancoReq(selectedSymbol.a, activeTab, period);
    }
  };

  const renderTableRow = useCallback(
    ({ item, index }: { item: FlatRow; index: number }) => {
      const indent = 16 + item.depth * 16;
      const isNegative = item.amount?.startsWith("-");

      if (item.isAbstract) {
        const isTopLevel = item.depth === 0;
        const isExpanded = !collapsedSections.has(item.key);
        return (
          <TouchableOpacity
            activeOpacity={item.hasChildren ? 0.7 : 1}
            onPress={item.hasChildren ? () => toggleSection(item.key) : undefined}
            style={[
              styles.tableRow,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)",
                borderBottomColor: cardBorder,
                paddingLeft: indent,
                paddingVertical: isTopLevel ? 14 : 10,
                borderLeftWidth: isTopLevel ? 3 : 0,
                borderLeftColor: theme.yellow,
              },
            ]}
          >
            <Text
              style={[
                styles.descriptionText,
                {
                  color: isTopLevel ? theme.yellow : theme.yellow + "CC",
                  fontFamily: theme.boldFont,
                  fontSize: isTopLevel ? 13 : 12,
                  textTransform: isTopLevel ? "uppercase" : "none",
                },
              ]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
            {item.hasChildren && (
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={isTopLevel ? theme.yellow : theme.yellow + "CC"}
              />
            )}
          </TouchableOpacity>
        );
      }

      if (item.isTotal) {
        return (
          <View
            style={[
              styles.tableRow,
              {
                borderBottomColor: cardBorder,
                borderTopWidth: 1,
                borderTopColor: isDark
                  ? "rgba(255,255,255,0.10)"
                  : "rgba(0,0,0,0.10)",
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.03)",
                paddingLeft: indent,
              },
            ]}
          >
            <Text
              style={[
                styles.descriptionText,
                {
                  color: theme.white,
                  fontFamily: theme.boldFont,
                  fontSize: 12.5,
                },
              ]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
            <Text
              style={[
                styles.amountText,
                {
                  color: isNegative ? theme.red : theme.white,
                  fontFamily: theme.boldFont,
                },
              ]}
            >
              {item.amount}
            </Text>
          </View>
        );
      }

      return (
        <View
          style={[
            styles.tableRow,
            {
              borderBottomColor: cardBorder,
              paddingLeft: indent,
            },
            index % 2 === 0 && {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.018)"
                : "rgba(0,0,0,0.015)",
            },
          ]}
        >
          <Text
            style={[
              styles.descriptionText,
              {
                color: theme.white,
                fontFamily: theme.regularFont,
                fontSize: 12,
              },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
          {item.amount != null && (
            <Text
              style={[
                styles.amountText,
                {
                  color: isNegative ? theme.red : subtleText,
                  fontFamily: theme.regularFont,
                },
              ]}
            >
              {item.amount}
            </Text>
          )}
        </View>
      );
    },
    [theme, cardBorder, isDark, subtleText, collapsedSections, toggleSection]
  );

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
              { borderColor: isSelected ? theme.yellow : inputBorder },
            ]}
          >
            {isSelected && (
              <View
                style={[styles.radioInner, { backgroundColor: theme.yellow }]}
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

  // Sembol/Dönem filtre + Tab çubuğu — masthead'in altında her state'te ortak göstermek için.
  const filterBar = (
    <>
      {/* Sembol seçici */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.filterCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
          onPress={() => {
            setSearch("");
            setSymbolModalVisible(true);
          }}
        >
          <View style={styles.filterLabelRow}>
            <Ionicons name="business-outline" size={13} color={subtleText} />
            <Text
              style={[
                styles.filterLabel,
                { color: subtleText, fontFamily: theme.regularFont },
              ]}
            >
              Sembol
            </Text>
          </View>
          <View style={styles.filterValueRow}>
            <Text
              style={[
                styles.filterValue,
                { color: theme.white, fontFamily: theme.boldFont },
              ]}
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
          style={[
            styles.filterCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
          onPress={() => setPeriodDropdownOpen(!periodDropdownOpen)}
        >
          <View style={styles.filterLabelRow}>
            <Ionicons name="calendar-outline" size={13} color={subtleText} />
            <Text
              style={[
                styles.filterLabel,
                { color: subtleText, fontFamily: theme.regularFont },
              ]}
            >
              Dönem
            </Text>
          </View>
          <View style={styles.filterValueRow}>
            <Text
              style={[
                styles.filterValue,
                { color: theme.white, fontFamily: theme.boldFont },
              ]}
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

      {/* Üç Tab */}
      <View style={[styles.tabRow, { borderBottomColor: cardBorder }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              style={[
                styles.tabItem,
                isActive && {
                  borderBottomColor: theme.yellow,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => handleTabChange(tab.key)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={isActive ? theme.yellow : subtleText}
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive ? theme.yellow : subtleText,
                      fontFamily: isActive ? theme.boldFont : theme.regularFont,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  // Sadece data state'inde gösterilen başlık bilgisi (title/year/period).
  const infoHeader = bilancoData?.data ? (
    <View
      style={[
        styles.infoHeader,
        {
          borderBottomColor: cardBorder,
          backgroundColor: isDark
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.02)",
        },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="document-text-outline" size={18} color={theme.yellow} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.white,
              fontFamily: theme.boldFont,
              fontSize: 13.5,
            }}
            numberOfLines={2}
          >
            {bilancoData.data.title}
          </Text>
          <Text
            style={{
              color: subtleText,
              fontFamily: theme.regularFont,
              fontSize: 11.5,
              marginTop: 3,
            }}
          >
            {bilancoData.data.year} - {bilancoData.data.period} (TRY)
          </Text>
        </View>
      </View>
    </View>
  ) : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
      {/* İçerik */}
      {bilancoLoading ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <ToolMastheadAd />
          {filterBar}
          <View style={styles.centerContent}>
            <LottieView
              source={require("../../../../assets/lottie/loading-dots.json")}
              autoPlay
              loop
              renderMode="HARDWARE"
              style={styles.miniLoading}
            />
          </View>
          <ToolFooterAd />
        </ScrollView>
      ) : selectedSymbol && flatRows.length > 0 ? (
        <FlatList
          data={visibleRows}
          keyExtractor={(item) => item.key}
          renderItem={renderTableRow}
          ListHeaderComponent={
            <>
              <ToolMastheadAd />
              {filterBar}
              {infoHeader}
            </>
          }
          ListFooterComponent={ToolFooterAd}
          initialNumToRender={40}
          maxToRenderPerBatch={40}
          windowSize={10}
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <ToolMastheadAd />
          {filterBar}
          <View style={styles.centerContent}>
            <Text
              style={{
                color: subtleText,
                fontFamily: theme.regularFont,
                fontSize: 13,
              }}
            >
              {selectedSymbol ? "Veri bulunamadı" : "Sembol seçin"}
            </Text>
          </View>
          <ToolFooterAd />
        </ScrollView>
      )}

      {/* Dönem dropdown */}
      {periodDropdownOpen && (
        <TouchableOpacity
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.4)" }]}
          activeOpacity={1}
          onPress={() => setPeriodDropdownOpen(false)}
        >
          <View
            style={[
              styles.periodModal,
              {
                backgroundColor: isDark ? "#1c1c1e" : "#fff",
                borderColor: cardBorder,
              },
            ]}
          >
            <ScrollView bounces={false}>
              {PERIOD_OPTIONS.map((option) => {
                const isActive = selectedPeriod.label === option.label;
                return (
                  <TouchableOpacity
                    key={option.label}
                    activeOpacity={0.7}
                    style={[
                      styles.dropdownItem,
                      isActive && { backgroundColor: theme.yellow + "15" },
                    ]}
                    onPress={() => handlePeriodChange(option)}
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
            </ScrollView>
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
          style={[styles.modalContainer, { backgroundColor: theme.darkerBrand }]}
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
              <LottieView
                source={require("../../../../assets/lottie/loading-dots.json")}
                autoPlay
                loop
                renderMode="HARDWARE"
                style={styles.miniLoading}
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

const styles = StyleSheet.create({
  container: { flex: 1 },

  filterRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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

  tabRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabText: { fontSize: 13 },

  infoHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    paddingRight: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 42,
  },
  descriptionText: {
    flex: 1,
    marginRight: 12,
  },
  amountText: {
    fontSize: 12,
    textAlign: "right",
    minWidth: 110,
  },

  periodModal: {
    position: "absolute",
    top: 75,
    left: 16,
    right: 16,
    maxHeight: 350,
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

  miniLoading: {
    width: 50,
    height: 50,
  },

  centerContent: {
    flex: 1,
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

export default withToolAds(MaliTablolarScreen, "mali-tablolar");
