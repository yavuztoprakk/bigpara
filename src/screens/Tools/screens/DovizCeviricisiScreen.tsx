import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
  // `field` parametresiyle aynı mantığı dayClose üzerinden de çalıştırıp
  // günlük değişim yüzdesini hesaplıyoruz.
  const getRateUsing = useCallback(
    (field: "lastPrice" | "dayClose"): number => {
      if (!fromCurrency || !toCurrency) return 0;
      if (fromCurrency.code === toCurrency.code) return 1;

      const direct = findPairCode(fromCurrency.code, toCurrency.code);
      if (direct) {
        const v = prices[direct.code]?.[field];
        if (!v || v <= 0) return 0;
        return direct.inverted ? 1 / v : v;
      }

      const a = findPairCode(fromCurrency.code, "USD");
      const b = findPairCode("USD", toCurrency.code);
      if (!a || !b) return 0;
      const ap = prices[a.code]?.[field];
      const bp = prices[b.code]?.[field];
      if (!ap || !bp || ap <= 0 || bp <= 0) return 0;
      const fromToUsd = a.inverted ? 1 / ap : ap;
      const usdToTarget = b.inverted ? 1 / bp : bp;
      return fromToUsd * usdToTarget;
    },
    [prices, fromCurrency, toCurrency]
  );

  const rate = getRateUsing("lastPrice");
  const prevRate = getRateUsing("dayClose");
  const percent =
    prevRate > 0 && rate > 0 ? ((rate - prevRate) / prevRate) * 100 : 0;

  const updatedAt = useMemo(() => {
    let latest = 0;
    requiredPairs.forEach((c) => {
      const t = prices[c]?.updatedAt;
      if (t && t > latest) latest = t;
    });
    return latest;
  }, [prices, requiredPairs]);

  const parse = (v: string) => {
    const n = parseFloat(v.replace(",", "."));
    return isNaN(n) || n < 0 ? 0 : n;
  };

  const fmt = (v: number) =>
    v.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });

  const fmtTime = (ts: number) => {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

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

  // Renkler
  const muted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const cardBg = isDark ? "#1F262E" : "#FFFFFF";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const chipBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  const modalBg = isDark ? "#1A1F25" : "#FFFFFF";
  const sepColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const accent = "#059669";
  const accentSoft = isDark ? "rgba(5,150,105,0.10)" : "rgba(5,150,105,0.08)";
  const placeholder = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";

  // Günlük değişim göstergesi
  const isUp = percent > 0;
  const isDown = percent < 0;
  const changeColor = isUp ? theme.green : isDown ? theme.red : muted;
  const changeBg = isUp
    ? isDark
      ? "rgba(5,196,107,0.12)"
      : "rgba(5,150,105,0.08)"
    : isDown
    ? isDark
      ? "rgba(255,77,77,0.12)"
      : "rgba(229,52,46,0.08)"
    : "transparent";
  const changeIcon = isUp ? "arrow-up" : isDown ? "arrow-down" : "remove";

  const renderCurrencyChip = (
    currency: Currency,
    onPress: () => void
  ) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[s.chip, { backgroundColor: chipBg }]}
    >
      <View style={s.chipFlag}>
        <Flag code={currency.countryCode} type="flat" size={24} />
      </View>
      <Text
        style={[
          s.chipText,
          { color: theme.white, fontFamily: theme.boldFont },
        ]}
      >
        {currency.code}
      </Text>
      <Ionicons
        name="chevron-down"
        size={14}
        color={muted}
        style={{ marginLeft: 4 }}
      />
    </TouchableOpacity>
  );

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

  const sameCurrency = fromCurrency.code === toCurrency.code;

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
        {/* Birleşik kart */}
        <View
          style={[
            s.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          {/* Üst — kaynak */}
          <View style={s.section}>
            <View style={s.sectionRow}>
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
              {renderCurrencyChip(fromCurrency, () =>
                setFromModalVisible(true)
              )}
            </View>
            <Text
              style={[
                s.sectionLabel,
                { color: muted, fontFamily: theme.regularFont },
              ]}
            >
              {fromCurrency.label}
            </Text>
          </View>

          {/* Ortada swap butonu olan ince ayraç */}
          <View style={s.swapWrap}>
            <View style={[s.swapLine, { backgroundColor: sepColor }]} />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSwap}
              style={[
                s.swapBtn,
                {
                  backgroundColor: cardBg,
                  borderColor: sepColor,
                },
              ]}
            >
              <Ionicons name="swap-vertical" size={20} color={accent} />
            </TouchableOpacity>
            <View style={[s.swapLine, { backgroundColor: sepColor }]} />
          </View>

          {/* Alt — hedef */}
          <View style={s.section}>
            <View style={s.sectionRow}>
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
              {renderCurrencyChip(toCurrency, () => setToModalVisible(true))}
            </View>
            <Text
              style={[
                s.sectionLabel,
                { color: muted, fontFamily: theme.regularFont },
              ]}
            >
              {toCurrency.label}
            </Text>
          </View>

          {/* Kart içi alt: kur + günlük değişim */}
          {!sameCurrency && (
            <View style={[s.rateBlock, { borderTopColor: sepColor }]}>
              {rate > 0 ? (
                <>
                  <View style={s.rateMainRow}>
                    <Text
                      style={[
                        s.rateText,
                        { color: theme.white, fontFamily: theme.boldFont },
                      ]}
                      numberOfLines={1}
                    >
                      1 {fromCurrency.code} = {fmt(rate)} {toCurrency.code}
                    </Text>
                    {prevRate > 0 && (
                      <View
                        style={[s.changeBadge, { backgroundColor: changeBg }]}
                      >
                        <Ionicons
                          name={changeIcon}
                          size={11}
                          color={changeColor}
                        />
                        <Text
                          style={[
                            s.changeText,
                            {
                              color: changeColor,
                              fontFamily: theme.boldFont,
                            },
                          ]}
                        >
                          %{Math.abs(percent).toFixed(2)}
                        </Text>
                      </View>
                    )}
                  </View>
                  {updatedAt > 0 && (
                    <Text
                      style={[
                        s.updatedText,
                        { color: muted, fontFamily: theme.regularFont },
                      ]}
                    >
                      Son güncelleme · {fmtTime(updatedAt)}
                    </Text>
                  )}
                </>
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
        </View>

        <View style={{ height: 40 }} />
        <ToolFooterAd />
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
  wrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 6,
    // iOS gölge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    // Android gölge
    elevation: 1,
  },
  section: { paddingVertical: 8 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bigInput: {
    flex: 1,
    fontSize: 22,
    letterSpacing: 0.3,
    paddingVertical: 0,
    paddingRight: 8,
  },
  sectionLabel: {
    fontSize: 12,
    marginTop: 6,
    letterSpacing: 0.2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: { fontSize: 14, letterSpacing: 0.5 },
  chipFlag: {
    width: 24,
    height: 24,
    overflow: "hidden",
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  swapWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  swapLine: { flex: 1, height: StyleSheet.hairlineWidth },
  swapBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  rateBlock: {
    marginTop: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rateMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rateText: { fontSize: 13.5, letterSpacing: 0.3, flexShrink: 1 },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
  },
  changeText: {
    fontSize: 11.5,
    letterSpacing: 0.3,
    marginLeft: 3,
  },
  updatedText: { fontSize: 11, marginTop: 6, letterSpacing: 0.2 },
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
});

export default withToolAds(DovizCeviricisiScreen, "doviz-ceviricisi");
