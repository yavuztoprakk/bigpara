import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
// @ts-ignore - react-native-flags has no types
import Flag from "react-native-flags";
import { useTheme } from "../../../theme/ThemeContext";
import { request } from "../../../modules/IdealClient";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";
import { SEP2 } from "../../../modules/IdealClient/constants";
import priceCenter from "../../../modules/PriceCenter";
import store from "../../../store";
import { Price } from "../../Markets/modules/prices";
import {
  Currency,
  INDIVIDUAL_CURRENCIES,
  findPairCode,
} from "../data/currencyPairs";

const DovizCeviricisiScreen = () => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";

  // Bireysel para birimi listesi — module-level sabit, render başına yenilenmez.
  const currencies = INDIVIDUAL_CURRENCIES;

  const [fromCurrency, setFromCurrency] = useState<Currency>(
    () => currencies.find((c) => c.code === "USD") || currencies[0]
  );
  const [toCurrency, setToCurrency] = useState<Currency>(
    () => currencies.find((c) => c.code === "TRY") || currencies[1]
  );
  const [topValue, setTopValue] = useState("1");
  const [bottomValue, setBottomValue] = useState("");
  const [activeInput, setActiveInput] = useState<"top" | "bottom">("top");
  const [fromModalVisible, setFromModalVisible] = useState(false);
  const [toModalVisible, setToModalVisible] = useState(false);
  const [prices, setPrices] = useState<Record<string, Price>>({});

  // İlgili pariteyi (ve gerekiyorsa USD pivot için 2 pariteyi) bul.
  const requiredPairs = useMemo<string[]>(() => {
    if (!fromCurrency || !toCurrency) return [];
    if (fromCurrency.code === toCurrency.code) return [];
    const direct = findPairCode(fromCurrency.code, toCurrency.code);
    if (direct) return [direct.code];
    // USD pivot: from→USD ve USD→to
    const a = findPairCode(fromCurrency.code, "USD");
    const b = findPairCode("USD", toCurrency.code);
    const out: string[] = [];
    if (a) out.push(a.code);
    if (b) out.push(b.code);
    return out;
  }, [fromCurrency, toCurrency]);

  // Gerekli pariteler için WS isteği gönder + PriceCenter abonelikleri kur.
  const lastRequestKeyRef = useRef<string>("");
  useEffect(() => {
    if (requiredPairs.length === 0) return;
    const key = requiredPairs.join("|");
    if (lastRequestKeyRef.current === key) return;
    lastRequestKeyRef.current = key;
    try {
      request(symbolSend, " ", requiredPairs.join(SEP2));
    } catch (e) {
      // Network/WS hatası — sessizce geçiştir; abonelik mevcut veriyle çalışır.
      console.warn("DovizCeviricisi symbolSend hata:", e);
    }

    // Mevcut store fiyatlarını anlık yansıt.
    const lp = store.getState().prices;
    const init: Record<string, Price> = {};
    requiredPairs.forEach((c) => {
      if (lp[c]) init[c] = lp[c];
    });
    if (Object.keys(init).length > 0) {
      setPrices((prev) => ({ ...prev, ...init }));
    }

    const unsubs = requiredPairs.map((code) =>
      priceCenter.subscribe(code, (p) => {
        setPrices((prev) => ({ ...prev, [code]: p }));
      })
    );
    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [requiredPairs]);

  // İki para birimi arası kur hesaplama: önce direkt, yoksa USD pivot.
  const getRate = useCallback((): number => {
    if (!fromCurrency || !toCurrency) return 0;
    if (fromCurrency.code === toCurrency.code) return 1;

    const direct = findPairCode(fromCurrency.code, toCurrency.code);
    if (direct) {
      const lp = prices[direct.code]?.lastPrice;
      if (!lp || lp <= 0) return 0;
      return direct.inverted ? 1 / lp : lp;
    }

    // USD pivot
    const a = findPairCode(fromCurrency.code, "USD");
    const b = findPairCode("USD", toCurrency.code);
    if (!a || !b) return 0;
    const ap = prices[a.code]?.lastPrice;
    const bp = prices[b.code]?.lastPrice;
    if (!ap || !bp || ap <= 0 || bp <= 0) return 0;
    const fromToUsd = a.inverted ? 1 / ap : ap;
    const usdToTarget = b.inverted ? 1 / bp : bp;
    return fromToUsd * usdToTarget;
  }, [prices, fromCurrency, toCurrency]);

  const rate = getRate();

  const parse = (v: string) => {
    const n = parseFloat(v.replace(",", "."));
    return isNaN(n) || n < 0 ? 0 : n;
  };

  const fmt = (v: number) =>
    v.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });

  const handleTopChange = (v: string) => {
    setTopValue(v);
    setActiveInput("top");
    const q = parse(v);
    setBottomValue(q > 0 && rate > 0 ? fmt(rate * q) : "");
  };

  const handleBottomChange = (v: string) => {
    setBottomValue(v);
    setActiveInput("bottom");
    const a = parse(v);
    setTopValue(a > 0 && rate > 0 ? fmt(a / rate) : "");
  };

  useEffect(() => {
    if (rate <= 0) return;
    if (activeInput === "top") {
      const q = parse(topValue);
      if (q > 0) setBottomValue(fmt(rate * q));
    } else {
      const a = parse(bottomValue);
      if (a > 0) setTopValue(fmt(a / rate));
    }
  }, [rate]);

  const resetInputs = () => {
    setTopValue("1");
    setBottomValue("");
    setActiveInput("top");
  };

  const handleSwap = () => {
    const tmp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tmp);
    resetInputs();
  };

  const handleFromSelect = (item: Currency) => {
    setFromCurrency(item);
    resetInputs();
  };

  const handleToSelect = (item: Currency) => {
    setToCurrency(item);
    resetInputs();
  };

  const muted = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)";
  const fieldBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const chipBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
  const modalBg = isDark ? "#1A1F25" : "#FFFFFF";
  const sepColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const accent = "#059669";
  const accentSoft = isDark ? "rgba(5,150,105,0.08)" : "rgba(5,150,105,0.06)";
  const placeholder = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";

  const renderModal = (
    visible: boolean,
    onClose: () => void,
    onSelect: (item: Currency) => void,
    title: string,
    selectedCode: string
  ) => (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={[s.modalSheet, { backgroundColor: modalBg }]}>
          <View style={s.modalHandle} />
          <View style={s.modalHead}>
            <Text
              style={[
                s.modalHeadTitle,
                { color: theme.white, fontFamily: theme.boldFont },
              ]}
            >
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close-circle" size={26} color={muted} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={currencies}
            keyExtractor={(i) => i.code}
            showsVerticalScrollIndicator={false}
            // 33 öğenin hepsi ilk açılışta hazır olsun ki kullanıcı scroll'da
            // gecikme görmesin (FlatList default 10 ile başlıyordu).
            initialNumToRender={50}
            maxToRenderPerBatch={50}
            windowSize={21}
            style={s.modalList}
            contentContainerStyle={s.modalListContent}
            renderItem={({ item }) => {
              const sel = item.code === selectedCode;
              return (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={[
                    s.modalRow,
                    { borderBottomColor: sepColor },
                    sel && { backgroundColor: accentSoft },
                  ]}
                >
                  <View style={s.flagWrap}>
                    <Flag code={item.countryCode} type="flat" size={24} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        s.modalRowLabel,
                        {
                          color: sel ? accent : theme.white,
                          fontFamily: sel ? theme.boldFont : theme.regularFont,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        s.modalRowCode,
                        { color: muted, fontFamily: theme.regularFont },
                      ]}
                    >
                      {item.code}
                    </Text>
                  </View>
                  {sel && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={accent}
                    />
                  )}
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
        {/* Üst — kaynak para */}
        <View style={[s.converterRow, { backgroundColor: fieldBg }]}>
          <TextInput
            style={[
              s.bigInput,
              { color: theme.white, fontFamily: theme.boldFont },
            ]}
            value={topValue}
            onChangeText={handleTopChange}
            onFocus={() => setActiveInput("top")}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={placeholder}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFromModalVisible(true)}
            style={[s.chip, { backgroundColor: chipBg }]}
          >
            <View style={s.chipFlag}>
              <Flag code={fromCurrency.countryCode} type="flat" size={24} />
            </View>
            <Text
              style={[
                s.chipText,
                { color: theme.white, fontFamily: theme.boldFont },
              ]}
            >
              {fromCurrency.code}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={muted}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            s.subLabel,
            { color: muted, fontFamily: theme.regularFont },
          ]}
        >
          {fromCurrency.label}
        </Text>

        {/* Swap */}
        <View style={s.swapWrap}>
          <View style={[s.swapLine, { backgroundColor: sepColor }]} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSwap}
            style={[
              s.swapBtn,
              { backgroundColor: fieldBg, borderColor: sepColor },
            ]}
          >
            <Ionicons name="swap-vertical" size={20} color={accent} />
          </TouchableOpacity>
          <View style={[s.swapLine, { backgroundColor: sepColor }]} />
        </View>

        {/* Alt — hedef para */}
        <View style={[s.converterRow, { backgroundColor: fieldBg }]}>
          <TextInput
            style={[
              s.bigInput,
              { color: theme.white, fontFamily: theme.boldFont },
            ]}
            value={bottomValue}
            onChangeText={handleBottomChange}
            onFocus={() => setActiveInput("bottom")}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={placeholder}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setToModalVisible(true)}
            style={[s.chip, { backgroundColor: chipBg }]}
          >
            <View style={s.chipFlag}>
              <Flag code={toCurrency.countryCode} type="flat" size={24} />
            </View>
            <Text
              style={[
                s.chipText,
                { color: theme.white, fontFamily: theme.boldFont },
              ]}
            >
              {toCurrency.code}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={muted}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            s.subLabel,
            { color: muted, fontFamily: theme.regularFont },
          ]}
        >
          {toCurrency.label}
        </Text>

        {/* Kur bilgisi */}
        {fromCurrency.code !== toCurrency.code && (
          <View
            style={[
              s.rateCard,
              {
                backgroundColor: accentSoft,
                borderColor: isDark
                  ? "rgba(5,150,105,0.15)"
                  : "rgba(5,150,105,0.1)",
              },
            ]}
          >
            {rate > 0 ? (
              <Text
                style={[
                  s.rateText,
                  { color: accent, fontFamily: theme.boldFont },
                ]}
              >
                1 {fromCurrency.code} = {fmt(rate)} {toCurrency.code}
              </Text>
            ) : (
              <Text
                style={[
                  s.rateText,
                  { color: muted, fontFamily: theme.regularFont },
                ]}
              >
                Kur verisi bekleniyor…
              </Text>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {renderModal(
        fromModalVisible,
        () => setFromModalVisible(false),
        handleFromSelect,
        "Kaynak Para Birimi",
        fromCurrency.code
      )}
      {renderModal(
        toModalVisible,
        () => setToModalVisible(false),
        handleToSelect,
        "Hedef Para Birimi",
        toCurrency.code
      )}
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  converterRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingLeft: 20,
    paddingRight: 6,
    height: 64,
  },
  bigInput: { flex: 1, fontSize: 28, letterSpacing: 0.5, paddingVertical: 0 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chipText: { fontSize: 14, letterSpacing: 0.5 },
  subLabel: { fontSize: 12, marginTop: 6, marginLeft: 20, letterSpacing: 0.2 },
  swapWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  swapLine: { flex: 1, height: StyleSheet.hairlineWidth },
  swapBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
  },
  rateCard: {
    marginTop: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    alignItems: "center",
  },
  rateText: { fontSize: 14, letterSpacing: 0.3 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    height: "75%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  modalList: { flex: 1 },
  modalListContent: { paddingBottom: 16 },
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
  modalHeadTitle: { fontSize: 17, letterSpacing: 0.2 },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalRowLabel: { fontSize: 14.5, letterSpacing: 0.2 },
  modalRowCode: { fontSize: 11, marginTop: 2, letterSpacing: 0.3 },
  flagWrap: {
    width: 28,
    height: 28,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chipFlag: {
    width: 24,
    height: 24,
    overflow: "hidden",
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DovizCeviricisiScreen;
