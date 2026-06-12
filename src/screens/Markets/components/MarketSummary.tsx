import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, shallowEqual } from "react-redux";
import { useTheme } from "../../../theme/ThemeContext";
import { request } from "../../../modules/IdealClient";
import topGainersReq from "../../../modules/IdealClient/request/topGainers";
import topLosersReq from "../../../modules/IdealClient/request/topLosers";
import topVolumeReq from "../../../modules/IdealClient/request/topVolume";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";
import { SEP2 } from "../../../modules/IdealClient/constants";
import priceCenter from "../../../modules/PriceCenter";
import store from "../../../store";
import SymbolLogo from "../../../components/SymbolLogo";
import { Price, formatPrice, changeColor } from "../modules/prices";
import MastheadBanner from "../../../modules/ads/MastheadBanner";
import FeedAd from "../../../modules/ads/FeedAd";
import LazyAdSlot from "../../../modules/ads/LazyAdSlot";
import type { AdTargeting } from "../../../modules/ads/config";

// Piyasa Özeti — diger bucket, "3 kartta 1 feed" kuralı (brief).
const AD_TARGETING: AdTargeting = {
  bigpara_kategori: "piyasa-ozeti",
  catlist: ["c1_piyasalar", "c2_ozet"],
};

const INDEX_CODES = ["XU100", "XU050", "XU030"];
const PARITY_CODES = ["USDTRY", "EURTRY", "EURUSD"];
const PARITY_LABELS: Record<string, string> = {
  USDTRY: "USD/TRY",
  EURTRY: "EUR/TRY",
  EURUSD: "EUR/USD",
};
const GOLD_CODES = ["SGLD", "GLD"];
const GOLD_LABELS: Record<string, string> = {
  SGLD: "Gram Altın",
  GLD: "Altın/Ons",
};
const GOLD_FREE_MARKET_CODES = ["CEYREK", "YARIM", "SCUM"];
const GOLD_FREE_MARKET_LABELS: Record<string, string> = {
  CEYREK: "Çeyrek Altın",
  YARIM: "Yarım Altın",
  SCUM: "Cumhuriyet Altını",
};

interface Props {
  navigation: any;
}

const MarketSummary: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";

  const symbols = useSelector((s: any) => s.symbols, shallowEqual);
  const gainers: string[] = useSelector(
    (s: any) => s.markets.lists.lists?.topGainers || [],
    shallowEqual
  );
  const losers: string[] = useSelector(
    (s: any) => s.markets.lists.lists?.topLosers || [],
    shallowEqual
  );
  const volume: string[] = useSelector(
    (s: any) => s.markets.lists.lists?.topVolume || [],
    shallowEqual
  );
  const kripto: string[] = useSelector(
    (s: any) => s.markets.lists.lists?.kripto || [],
    shallowEqual
  );

  const [prices, setPrices] = useState<Record<string, Price>>({});

  useEffect(() => {
    request(topGainersReq);
    setTimeout(() => request(topLosersReq), 150);
    setTimeout(() => request(topVolumeReq), 300);

    const fixedCodes = [...INDEX_CODES, ...PARITY_CODES, ...GOLD_CODES, ...GOLD_FREE_MARKET_CODES];
    const formatted = fixedCodes.join(SEP2);
    request(symbolSend, " ", formatted);

    setTimeout(() => {
      const latestPrices = store.getState().prices;
      let hasPrices = false;
      fixedCodes.forEach((code) => {
        if (latestPrices[code]?.lastPrice > 0) hasPrices = true;
      });
      if (!hasPrices) request(symbolSend, " ", formatted);
    }, 2000);
  }, []);

  useEffect(() => {
    const codes = [
      ...gainers.slice(0, 5),
      ...losers.slice(0, 5),
      ...volume.slice(0, 5),
      ...kripto.slice(0, 5),
    ];
    if (codes.length === 0) return;

    const formatted = codes.join(SEP2);
    request(symbolSend, " ", formatted);

    setTimeout(() => {
      const latestPrices = store.getState().prices;
      let hasPrices = false;
      codes.forEach((code) => {
        if (latestPrices[code]?.lastPrice > 0) hasPrices = true;
      });
      if (!hasPrices) request(symbolSend, " ", formatted);
    }, 2000);
  }, [gainers, losers, volume, kripto]);

  useEffect(() => {
    const allCodes = [
      ...INDEX_CODES,
      ...PARITY_CODES,
      ...GOLD_CODES,
      ...GOLD_FREE_MARKET_CODES,
      ...gainers.slice(0, 5),
      ...losers.slice(0, 5),
      ...volume.slice(0, 5),
      ...kripto.slice(0, 5),
    ];

    const unsubs: (() => void)[] = [];
    allCodes.forEach((code) => {
      const unsub = priceCenter.subscribe(code, (p) => {
        setPrices((prev) => ({ ...prev, [code]: p }));
      });
      unsubs.push(unsub);
    });

    const latestPrices = store.getState().prices;
    const initial: Record<string, Price> = {};
    allCodes.forEach((code) => {
      if (latestPrices[code]) initial[code] = latestPrices[code];
    });
    if (Object.keys(initial).length > 0) {
      setPrices((prev) => ({ ...prev, ...initial }));
    }

    const interval = setInterval(() => {
      const latest = store.getState().prices;
      const updates: Record<string, Price> = {};
      let hasUpdate = false;
      allCodes.forEach((code) => {
        if (latest[code]?.lastPrice > 0) {
          updates[code] = latest[code];
          hasUpdate = true;
        }
      });
      if (hasUpdate) setPrices((prev) => ({ ...prev, ...updates }));
    }, 5000);

    return () => {
      unsubs.forEach((u) => u());
      clearInterval(interval);
    };
  }, [gainers, losers, volume, kripto]);

  const handleDetailPress = useCallback((code: string) => {
    navigation.navigate("Detail", { code });
  }, [navigation]);

  const getBadgeStyle = (pct: number, hasData: boolean) => {
    if (!hasData || isNaN(pct) || pct === 0) {
      return {
        color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)",
        bg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      };
    }
    return pct > 0
      ? {
          color: theme.green,
          bg: isDark ? "rgba(5,196,107,0.18)" : "rgba(5,150,105,0.12)",
        }
      : {
          color: theme.red,
          bg: isDark ? "rgba(255,63,52,0.18)" : "rgba(229,52,46,0.12)",
        };
  };

  const fmtPct = (pct: number) =>
    `${pct > 0 ? "+" : ""}${isNaN(pct) ? "—" : pct.toFixed(2)}%`;

  const getLastUpdateTime = (codes: string[]) => {
    let latest = 0;
    codes.forEach((code) => {
      const t = prices[code]?.updatedAt;
      if (t && t > latest) latest = t;
    });
    if (latest === 0) return null;
    const d = new Date(latest);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  // ─── RENDER ───

  const renderParityRow = (code: string, isLast: boolean) => {
    const price = prices[code];
    const symbol = symbols[code];
    const pct = price?.changePercent ?? 0;
    const hasData = price?.lastPrice > 0;
    const badge = getBadgeStyle(pct, hasData);
    const separatorColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

    return (
      <TouchableOpacity
        key={code}
        activeOpacity={0.65}
        onPress={() => handleDetailPress(code)}
        style={[s.parityRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: separatorColor }]}
      >
        <View style={s.parityLeft}>
          <View style={s.parityFlag}>
            <Text style={[s.parityFlagText, { fontFamily: theme.boldFont }]}>
              {code === "USDTRY" ? "$" : code === "EURTRY" ? "€" : "€/$"}
            </Text>
          </View>
          <Text style={[s.parityLabel, { color: theme.white, fontFamily: theme.boldFont }]}>
            {PARITY_LABELS[code]}
          </Text>
        </View>
        <View style={s.parityRight}>
          <Text style={[s.parityPrice, { color: theme.white, fontFamily: theme.boldFont }]}>
            {hasData ? formatPrice(price.lastPrice, symbol) : "—"}
          </Text>
          <View style={[s.parityBadge, { backgroundColor: badge.bg }]}>
            <Text style={[s.parityPct, { color: badge.color, fontFamily: theme.boldFont }]}>
              {hasData ? fmtPct(pct) : "—"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGoldRow = (code: string, label: string, isLast: boolean) => {
    const price = prices[code];
    const symbol = symbols[code];
    const pct = price?.changePercent ?? 0;
    const hasData = price?.lastPrice > 0;
    const badge = getBadgeStyle(pct, hasData);
    const separatorColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

    return (
      <TouchableOpacity
        key={code}
        activeOpacity={0.65}
        onPress={() => handleDetailPress(code)}
        style={[s.parityRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: separatorColor }]}
      >
        <View style={s.parityLeft}>
          <View style={[s.parityFlag, { backgroundColor: "rgba(255,215,0,0.12)" }]}>
            <Ionicons name="diamond" size={16} color="#FFD700" />
          </View>
          <Text style={[s.parityLabel, { color: theme.white, fontFamily: theme.boldFont }]}>
            {label}
          </Text>
        </View>
        <View style={s.parityRight}>
          <Text style={[s.parityPrice, { color: theme.white, fontFamily: theme.boldFont }]}>
            {hasData ? formatPrice(price.lastPrice, symbol) : "—"}
          </Text>
          <View style={[s.parityBadge, { backgroundColor: badge.bg }]}>
            <Text style={[s.parityPct, { color: badge.color, fontFamily: theme.boldFont }]}>
              {hasData ? fmtPct(pct) : "—"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStockRow = (code: string, isLast: boolean) => {
    const price = prices[code];
    const symbol = symbols[code];
    const pct = price?.changePercent ?? 0;
    const hasData = price?.lastPrice > 0;
    const badge = getBadgeStyle(pct, hasData);
    const separatorColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

    return (
      <TouchableOpacity
        key={code}
        activeOpacity={0.65}
        onPress={() => handleDetailPress(code)}
        style={[s.stockRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: separatorColor }]}
      >
        <View style={s.stockLeft}>
          <SymbolLogo code={code} size={32} />
          <Text style={[s.stockCode, { color: theme.white, fontFamily: theme.boldFont }]}>
            {code}
          </Text>
        </View>
        <View style={s.stockRight}>
          <Text style={[s.stockPrice, { color: theme.white, fontFamily: theme.regularFont }]}>
            {hasData ? formatPrice(price.lastPrice, symbol) : "—"}
          </Text>
          <View style={[s.stockBadge, { backgroundColor: badge.bg }]}>
            <Text style={[s.stockPct, { color: badge.color, fontFamily: theme.boldFont }]}>
              {hasData ? fmtPct(pct) : "—"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const sectionCardBg = isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF";
  const sectionBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const timeColor = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.4)";

  const renderSectionHeader = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    iconColor: string,
    codes: string[],
    extraStyle?: any,
  ) => {
    const updateTime = getLastUpdateTime(codes);
    return (
      <View style={[s.sectionHeaderRow, extraStyle]}>
        <View style={[s.sectionIconWrap, { backgroundColor: iconColor + "1A" }]}>
          <Ionicons name={icon} size={17} color={iconColor} />
        </View>
        <Text style={[s.sectionTitle, { color: theme.white, fontFamily: theme.boldFont }]}>
          {title}
        </Text>
        <View style={[s.sectionLine, { backgroundColor: iconColor + "30" }]} />
        {updateTime && (
          <Text style={[s.updateTime, { color: timeColor, fontFamily: theme.regularFont }]}>
            {updateTime}
          </Text>
        )}
      </View>
    );
  };

  const renderSection = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    iconColor: string,
    codes: string[],
  ) => {
    const top5 = codes.slice(0, 5);
    return (
      <View style={{ marginTop: 20 }}>
        {renderSectionHeader(title, icon, iconColor, top5)}
        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: sectionCardBg,
              borderColor: sectionBorder,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.25 : 0.06,
                  shadowRadius: 8,
                },
                android: { elevation: 2 },
              }),
            },
          ]}
        >
          {top5.map((code, i) => renderStockRow(code, i === top5.length - 1))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.darkerBrand }}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <MastheadBanner bucket="diger" targeting={AD_TARGETING} />
      {/* ─── Borsa İstanbul ─── */}
      <View style={{ marginTop: 4 }}>
        {renderSectionHeader("Borsa İstanbul", "business", "#F07400", INDEX_CODES)}
        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: sectionCardBg,
              borderColor: sectionBorder,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.25 : 0.06,
                  shadowRadius: 8,
                },
                android: { elevation: 2 },
              }),
            },
          ]}
        >
          {INDEX_CODES.map((code, i) => renderStockRow(code, i === INDEX_CODES.length - 1))}
        </View>
      </View>

      {/* ─── Parite ─── */}
      <View style={{ marginTop: 20 }}>
        {renderSectionHeader("Parite", "swap-horizontal", "#059669", PARITY_CODES)}
        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: sectionCardBg,
              borderColor: sectionBorder,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.25 : 0.06,
                  shadowRadius: 8,
                },
                android: { elevation: 2 },
              }),
            },
          ]}
        >
          {PARITY_CODES.map((code, i) => renderParityRow(code, i === PARITY_CODES.length - 1))}
        </View>
      </View>

      {/* ─── Altın ─── */}
      <View style={{ marginTop: 20 }}>
        {renderSectionHeader("Altın", "diamond", "#FFD700", GOLD_CODES)}
        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: sectionCardBg,
              borderColor: sectionBorder,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.25 : 0.06,
                  shadowRadius: 8,
                },
                android: { elevation: 2 },
              }),
            },
          ]}
        >
          {GOLD_CODES.map((code, i) => renderGoldRow(code, GOLD_LABELS[code], i === GOLD_CODES.length - 1))}
        </View>
      </View>

      {/* Feed reklam #1 — Borsa İstanbul + Parite + Altın'dan sonra */}
      <LazyAdSlot reservedHeight={250}>
        <FeedAd bucket="diger" slot={1} targeting={AD_TARGETING} />
      </LazyAdSlot>

      {/* ─── Altın - Serbest Piyasa ─── */}
      <View style={{ marginTop: 20 }}>
        {renderSectionHeader("Altın - Serbest Piyasa", "diamond-outline", "#DAA520", GOLD_FREE_MARKET_CODES)}
        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: sectionCardBg,
              borderColor: sectionBorder,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.25 : 0.06,
                  shadowRadius: 8,
                },
                android: { elevation: 2 },
              }),
            },
          ]}
        >
          {GOLD_FREE_MARKET_CODES.map((code, i) => renderGoldRow(code, GOLD_FREE_MARKET_LABELS[code], i === GOLD_FREE_MARKET_CODES.length - 1))}
        </View>
      </View>

      {/* ─── Yükselen / Düşen / Hacim / Kripto ─── */}
      {renderSection("Yükselen", "arrow-up-circle", "#10B981", gainers)}
      {renderSection("Düşen", "arrow-down-circle", "#EF4444", losers)}

      {/* Feed reklam #2 — Altın Serbest + Yükselen + Düşen'den sonra */}
      <LazyAdSlot reservedHeight={250}>
        <FeedAd bucket="diger" slot={2} targeting={AD_TARGETING} />
      </LazyAdSlot>

      {renderSection("Hacim", "podium", "#3B82F6", volume)}
      {renderSection("Kripto", "logo-bitcoin", "#F7931A", kripto)}

      {/* Feed reklam #3 — Kripto'nun altına (sayfa sonu) */}
      <LazyAdSlot reservedHeight={250}>
        <FeedAd bucket="diger" slot={3} targeting={AD_TARGETING} />
      </LazyAdSlot>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 20,
  },

  // ─── Section Header ───
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15.5,
    letterSpacing: 0.3,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    marginLeft: 12,
    borderRadius: 1,
  },
  updateTime: {
    fontSize: 10.5,
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  // ─── Section Card ───
  sectionCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },

  // ─── Parite Rows ───
  parityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  parityLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  parityFlag: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(5,150,105,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  parityFlagText: {
    fontSize: 15,
    color: "#059669",
  },
  parityLabel: {
    fontSize: 14.5,
    letterSpacing: 0.2,
  },
  paritySubLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  parityRight: {
    alignItems: "flex-end",
  },
  parityPrice: {
    fontSize: 15,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  parityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  parityPct: {
    fontSize: 12,
    letterSpacing: 0.2,
  },

  // ─── Stock Rows ───
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stockLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stockCode: {
    fontSize: 14,
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  stockRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stockPrice: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  stockBadge: {
    minWidth: 74,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  stockPct: {
    fontSize: 12.5,
    letterSpacing: 0.2,
  },
});

export default MarketSummary;
