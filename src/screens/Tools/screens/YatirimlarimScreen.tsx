import React, { useEffect, useState, useCallback, useMemo, useLayoutEffect, useRef } from "react";
import { withToolAds } from "../../../modules/ads/withToolAds";
import ToolFooterAd from "../../../modules/ads/ToolFooterAd";
import ToolMastheadAd from "../../../modules/ads/ToolMastheadAd";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView, Dimensions, Platform } from "react-native";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { request } from "../../../modules/IdealClient";
import senetsBilgiReq from "../../../modules/IdealClient/request/senetsBilgi";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";
import { SEP2 } from "../../../modules/IdealClient/constants";
import { fetchSenetsBilgiStart } from "../modules/senetsBilgi";
import { removeYatirim, type Yatirim } from "../modules/yatirimlar";
import LottieView from "lottie-react-native";
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import SymbolLogo from "../../../components/SymbolLogo";

// Marka turuncu tonlarından üretilmiş 15 farklı palet — tek renk ailesi içinde
// koyudan açığa kademe; pie chart dilimleri arasında ayrım sağlar.
// Sıralama, komşu dilimlerin görsel olarak ayırt edilebilmesi için
// koyu/açık alternasyonu gözetir.
const PIE_COLORS = [
  ["#F07400", "#FF8525"], // Primary Main
  ["#FFB978", "#FFC894"], // Primary 300 (açık)
  ["#FF8F27", "#FFA047"], // Primary 100
  ["#FFD0AB", "#FFDDC0"], // pale peach
  ["#FF9D42", "#FFB066"], // Primary 200
  ["#C75D00", "#E06A0F"], // burnt orange
  ["#FFC99C", "#FFD7B4"], // light peach
  ["#FFA855", "#FFBA78"], // soft amber
  ["#E06800", "#F07717"], // deep orange
  ["#FFE3CC", "#FFEEDB"], // cream
  ["#FF7E0E", "#FF9034"], // saturated orange
  ["#FFB266", "#FFC388"], // amber
  ["#FFD7B8", "#FFE3CC"], // pale wash
  ["#FFC18A", "#FFD0A4"], // cream-orange
  ["#FFDDC2", "#FFE9D5"], // very pale
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const createArcPath = (
  cx: number, cy: number,
  outerR: number, innerR: number,
  startAngle: number, endAngle: number
): string => {
  if (endAngle - startAngle >= 359.99) {
    const half = startAngle + 180;
    return (
      createArcPath(cx, cy, outerR, innerR, startAngle, half) +
      " " +
      createArcPath(cx, cy, outerR, innerR, half, endAngle - 0.01)
    );
  }
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
};

interface SliceData {
  path: string;
  color: string;
  colorEnd: string;
  sembolKodu: string;
  gradientId: string;
  opacity: number;
}

const YatirimlarimScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const senetsBilgiState = useSelector((state: any) => state.senetsBilgi);
  const { data: senetler, loading } = senetsBilgiState ?? { data: [], loading: false };
  const yatirimlar = useSelector((state: any) => state.yatirimlar?.list ?? []);

  // Yatırım kodlarını sabitle: socket akışı state.prices / state.symbols'ı her
  // tikte yeniden üretiyor; global selector kullanmak ana ekranı sürekli
  // re-render ettirir. Bu yüzden sadece kayıtlı yatırımların ilgili kayıtlarını
  // shallowEqual ile çekiyoruz.
  const yatirimKodlari = useMemo<string[]>(
    () =>
      yatirimlar
        .map((y: any) => y.sembolKodu)
        .filter((c: string | undefined): c is string => !!c),
    [yatirimlar]
  );

  const symbols = useSelector((state: any) => {
    const result: { [code: string]: any } = {};
    for (const code of yatirimKodlari) {
      result[code] = state.symbols[code];
    }
    return result;
  }, shallowEqual);

  const prices = useSelector((state: any) => {
    const result: { [key: string]: any } = {};
    for (const code of yatirimKodlari) {
      const sym = state.symbols[code];
      const composite = sym?.composite;
      if (composite && state.prices[composite]) {
        result[composite] = state.prices[composite];
      }
      if (state.prices[code]) {
        result[code] = state.prices[code];
      }
    }
    return result;
  }, shallowEqual);

  // İlk açılışta tüm yatırımların detayları açık gelsin; kullanıcı tek tek
  // kapatabilir. autoExpandedRef ile sadece ilk dolumda otomatik açıyoruz —
  // sonraki render'lar kullanıcının açma/kapatma tercihini bozmaz.
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());
  const autoExpandedRef = useRef(false);

  useEffect(() => {
    if (autoExpandedRef.current) return;
    if (yatirimKodlari.length === 0) return;
    setExpandedCodes(new Set(yatirimKodlari));
    autoExpandedRef.current = true;
  }, [yatirimKodlari]);
  const [viewMode, setViewMode] = useState<"list" | "pie">("list");
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);

  const isDark = theme.themeDetail === "dark";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const subtleText = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)";

  // Header sağ üst ikonlar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerIcons}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => { setViewMode("list"); setSelectedSlice(null); }}
          >
            {viewMode === "list" ? (
              <LinearGradient
                colors={["#F07400", "#FF8F27"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerIconActive}
              >
                <Ionicons name="list" size={15} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={[styles.headerIconInactive, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
                <Ionicons name="list" size={15} color={subtleText} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => { setViewMode("pie"); setSelectedSlice(null); }}
          >
            {viewMode === "pie" ? (
              <LinearGradient
                colors={["#F07400", "#FF8F27"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerIconActive}
              >
                <Ionicons name="pie-chart" size={13} color="#fff" />
              </LinearGradient>
            ) : (
              <View style={[styles.headerIconInactive, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
                <Ionicons name="pie-chart-outline" size={13} color={subtleText} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, viewMode, theme, isDark, subtleText]);

  useEffect(() => {
    const needsFetch = senetsBilgiState.prefix !== "" || senetsBilgiState.seri !== "TUM";
    if ((senetler.length === 0 || needsFetch) && !loading) {
      dispatch(fetchSenetsBilgiStart({ prefix: "", seri: "TUM" }));
      request(senetsBilgiReq, "", "TUM");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (yatirimKodlari.length === 0) return;
      const formattedString = yatirimKodlari.join(SEP2);
      request(symbolSend, " ", formattedString);
    }, [yatirimKodlari])
  );

  const yatirimVerileri = useMemo(() => {
    return yatirimlar.map((item: Yatirim, index: number) => {
      const sym = symbols[item.sembolKodu];
      const price = prices[sym?.composite] || prices[item.sembolKodu];
      const sonFiyat = price?.lastPrice || 0;
      const sonTutar = sonFiyat * item.miktar;
      const alisTutar = item.alisFiyati * item.miktar;
      const karZarar = sonTutar - alisTutar;
      const karZararYuzde = alisTutar > 0 ? (karZarar / alisTutar) * 100 : 0;
      const ci = index % PIE_COLORS.length;
      return {
        ...item,
        sonFiyat,
        sonTutar,
        alisTutar,
        karZarar,
        karZararYuzde,
        color: PIE_COLORS[ci][0],
        colorEnd: PIE_COLORS[ci][1],
      };
    });
  }, [yatirimlar, prices, symbols]);

  const toplamDeger = useMemo(() => {
    return yatirimVerileri.reduce((acc: number, v: any) => acc + Math.max(v.sonTutar, v.alisTutar), 0);
  }, [yatirimVerileri]);

  const toplamKarZarar = useMemo(() => {
    return yatirimVerileri.reduce((acc: number, v: any) => acc + v.karZarar, 0);
  }, [yatirimVerileri]);

  // ── SVG Donut ──
  const chartSize = Math.min(SCREEN_WIDTH - 48, 220);
  const cx = chartSize / 2;
  const cy = chartSize / 2;
  const outerR = chartSize / 2 - 2;
  const innerR = outerR * 0.58;
  const gap = 1.8;

  const slices: SliceData[] = useMemo(() => {
    if (toplamDeger === 0) return [];
    let currentAngle = 0;
    return yatirimVerileri.map((v: any, i: number) => {
      const value = Math.max(v.sonTutar, v.alisTutar);
      const sweep = (value / toplamDeger) * 360;
      const startAngle = currentAngle + gap / 2;
      const endAngle = currentAngle + sweep - gap / 2;
      currentAngle += sweep;
      const isSelected = selectedSlice === v.sembolKodu;
      const midAngle = (startAngle + endAngle) / 2;
      const offsetDist = isSelected ? 8 : 0;
      const rad = ((midAngle - 90) * Math.PI) / 180;
      const offsetX = offsetDist * Math.cos(rad);
      const offsetY = offsetDist * Math.sin(rad);
      return {
        path: createArcPath(cx + offsetX, cy + offsetY, isSelected ? outerR + 3 : outerR, isSelected ? innerR - 1 : innerR, startAngle, endAngle),
        color: v.color,
        colorEnd: v.colorEnd,
        sembolKodu: v.sembolKodu,
        gradientId: `grad_${i}`,
        opacity: selectedSlice && !isSelected ? 0.3 : 1,
      };
    });
  }, [yatirimVerileri, toplamDeger, selectedSlice, chartSize]);

  const selectedYatirim = selectedSlice
    ? yatirimVerileri.find((v: any) => v.sembolKodu === selectedSlice)
    : null;

  if (loading && senetler.length === 0) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.darkerBrand }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <ToolMastheadAd />
        <View style={styles.centered}>
          <LottieView
            source={require("../../../../assets/lottie/loading-dots.json")}
            autoPlay loop renderMode="HARDWARE"
            style={{ width: 80, height: 80 }}
          />
        </View>
        <ToolFooterAd />
      </ScrollView>
    );
  }

  if (yatirimlar.length === 0) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.darkerBrand }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <ToolMastheadAd />
        <View style={styles.centered}>
          <View style={[styles.iconCircle, { backgroundColor: "#F07400" + "15" }]}>
            <Ionicons name="briefcase-outline" size={48} color="#F07400" />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.white, fontFamily: theme.boldFont }]}>
            Kayıtlı yatırımınız bulunmamaktadır.
          </Text>
          <Text style={[styles.emptyDesc, { color: subtleText, fontFamily: theme.regularFont }]}>
            Yatırım eklemek için "Yeni Yatırım Ekle" butonuna basınız.
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#F07400" }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("YeniYatirim")}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.addButtonText, { fontFamily: theme.boldFont }]}>Yeni Yatırım Ekle</Text>
          </TouchableOpacity>
        </View>
        <ToolFooterAd />
      </ScrollView>
    );
  }

  // ── Liste renderItem ──
  const renderItem = ({ item }: { item: Yatirim }) => {
    const sym = symbols[item.sembolKodu];
    const price = prices[sym?.composite] || prices[item.sembolKodu];
    const sonFiyat = price?.lastPrice || 0;
    const sonTutar = sonFiyat * item.miktar;
    const alisTutar = item.alisFiyati * item.miktar;
    const karZarar = sonTutar - alisTutar;
    const karZararYuzde = alisTutar > 0 ? (karZarar / alisTutar) * 100 : 0;
    const isPositive = karZarar >= 0;
    const color = karZarar === 0 ? subtleText : isPositive ? theme.green : theme.red;
    const expanded = expandedCodes.has(item.sembolKodu);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }]}
        activeOpacity={0.85}
        onPress={() =>
          setExpandedCodes((prev) => {
            const next = new Set(prev);
            if (next.has(item.sembolKodu)) next.delete(item.sembolKodu);
            else next.add(item.sembolKodu);
            return next;
          })
        }
      >
        <View style={styles.cardRow}>
          <View style={[styles.logoWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF" }]}>
            <SymbolLogo code={item.sembolKodu} size={36} />
          </View>
          <View style={styles.cardLeft}>
            <Text style={[styles.sembolText, { color: theme.white, fontFamily: theme.boldFont }]}>{item.sembolKodu}</Text>
            <Text style={[styles.sirketText, { color: subtleText, fontFamily: theme.regularFont }]} numberOfLines={1}>{item.sirketAdi}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={[styles.tutarText, { color: theme.white, fontFamily: theme.boldFont }]}>
              {sonTutar > 0 ? sonTutar.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺" : "—"}
            </Text>
            <View style={[styles.kzChip, { backgroundColor: color + "1F" }]}>
              <Ionicons name={isPositive ? "caret-up" : "caret-down"} size={9} color={color} />
              <Text style={[styles.kzChipText, { color, fontFamily: theme.boldFont }]}>
                {isPositive ? "+" : ""}{karZararYuzde.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
        {expanded && (
          <View style={[styles.detailSection, { borderTopColor: borderColor }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Adet</Text>
              <Text style={[styles.detailValue, { color: theme.white, fontFamily: theme.boldFont }]}>{item.miktar}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Alış Fiyatı</Text>
              <Text style={[styles.detailValue, { color: theme.white, fontFamily: theme.boldFont }]}>{item.alisFiyati.toFixed(2)} TL</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Son Fiyat</Text>
              <Text style={[styles.detailValue, { color: theme.white, fontFamily: theme.boldFont }]}>{sonFiyat > 0 ? sonFiyat.toFixed(2) + " TL" : "—"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Kar / Zarar</Text>
              <Text style={[styles.detailValue, { color, fontFamily: theme.boldFont }]}>
                {isPositive ? "+" : ""}{karZarar.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: theme.red }]}
              activeOpacity={0.7}
              onPress={() => Alert.alert("Sil", `${item.sembolKodu} yatırımını silmek istiyor musunuz?`, [
                { text: "İptal", style: "cancel" },
                { text: "Sil", style: "destructive", onPress: () => dispatch(removeYatirim(item.sembolKodu)) },
              ])}
            >
              <Ionicons name="trash-outline" size={16} color={theme.red} />
              <Text style={[styles.deleteText, { color: theme.red, fontFamily: theme.boldFont }]}>Yatırımı Sil</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // ── Pasta Görünümü ──
  const renderPieView = () => {
    const toplamKarPositive = toplamKarZarar >= 0;
    const toplamKarColor = toplamKarZarar === 0 ? subtleText : toplamKarPositive ? theme.green : theme.red;
    const svgSize = chartSize + 24; // seçili dilim taşması için padding

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.pieContent} showsVerticalScrollIndicator={false}>
        <ToolMastheadAd />
        {/* Donut Chart */}
        <View style={[styles.chartArea, { width: svgSize, height: svgSize }]}>
          <Svg width={svgSize} height={svgSize} viewBox={`${-12} ${-12} ${chartSize + 24} ${chartSize + 24}`}>
            <Defs>
              {slices.map((s: SliceData) => (
                <SvgGradient key={s.gradientId} id={s.gradientId} x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor={s.color} />
                  <Stop offset="100%" stopColor={s.colorEnd} />
                </SvgGradient>
              ))}
            </Defs>
            <Circle cx={cx} cy={cy} r={outerR - 2} fill="none"
              stroke={isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.08)"}
              strokeWidth={outerR - innerR + 10} opacity={0.12}
            />
            {slices.map((s: SliceData) => (
              <Path
                key={s.sembolKodu} d={s.path}
                fill={`url(#${s.gradientId})`} opacity={s.opacity}
                onPress={() => setSelectedSlice(selectedSlice === s.sembolKodu ? null : s.sembolKodu)}
              />
            ))}
          </Svg>
          {/* Ortadaki bilgi */}
          <View style={[styles.centerInfo, { width: innerR * 2 - 12, height: innerR * 2 - 12, top: (svgSize - (innerR * 2 - 12)) / 2, left: (svgSize - (innerR * 2 - 12)) / 2 }]} pointerEvents="none">
            {selectedYatirim ? (
              <>
                <Text style={[styles.centerSymbol, { color: theme.white, fontFamily: theme.boldFont }]}>{selectedYatirim.sembolKodu}</Text>
                <Text style={[styles.centerPercent, { color: selectedYatirim.color, fontFamily: theme.boldFont }]}>
                  %{toplamDeger > 0 ? ((Math.max(selectedYatirim.sonTutar, selectedYatirim.alisTutar) / toplamDeger) * 100).toFixed(1) : "0"}
                </Text>
                <Text style={[styles.centerAmount, { color: subtleText, fontFamily: theme.regularFont }]}>
                  {Math.max(selectedYatirim.sonTutar, selectedYatirim.alisTutar).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} TL
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.centerTotal, { color: theme.white, fontFamily: theme.boldFont }]}>
                  {toplamDeger >= 1000000 ? (toplamDeger / 1000000).toFixed(1) + "M"
                    : toplamDeger >= 1000 ? (toplamDeger / 1000).toFixed(1) + "K"
                    : toplamDeger.toFixed(0)} TL
                </Text>
                <Text style={[styles.centerLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Toplam Portföy</Text>
                <Text style={[styles.centerKar, { color: toplamKarColor, fontFamily: theme.boldFont }]}>
                  {toplamKarPositive ? "+" : ""}{toplamKarZarar.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} TL
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Özet kartları */}
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.summaryCardLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Portföy Değeri</Text>
            <Text style={[styles.summaryCardValue, { color: theme.white, fontFamily: theme.boldFont }]}>
              {toplamDeger.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.summaryCardLabel, { color: subtleText, fontFamily: theme.regularFont }]}>Toplam Kar/Zarar</Text>
            <Text style={[styles.summaryCardValue, { color: toplamKarColor, fontFamily: theme.boldFont }]}>
              {toplamKarPositive ? "+" : ""}{toplamKarZarar.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
            </Text>
          </View>
        </View>

        {/* Hisse dağılım listesi */}
        <View style={[styles.distributionCard, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.distributionTitle, { color: theme.white, fontFamily: theme.boldFont }]}>Dağılım</Text>
          {yatirimVerileri.map((v: any, i: number) => {
            const yuzde = toplamDeger > 0 ? ((Math.max(v.sonTutar, v.alisTutar) / toplamDeger) * 100) : 0;
            const isPositive = v.karZarar >= 0;
            const karColor = v.karZarar === 0 ? subtleText : isPositive ? theme.green : theme.red;
            const isSelected = selectedSlice === v.sembolKodu;
            return (
              <TouchableOpacity
                key={v.sembolKodu}
                activeOpacity={0.6}
                onPress={() => setSelectedSlice(isSelected ? null : v.sembolKodu)}
                style={[
                  styles.distItem,
                  i < yatirimVerileri.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor },
                  isSelected && { backgroundColor: v.color + "10" },
                ]}
              >
                <View style={[styles.distDot, { backgroundColor: v.color }]} />
                <View style={styles.distInfo}>
                  <Text style={[styles.distSymbol, { color: theme.white, fontFamily: theme.boldFont }]}>{v.sembolKodu}</Text>
                  <Text style={[styles.distCompany, { color: subtleText, fontFamily: theme.regularFont }]} numberOfLines={1}>{v.sirketAdi}</Text>
                </View>
                <View style={styles.distRight}>
                  <Text style={[styles.distPercent, { color: theme.white, fontFamily: theme.boldFont }]}>%{yuzde.toFixed(1)}</Text>
                  <Text style={[styles.distKar, { color: karColor, fontFamily: theme.boldFont }]}>
                    {isPositive ? "+" : ""}{v.karZarar.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} TL
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 80 }} />
        <ToolFooterAd />
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
      {viewMode === "list" ? (
        <FlatList
          data={yatirimlar}
          keyExtractor={(item: Yatirim) => item.sembolKodu}
          renderItem={renderItem}
          ListHeaderComponent={ToolMastheadAd}
          ListFooterComponent={ToolFooterAd}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderPieView()
      )}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate("YeniYatirim")}
        style={styles.fabWrapper}
      >
        <LinearGradient
          colors={["#F58A1F", "#F07400"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={[styles.fabLabel, { fontFamily: theme.boldFont }]}>Yatırım Ekle</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  emptyTitle: { fontSize: 16, textAlign: "center", marginBottom: 8 },
  emptyDesc: { fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 32 },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 48, paddingHorizontal: 28, borderRadius: 24 },
  addButtonText: { color: "#fff", fontSize: 15 },
  listContent: { padding: 16, paddingBottom: 100 },
  // Liste kartı — Android elevation default gri gölgesi tema ile uyumsuz
  // olduğu için sadece iOS'ta shadow uyguluyoruz.
  card: {
    borderRadius: 18,
    marginBottom: 10,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {},
    }),
  },
  cardRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14 },
  logoWrap: {
    width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12, overflow: "hidden",
  },
  cardLeft: { flex: 1, marginRight: 10 },
  sembolText: { fontSize: 15, marginBottom: 2, letterSpacing: 0.2 },
  sirketText: { fontSize: 11.5 },
  cardRight: { alignItems: "flex-end" },
  tutarText: { fontSize: 15, marginBottom: 5 },
  kzChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, gap: 2 },
  kzChipText: { fontSize: 11 },
  detailSection: { borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  detailLabel: { fontSize: 12 },
  detailValue: { fontSize: 13 },
  deleteButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 10, paddingVertical: 10, marginTop: 10 },
  deleteText: { fontSize: 13, marginLeft: 6 },
  // FAB
  fabWrapper: {
    position: "absolute", bottom: 22, right: 16,
    ...Platform.select({
      ios: { shadowColor: "#F07400", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: {},
    }),
  },
  fab: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingHorizontal: 18, paddingVertical: 13, borderRadius: 999, gap: 6,
  },
  fabLabel: { color: "#fff", fontSize: 13.5, letterSpacing: 0.3 },
  // Header
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 6, marginRight: 8 },
  headerIconActive: {
    width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#F07400", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 5 },
      android: {},
    }),
  },
  headerIconInactive: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  // Pie
  pieContent: { paddingHorizontal: 16, paddingTop: 12, alignItems: "center" },
  chartArea: { position: "relative", alignItems: "center", justifyContent: "center", marginBottom: 16, },
  centerInfo: { position: "absolute", alignItems: "center", justifyContent: "center" },
  centerSymbol: { fontSize: 15 },
  centerPercent: { fontSize: 18, marginTop: 1 },
  centerAmount: { fontSize: 11, marginTop: 1 },
  centerTotal: { fontSize: 15 },
  centerLabel: { fontSize: 10, marginTop: 1 },
  centerKar: { fontSize: 12, marginTop: 3 },
  // Summary cards
  summaryCards: { flexDirection: "row", gap: 10, width: "100%", marginBottom: 12 },
  summaryCard: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14 },
  summaryCardLabel: { fontSize: 11, marginBottom: 6 },
  summaryCardValue: { fontSize: 15 },
  // Distribution
  distributionCard: { borderWidth: 1, borderRadius: 14, width: "100%", overflow: "hidden" },
  distributionTitle: { fontSize: 14, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8 },
  distItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 },
  distDot: { width: 10, height: 10, borderRadius: 5 },
  distInfo: { flex: 1, marginLeft: 10 },
  distSymbol: { fontSize: 13.5, marginBottom: 1 },
  distCompany: { fontSize: 10.5 },
  distRight: { alignItems: "flex-end" },
  distPercent: { fontSize: 13.5, marginBottom: 1 },
  distKar: { fontSize: 11 },
});

export default withToolAds(YatirimlarimScreen, "yatirimlarim");
