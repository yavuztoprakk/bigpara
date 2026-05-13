import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../theme/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PADDING = 16;
const GAP = 10;
const HALF_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GAP) / 2;
const HERO_HEIGHT = 132;
const MINI_HEIGHT = 102;
const TALL_HEIGHT = MINI_HEIGHT * 2 + GAP;

interface Palette {
  primary: string;
  soft: string;
  glow: string;
}

interface ToolItem {
  key: string;
  screen: string;
  title: string;
  subtitle?: string;
  icon: string;
}

interface ToolSection {
  title: string;
  icon: string;
  layout: "hero+2" | "tall+2stack" | "duo";
  palette: Palette;
  items: ToolItem[];
}

// Marka ton skalası: tek renk ailesi (turuncu) içinde 4 farklı ton.
// Bölümler arası ayrımı tonla yapar — mavi/yeşil/mor yok, sadece sıcak turuncu.
// Primary Main #F07400, Primary 100 #FF8F27, Primary 200 #FF9D42, Primary 300 #FFB978
const PORTFOLIO: Palette = { primary: "#F07400", soft: "#FF8F27", glow: "240,116,0" };
const TECHNICAL: Palette = { primary: "#FF8F27", soft: "#FF9D42", glow: "255,143,39" };
const MARKET: Palette = { primary: "#FF9D42", soft: "#FFB978", glow: "255,157,66" };
const CALC: Palette = { primary: "#FFB978", soft: "#FFD3A4", glow: "255,185,120" };

const SECTIONS: ToolSection[] = [
  {
    title: "Portföy Yönetimi",
    icon: "wallet-outline",
    layout: "hero+2",
    palette: PORTFOLIO,
    items: [
      { key: "yatirimlarim", screen: "Yatirimlarim", title: "Yatırımlarım", subtitle: "Portföyünü tek ekranda izle", icon: "briefcase-outline" },
      { key: "param-ne-olurdu", screen: "ParamNeOlurdu", title: "Param Ne Olurdu?", icon: "time-outline" },
      { key: "1000tl-ne-oldu", screen: "BinTLNeOldu", title: "1000 TL Ne Oldu", icon: "cash-outline" },
    ],
  },
  {
    title: "Teknik Analiz",
    icon: "pulse-outline",
    layout: "tall+2stack",
    palette: TECHNICAL,
    items: [
      { key: "kademe-analizi", screen: "KademeAnalizi", title: "Kademe Analizi", subtitle: "Derinlikli alış–satış", icon: "bar-chart-outline" },
      { key: "pivot-analizi", screen: "PivotAnalizi", title: "Pivot Analizi", icon: "analytics-outline" },
      { key: "ekonomik-takvim", screen: "Calendar", title: "Ekonomik Takvim", icon: "calendar-outline" },
    ],
  },
  {
    title: "Piyasa & Finansal",
    icon: "stats-chart-outline",
    layout: "hero+2",
    palette: MARKET,
    items: [
      { key: "temettu-takvimi", screen: "DividendCalendar", title: "Temettü Takvimi", subtitle: "Hisse temettü ödemeleri", icon: "cash-outline" },
      { key: "mali-tablolar", screen: "MaliTablolar", title: "Mali Tablolar", icon: "document-text-outline" },
      { key: "performans-analizi", screen: "PerformansAnalizi", title: "Performans Analizi", icon: "trending-up-outline" },
    ],
  },
  {
    title: "Hesaplayıcılar",
    icon: "calculator-outline",
    layout: "duo",
    palette: CALC,
    items: [
      { key: "doviz-ceviricisi", screen: "DovizCeviricisi", title: "Döviz Çeviricisi", icon: "swap-horizontal-outline" },
      { key: "altin-hesaplayici", screen: "AltinHesaplayici", title: "Altın Hesaplayıcı", icon: "diamond-outline" },
    ],
  },
];

/* ─── Animated wrapper ─── */
const AnimatedCell = ({
  children,
  index,
  style,
}: {
  children: React.ReactNode;
  index: number;
  style?: any;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    const delay = index * 55;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 22, stiffness: 170 })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
};

/* ─── Decorative dot grid ─── */
const DotGrid = ({
  color,
  cols = 6,
  rows = 4,
  size = 3,
  gap = 8,
  style,
}: {
  color: string;
  cols?: number;
  rows?: number;
  size?: number;
  gap?: number;
  style?: any;
}) => {
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <View
          key={`${r}-${c}`}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            left: c * gap,
            top: r * gap,
          }}
        />
      );
    }
  }
  return <View style={[{ position: "absolute" }, style]}>{dots}</View>;
};

/* ─── Sparkline (subtle waveform) ─── */
const Sparkline = ({
  color,
  width,
  height,
  opacity = 0.35,
}: {
  color: string;
  width: number;
  height: number;
  opacity?: number;
}) => {
  const id = `spark-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  const path = `M 0 ${height * 0.7} Q ${width * 0.15} ${height * 0.4}, ${width * 0.3} ${height * 0.55} T ${width * 0.6} ${height * 0.3} T ${width} ${height * 0.45}`;
  return (
    <Svg
      width={width}
      height={height}
      style={{ position: "absolute", left: 0, bottom: 0, opacity }}
      pointerEvents="none"
    >
      <Defs>
        <SvgGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor={color} stopOpacity="0" />
          <Stop offset="50%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Path
        d={path}
        stroke={`url(#${id})`}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
};

/* ─── Hero Card (full width) ─── */
const HeroCard = ({
  item,
  index,
  isDark,
  theme,
  palette,
  onPress,
}: {
  item: ToolItem;
  index: number;
  isDark: boolean;
  theme: any;
  palette: Palette;
  onPress: () => void;
}) => {
  const { primary, soft, glow } = palette;
  const borderColor = isDark
    ? `rgba(${glow},0.18)`
    : `rgba(${glow},0.14)`;
  const bgFrom = isDark ? `rgba(${glow},0.22)` : `rgba(${glow},0.16)`;
  const bgTo = isDark ? `rgba(${glow},0.04)` : `rgba(${glow},0.02)`;

  return (
    <AnimatedCell index={index}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        <LinearGradient
          colors={[bgFrom, bgTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { borderColor }]}
        >
          {/* glow orb top-right */}
          <LinearGradient
            colors={[soft, primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroOrb}
          />

          {/* dot grid bottom-left */}
          <DotGrid
            color={`rgba(${glow},${isDark ? 0.22 : 0.18})`}
            cols={5}
            rows={3}
            size={3}
            gap={9}
            style={{ left: 18, bottom: 14 }}
          />

          {/* sparkline */}
          <Sparkline
            color={primary}
            width={SCREEN_WIDTH - H_PADDING * 2}
            height={HERO_HEIGHT}
            opacity={isDark ? 0.18 : 0.13}
          />

          <View style={styles.heroTop}>
            <LinearGradient
              colors={[soft, primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.heroIcon,
                { shadowColor: primary },
              ]}
            >
              <Ionicons name={item.icon} size={22} color="#fff" />
            </LinearGradient>

            <View
              style={[
                styles.arrowBtn,
                { backgroundColor: `rgba(${glow},${isDark ? 0.18 : 0.14})` },
              ]}
            >
              <Ionicons name="arrow-forward" size={15} color={primary} />
            </View>
          </View>

          <View style={styles.heroBottom}>
            <Text
              style={[
                styles.heroTitle,
                { color: theme.white, fontFamily: theme.boldFont },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!!item.subtitle && (
              <Text
                style={[
                  styles.heroSubtitle,
                  {
                    color: isDark
                      ? "rgba(255,255,255,0.58)"
                      : "rgba(0,0,0,0.52)",
                    fontFamily: theme.regularFont,
                  },
                ]}
                numberOfLines={1}
              >
                {item.subtitle}
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </AnimatedCell>
  );
};

/* ─── Tall Card (half width, double height) ─── */
const TallCard = ({
  item,
  index,
  isDark,
  theme,
  palette,
  onPress,
}: {
  item: ToolItem;
  index: number;
  isDark: boolean;
  theme: any;
  palette: Palette;
  onPress: () => void;
}) => {
  const { primary, soft, glow } = palette;
  const borderColor = isDark
    ? `rgba(${glow},0.18)`
    : `rgba(${glow},0.14)`;
  const bgFrom = isDark ? `rgba(${glow},0.24)` : `rgba(${glow},0.18)`;
  const bgTo = isDark ? `rgba(${glow},0.04)` : `rgba(${glow},0.02)`;

  return (
    <AnimatedCell index={index} style={{ width: HALF_WIDTH }}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        <LinearGradient
          colors={[bgFrom, bgTo]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.tall, { borderColor }]}
        >
          {/* orb top-right */}
          <LinearGradient
            colors={[soft, primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tallOrb}
          />

          {/* dot grid bottom */}
          <DotGrid
            color={`rgba(${glow},${isDark ? 0.22 : 0.18})`}
            cols={6}
            rows={2}
            size={3}
            gap={9}
            style={{ left: 14, bottom: 14 }}
          />

          {/* sparkline */}
          <Sparkline
            color={primary}
            width={HALF_WIDTH}
            height={TALL_HEIGHT}
            opacity={isDark ? 0.16 : 0.11}
          />

          <View style={styles.tallTop}>
            <LinearGradient
              colors={[soft, primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.tallIcon, { shadowColor: primary }]}
            >
              <Ionicons name={item.icon} size={20} color="#fff" />
            </LinearGradient>
            <View
              style={[
                styles.arrowBtnSmall,
                { backgroundColor: `rgba(${glow},${isDark ? 0.18 : 0.14})` },
              ]}
            >
              <Ionicons name="arrow-forward" size={13} color={primary} />
            </View>
          </View>

          <View style={styles.tallBottom}>
            <Text
              style={[
                styles.tallTitle,
                { color: theme.white, fontFamily: theme.boldFont },
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            {!!item.subtitle && (
              <Text
                style={[
                  styles.tallSubtitle,
                  {
                    color: isDark
                      ? "rgba(255,255,255,0.55)"
                      : "rgba(0,0,0,0.48)",
                    fontFamily: theme.regularFont,
                  },
                ]}
                numberOfLines={2}
              >
                {item.subtitle}
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </AnimatedCell>
  );
};

/* ─── Mini Card ─── */
const MiniCard = ({
  item,
  index,
  isDark,
  theme,
  palette,
  onPress,
  width,
  height = MINI_HEIGHT,
}: {
  item: ToolItem;
  index: number;
  isDark: boolean;
  theme: any;
  palette: Palette;
  onPress: () => void;
  width: number;
  height?: number;
}) => {
  const { primary, soft, glow } = palette;
  const borderColor = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(0,0,0,0.05)";

  return (
    <AnimatedCell index={index} style={{ width, height }}>
      <TouchableOpacity activeOpacity={0.78} onPress={onPress} style={{ flex: 1 }}>
        <LinearGradient
          colors={
            isDark
              ? ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.015)"]
              : ["rgba(0,0,0,0.025)", "rgba(0,0,0,0.005)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.mini, { borderColor }]}
        >
          {/* tiny accent dot */}
          <View
            style={[
              styles.miniAccentDot,
              { backgroundColor: primary, opacity: 0.85 },
            ]}
          />

          <LinearGradient
            colors={[
              `rgba(${glow},${isDark ? 0.28 : 0.18})`,
              `rgba(${glow},${isDark ? 0.08 : 0.04})`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.miniIcon}
          >
            <Ionicons name={item.icon} size={17} color={primary} />
          </LinearGradient>

          <Text
            style={[
              styles.miniTitle,
              { color: theme.white, fontFamily: theme.boldFont },
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </AnimatedCell>
  );
};

/* ─── Main Component ─── */
const Tools = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const isDark = theme.themeDetail === "dark";

  const sectionHeaderColor = isDark
    ? "rgba(255,255,255,0.42)"
    : "rgba(0,0,0,0.48)";
  const sectionIconColor = isDark
    ? "rgba(255,255,255,0.30)"
    : "rgba(0,0,0,0.34)";
  const sectionLineBg = isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.06)";

  let globalIndex = 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.darkerBrand }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {SECTIONS.map((section) => {
        const featured = section.items[0];
        const rest = section.items.slice(1);

        return (
          <View key={section.title} style={styles.section}>
            {/* Section header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLabelRow}>
                <View
                  style={[
                    styles.sectionTag,
                    { backgroundColor: `rgba(${section.palette.glow},${isDark ? 0.16 : 0.10})` },
                  ]}
                >
                  <Ionicons
                    name={section.icon}
                    size={11}
                    color={section.palette.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: sectionHeaderColor, fontFamily: theme.boldFont },
                  ]}
                >
                  {section.title.toUpperCase()}
                </Text>
              </View>
              <View
                style={[styles.sectionLine, { backgroundColor: sectionLineBg }]}
              />
            </View>

            {/* Layout: hero + 2 minis below */}
            {section.layout === "hero+2" && (
              <>
                <HeroCard
                  item={featured}
                  index={globalIndex++}
                  isDark={isDark}
                  theme={theme}
                  palette={section.palette}
                  onPress={() => navigation.navigate(featured.screen)}
                />
                <View style={[styles.row2, { marginTop: GAP }]}>
                  {rest.map((item) => (
                    <MiniCard
                      key={item.key}
                      item={item}
                      index={globalIndex++}
                      isDark={isDark}
                      theme={theme}
                      palette={section.palette}
                      width={HALF_WIDTH}
                      onPress={() => navigation.navigate(item.screen)}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Layout: tall (half) + 2 stacked minis (other half) */}
            {section.layout === "tall+2stack" && (
              <View style={styles.row2}>
                <TallCard
                  item={featured}
                  index={globalIndex++}
                  isDark={isDark}
                  theme={theme}
                  palette={section.palette}
                  onPress={() => navigation.navigate(featured.screen)}
                />
                <View style={{ width: HALF_WIDTH, gap: GAP }}>
                  {rest.map((item) => (
                    <MiniCard
                      key={item.key}
                      item={item}
                      index={globalIndex++}
                      isDark={isDark}
                      theme={theme}
                      palette={section.palette}
                      width={HALF_WIDTH}
                      onPress={() => navigation.navigate(item.screen)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Layout: 2 equal squares */}
            {section.layout === "duo" && (
              <View style={styles.row2}>
                {section.items.map((item) => (
                  <MiniCard
                    key={item.key}
                    item={item}
                    index={globalIndex++}
                    isDark={isDark}
                    theme={theme}
                    palette={section.palette}
                    width={HALF_WIDTH}
                    height={114}
                    onPress={() => navigation.navigate(item.screen)}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: H_PADDING,
    paddingTop: 8,
  },

  /* Section */
  section: { marginBottom: 22 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingLeft: 2,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    gap: 8,
  },
  sectionTag: {
    width: 22,
    height: 22,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },

  row2: { flexDirection: "row", gap: GAP },

  /* HERO */
  hero: {
    height: HERO_HEIGHT,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
    paddingHorizontal: 18,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  heroOrb: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    right: -60,
    top: -60,
    opacity: 0.30,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBottom: {},
  heroTitle: {
    fontSize: 18,
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 12.5,
    marginTop: 3,
  },

  /* TALL */
  tall: {
    height: TALL_HEIGHT,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  tallOrb: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    right: -50,
    top: -55,
    opacity: 0.28,
  },
  tallTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tallIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 7,
    elevation: 4,
  },
  arrowBtnSmall: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  tallBottom: {},
  tallTitle: {
    fontSize: 16,
    letterSpacing: 0.15,
  },
  tallSubtitle: {
    fontSize: 11.5,
    marginTop: 3,
    lineHeight: 15,
  },

  /* MINI */
  mini: {
    flex: 1,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  miniAccentDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  miniIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  miniTitle: {
    fontSize: 13.5,
    letterSpacing: 0.1,
  },
});

export default Tools;
