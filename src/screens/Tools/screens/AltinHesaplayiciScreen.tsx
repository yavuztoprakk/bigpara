import React, { useEffect, useState, useCallback, useMemo } from "react";
import { withToolAds } from "../../../modules/ads/withToolAds";
import ToolFooterAd from "../../../modules/ads/ToolFooterAd";
import ToolMastheadAd from "../../../modules/ads/ToolMastheadAd";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, shallowEqual } from "react-redux";
import { useTheme } from "../../../theme/ThemeContext";
import { request } from "../../../modules/IdealClient";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";
import { SEP2 } from "../../../modules/IdealClient/constants";
import priceCenter from "../../../modules/PriceCenter";
import store from "../../../store";
import { Price } from "../../Markets/modules/prices";

interface GoldItem {
  code: string;
  label: string;
  unit: string;
}

const GOLD_LIST: GoldItem[] = [
  { code: "SGLD", label: "Serbest Piyasa Altın TL/Gr", unit: "gr" },
  { code: "CEYREK", label: "Çeyrek Altın", unit: "adet" },
  { code: "YARIM", label: "Yarım Altın", unit: "adet" },
  { code: "SCUM", label: "Cumhuriyet Altını", unit: "adet" },
  { code: "ATA", label: "Ata Altın", unit: "adet" },
  { code: "BESLI", label: "Beşli Altın", unit: "adet" },
  { code: "IKIBUCUK", label: "İkibuçuk Altın", unit: "adet" },
  { code: "GREMSE", label: "Gremse Altın", unit: "adet" },
  { code: "KULCE", label: "Külçe Altın Kg/TL", unit: "kg" },
  { code: "BILEZIK14", label: "14 Ayar Bilezik Gram/TL", unit: "gr" },
  { code: "BILEZIK18", label: "18 Ayar Bilezik Gram/TL", unit: "gr" },
  { code: "BILEZIK22", label: "22 Ayar Bilezik Gram/TL", unit: "gr" },
  { code: "XGLD", label: "Spot Altın TL/Gr", unit: "gr" },
  { code: "SGLD995", label: "Serbest 0.995 Has Altın TL/Gr", unit: "gr" },
  { code: "XSLV", label: "Gümüş Gram Fiyatı", unit: "gr" },
  { code: "GLD", label: "Ons Altın", unit: "ons" },
  { code: "SLV", label: "Ons Gümüş", unit: "ons" },
  { code: "PLD", label: "Palladium", unit: "ons" },
  { code: "PLT", label: "Platinum", unit: "ons" },
];

interface CurrencyItem {
  code: string;
  fxCode: string;
  label: string;
  symbol: string;
}

const CURRENCY_LIST: CurrencyItem[] = [
  { code: "TRY", fxCode: "", label: "Türk Lirası", symbol: "₺" },
  { code: "USD", fxCode: "USDTRY", label: "ABD Doları", symbol: "$" },
  { code: "EUR", fxCode: "EURTRY", label: "Euro", symbol: "€" },
];

const ALL_SYMBOL_CODES = [...GOLD_LIST.map((g) => g.code), "USDTRY", "EURTRY"];

const QUICK_AMOUNTS_GOLD = [1, 5, 10, 25, 50, 100];
const QUICK_AMOUNTS_TRY = [1000, 5000, 10000, 50000, 100000];
const QUICK_AMOUNTS_USD = [100, 500, 1000, 5000, 10000];

const GOLD = "#C99A2E";

const AltinHesaplayiciScreen = () => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";

  const symbols = useSelector((s: any) => s.symbols, shallowEqual);
  const [prices, setPrices] = useState<Record<string, Price>>({});

  const [selectedGold, setSelectedGold] = useState<GoldItem>(GOLD_LIST[0]);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyItem>(CURRENCY_LIST[0]);
  const [topValue, setTopValue] = useState("1");
  const [bottomValue, setBottomValue] = useState("");
  const [activeInput, setActiveInput] = useState<"top" | "bottom">("top");
  const [swapped, setSwapped] = useState(false);
  const [goldModalVisible, setGoldModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const resetInputs = () => {
    setTopValue("1");
    setBottomValue("");
    setActiveInput("top");
  };

  useEffect(() => {
    const formatted = ALL_SYMBOL_CODES.join(SEP2);
    request(symbolSend, " ", formatted);
    setTimeout(() => {
      const lp = store.getState().prices;
      let has = false;
      ALL_SYMBOL_CODES.forEach((c) => { if (lp[c]?.lastPrice > 0) has = true; });
      if (!has) request(symbolSend, " ", formatted);
    }, 2000);
  }, []);

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    ALL_SYMBOL_CODES.forEach((code) => {
      unsubs.push(priceCenter.subscribe(code, (p) => {
        setPrices((prev) => ({ ...prev, [code]: p }));
      }));
    });

    const lp = store.getState().prices;
    const init: Record<string, Price> = {};
    ALL_SYMBOL_CODES.forEach((c) => { if (lp[c]) init[c] = lp[c]; });
    if (Object.keys(init).length > 0) setPrices((prev) => ({ ...prev, ...init }));

    const iv = setInterval(() => {
      const latest = store.getState().prices;
      const u: Record<string, Price> = {};
      let has = false;
      ALL_SYMBOL_CODES.forEach((c) => { if (latest[c]?.lastPrice > 0) { u[c] = latest[c]; has = true; } });
      if (has) setPrices((prev) => ({ ...prev, ...u }));
    }, 5000);

    return () => { unsubs.forEach((fn) => fn()); clearInterval(iv); };
  }, []);

  const goldPrice = prices[selectedGold.code];
  const fxPrice = selectedCurrency.fxCode ? prices[selectedCurrency.fxCode] : null;

  const getUnitPrice = useCallback((): number => {
    const gp = goldPrice?.lastPrice;
    if (!gp || gp <= 0) return 0;
    if (selectedCurrency.code === "TRY") return gp;
    const fx = fxPrice?.lastPrice;
    if (!fx || fx <= 0) return 0;
    return gp / fx;
  }, [goldPrice, fxPrice, selectedCurrency]);

  const unitPrice = getUnitPrice();

  const dailyChangePct = useMemo(() => {
    if (!goldPrice) return null;
    if (typeof goldPrice.changePercent === "number") return goldPrice.changePercent;
    if (goldPrice.lastPrice && goldPrice.dayClose && goldPrice.dayClose > 0) {
      return ((goldPrice.lastPrice - goldPrice.dayClose) / goldPrice.dayClose) * 100;
    }
    return null;
  }, [goldPrice]);

  const parse = (v: string) => {
    const n = parseFloat(v.replace(",", "."));
    return isNaN(n) || n < 0 ? 0 : n;
  };
  const fmt = (v: number) =>
    v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtQty = (v: number) => (v >= 1 ? v.toFixed(2) : v.toFixed(4));

  const handleTopChange = (v: string) => {
    setTopValue(v);
    setActiveInput("top");
    const q = parse(v);
    setBottomValue(q > 0 && unitPrice > 0 ? fmt(unitPrice * q) : "");
  };

  const handleBottomChange = (v: string) => {
    setBottomValue(v);
    setActiveInput("bottom");
    const a = parse(v);
    setTopValue(a > 0 && unitPrice > 0 ? fmtQty(a / unitPrice) : "");
  };

  useEffect(() => {
    if (unitPrice <= 0) return;
    if (activeInput === "top") {
      const q = parse(topValue);
      if (q > 0) setBottomValue(fmt(unitPrice * q));
    } else {
      const a = parse(bottomValue);
      if (a > 0) setTopValue(fmtQty(a / unitPrice));
    }
  }, [unitPrice]);

  const handleGoldSelect = (item: GoldItem) => { setSelectedGold(item); resetInputs(); };
  const handleCurrencySelect = (item: CurrencyItem) => { setSelectedCurrency(item); resetInputs(); };

  const applyQuickAmount = (n: number) => {
    if (activeInput === "top") handleTopChange(String(n));
    else handleBottomChange(String(n));
  };

  const muted = isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.38)";
  const fieldBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const fieldBg = isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF";
  const modalBg = isDark ? "#1A1F25" : "#FFFFFF";
  const sepColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const goldSoftBg = isDark ? "rgba(201,154,46,0.10)" : "rgba(201,154,46,0.07)";
  const goldBorder = isDark ? "rgba(201,154,46,0.30)" : "rgba(201,154,46,0.22)";
  const placeholder = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";
  const activeAccent = isDark ? "rgba(201,154,46,0.08)" : "rgba(201,154,46,0.05)";

  const activeNumeric = parse(activeInput === "top" ? topValue : bottomValue);

  const changeColor = dailyChangePct == null
    ? theme.gray
    : dailyChangePct > 0
    ? theme.green
    : dailyChangePct < 0
    ? theme.red
    : theme.gray;

  const changePillBg = dailyChangePct == null
    ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)")
    : dailyChangePct > 0
    ? (isDark ? "rgba(76,175,80,0.14)" : "rgba(76,175,80,0.10)")
    : dailyChangePct < 0
    ? (isDark ? "rgba(244,67,54,0.16)" : "rgba(244,67,54,0.10)")
    : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)");

  const quickAmounts = useMemo(() => {
    if (activeInput === "top") return QUICK_AMOUNTS_GOLD;
    if (selectedCurrency.code === "USD" || selectedCurrency.code === "EUR") return QUICK_AMOUNTS_USD;
    return QUICK_AMOUNTS_TRY;
  }, [activeInput, selectedCurrency]);

  const renderModal = <T extends { code: string; label: string }>(
    visible: boolean,
    onClose: () => void,
    data: T[],
    onSelect: (item: T) => void,
    title: string,
    selectedCode: string,
  ) => (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={[s.modalSheet, { backgroundColor: modalBg }]}>
          <View style={s.modalHandle} />
          <View style={s.modalHead}>
            <Text style={[s.modalHeadTitle, { color: theme.headerTint, fontFamily: theme.boldFont }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close-circle" size={24} color={muted} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(i) => i.code}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const sel = item.code === selectedCode;
              return (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => { onSelect(item); onClose(); }}
                  style={[s.modalRow, { borderBottomColor: sepColor }, sel && { backgroundColor: goldSoftBg }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.modalRowLabel, { color: sel ? GOLD : theme.headerTint, fontFamily: sel ? theme.boldFont : theme.regularFont }]}>{item.label}</Text>
                  </View>
                  {sel && <Ionicons name="checkmark" size={18} color={GOLD} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.darkerBrand }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.wrap}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ToolMastheadAd />
        {/* HERO — minimal */}
        <View style={s.hero}>
          <Text
            style={[s.heroSymbolLabel, { color: theme.gray, fontFamily: theme.regularFont }]}
            numberOfLines={1}
          >
            {selectedGold.label}
          </Text>
          <View style={s.heroPriceRow}>
            <Text
              style={[s.heroPriceValue, { color: theme.headerTint, fontFamily: theme.boldFont }]}
              numberOfLines={1}
            >
              {unitPrice > 0 ? fmt(unitPrice) : "—"}
              <Text style={[s.heroPriceUnit, { color: theme.gray, fontFamily: theme.regularFont }]}>
                {" "}{selectedCurrency.symbol} / {selectedGold.unit}
              </Text>
            </Text>
            {dailyChangePct != null && (
              <View style={[s.changePill, { backgroundColor: changePillBg }]}>
                <Text style={[s.changePillText, { color: changeColor, fontFamily: theme.boldFont }]}>
                  {dailyChangePct > 0 ? "+" : ""}
                  {dailyChangePct.toFixed(2)}%
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }} />
          </View>
        </View>

        {/* CONVERTER */}
        {(() => {
          const goldRow = (
            <TouchableOpacity
              key="gold-row"
              activeOpacity={1}
              onPress={() => setActiveInput("top")}
              style={[s.row, activeInput === "top" && { backgroundColor: activeAccent }]}
            >
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setGoldModalVisible(true)}
                  style={[s.dropdownPill, { backgroundColor: goldSoftBg, borderColor: goldBorder }]}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 8 }}
                >
                  <Text
                    style={[s.dropdownPillText, { color: GOLD, fontFamily: theme.boldFont }]}
                    numberOfLines={1}
                  >
                    {selectedGold.label}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={GOLD} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                <TextInput
                  style={[s.bigInput, { color: theme.headerTint, fontFamily: theme.boldFont }]}
                  value={topValue}
                  onChangeText={handleTopChange}
                  onFocus={() => setActiveInput("top")}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={placeholder}
                />
              </View>
              <Text style={[s.unitText, { color: theme.gray, fontFamily: theme.regularFont }]}>
                {selectedGold.unit}
              </Text>
            </TouchableOpacity>
          );

          const currencyRow = (
            <TouchableOpacity
              key="currency-row"
              activeOpacity={1}
              onPress={() => setActiveInput("bottom")}
              style={[s.row, activeInput === "bottom" && { backgroundColor: activeAccent }]}
            >
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setCurrencyModalVisible(true)}
                  style={[s.dropdownPill, { backgroundColor: goldSoftBg, borderColor: goldBorder }]}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 8 }}
                >
                  <Text
                    style={[s.dropdownPillText, { color: GOLD, fontFamily: theme.boldFont }]}
                    numberOfLines={1}
                  >
                    {selectedCurrency.label}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={GOLD} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                <TextInput
                  style={[s.bigInput, { color: theme.headerTint, fontFamily: theme.boldFont }]}
                  value={bottomValue}
                  onChangeText={handleBottomChange}
                  onFocus={() => setActiveInput("bottom")}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={placeholder}
                />
              </View>
              <Text style={[s.unitText, { color: theme.gray, fontFamily: theme.regularFont }]}>
                {selectedCurrency.symbol}
              </Text>
            </TouchableOpacity>
          );

          return (
            <View style={[s.converter, { backgroundColor: fieldBg, borderColor: fieldBorder }]}>
              {swapped ? currencyRow : goldRow}

              <View style={s.divider}>
                <View style={[s.dividerLine, { backgroundColor: sepColor }]} />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSwapped((v) => !v)}
                  style={[s.swapBtn, { backgroundColor: fieldBg, borderColor: fieldBorder }]}
                >
                  <Ionicons name="swap-vertical" size={16} color={GOLD} />
                </TouchableOpacity>
                <View style={[s.dividerLine, { backgroundColor: sepColor }]} />
              </View>

              {swapped ? goldRow : currencyRow}
            </View>
          );
        })()}

        {/* QUICK CHIPS — minimal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.quickRow}
        >
          {quickAmounts.map((n) => {
            const isActive = Math.abs(activeNumeric - n) < 0.0001;
            return (
              <TouchableOpacity
                key={n}
                activeOpacity={0.65}
                onPress={() => applyQuickAmount(n)}
                style={[
                  s.quickChip,
                  { borderColor: isActive ? goldBorder : fieldBorder, backgroundColor: isActive ? goldSoftBg : "transparent" },
                ]}
              >
                <Text
                  style={[
                    s.quickChipText,
                    {
                      color: isActive ? GOLD : theme.gray,
                      fontFamily: isActive ? theme.boldFont : theme.regularFont,
                    },
                  ]}
                >
                  {n.toLocaleString("tr-TR")}{" "}
                  <Text style={{ color: isActive ? GOLD : muted }}>
                    {activeInput === "top" ? selectedGold.unit : selectedCurrency.symbol}
                  </Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* MINIMAL STAT ROW */}
        {unitPrice > 0 && (
          <View style={s.statBlock}>
            {[5, 25, 100].map((mult) => (
              <View key={mult} style={s.statItem}>
                <Text style={[s.statQty, { color: theme.gray, fontFamily: theme.regularFont }]}>
                  {mult} {selectedGold.unit}
                </Text>
                <Text style={[s.statValue, { color: theme.headerTint, fontFamily: theme.boldFont }]}>
                  {fmt(unitPrice * mult)} {selectedCurrency.symbol}
                </Text>
              </View>
            ))}
          </View>
        )}
        <ToolFooterAd />
      </ScrollView>

      {renderModal(
        goldModalVisible,
        () => setGoldModalVisible(false),
        GOLD_LIST,
        handleGoldSelect,
        "Altın / Kıymetli Maden",
        selectedGold.code,
      )}
      {renderModal(
        currencyModalVisible,
        () => setCurrencyModalVisible(false),
        CURRENCY_LIST,
        handleCurrencySelect,
        "Para Birimi",
        selectedCurrency.code,
      )}
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 40 },

  // HERO — minimal, no card
  hero: { marginBottom: 24, paddingHorizontal: 2 },
  heroSymbolLabel: { fontSize: 12, marginBottom: 4, letterSpacing: 0.3 },
  heroPriceRow: { flexDirection: "row", alignItems: "center" },
  heroPriceValue: { fontSize: 32, letterSpacing: -0.8 },
  heroPriceUnit: { fontSize: 14, letterSpacing: 0 },
  changePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
    marginLeft: 10,
  },
  changePillText: { fontSize: 12 },

  // CONVERTER — clean unified card
  converter: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  dropdownPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingLeft: 12,
    paddingRight: 9,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
    maxWidth: "100%",
  },
  dropdownPillText: { fontSize: 12, letterSpacing: 0.3, maxWidth: 240 },
  bigInput: { fontSize: 22, letterSpacing: -0.3, paddingVertical: 0 },
  unitText: { fontSize: 14, marginLeft: 8, marginBottom: 6 },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 24,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },

  // QUICK CHIPS — slim
  quickRow: { flexDirection: "row", gap: 8, paddingHorizontal: 2, paddingTop: 14 },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quickChipText: { fontSize: 12 },

  // STAT — minimal vertical block
  statBlock: { marginTop: 24, paddingHorizontal: 2 },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128,128,128,0.10)",
  },
  statQty: { fontSize: 12, letterSpacing: 0.2 },
  statValue: { fontSize: 13.5, letterSpacing: -0.2 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalSheet: {
    maxHeight: "75%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.3)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  modalHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalHeadTitle: { fontSize: 16, letterSpacing: 0.2 },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalRowLabel: { fontSize: 14, letterSpacing: 0.2 },
});

export default withToolAds(AltinHesaplayiciScreen, "altin-hesaplayici");
