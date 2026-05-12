import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useTheme } from "../../../theme/ThemeContext";
import { listOptions, select } from "../modules/lists";
import { request } from "../../../modules/IdealClient";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";
import { turkishToAsciiUpper } from "./ListSelector";

interface Props {
  navigation: any;
}

interface CategoryItem {
  value: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
}

const ITEMS: CategoryItem[] = [
  { value: "bist30", title: "BIST 30", icon: "trending-up", tint: "#F07400" },
  { value: "bist100", title: "BIST 100", icon: "stats-chart", tint: "#F07400" },
  { value: "endeksler", title: "Endeksler", icon: "bar-chart", tint: "#F07400" },
  { value: "topGainers", title: "Yükselen", icon: "arrow-up-circle", tint: "#10B981" },
  { value: "topLosers", title: "Düşen", icon: "arrow-down-circle", tint: "#EF4444" },
  { value: "topVolume", title: "Hacim", icon: "podium", tint: "#3B82F6" },
  { value: "anapazar", title: "Ana Pazar", icon: "storefront", tint: "#8B5CF6" },
  { value: "yildizpazar", title: "Yıldız Pazar", icon: "star", tint: "#EAB308" },
  { value: "altpazar", title: "Alt Pazar", icon: "business", tint: "#6366F1" },
  { value: "viopaktif", title: "VIOP Aktif", icon: "flash", tint: "#F59E0B" },
  { value: "viopvadeli", title: "VIOP Vadeli", icon: "time", tint: "#F59E0B" },
  { value: "varantlar", title: "Varantlar", icon: "ticket", tint: "#EC4899" },
  { value: "doviz", title: "Döviz", icon: "cash", tint: "#059669" },
  { value: "kripto", title: "Kripto", icon: "logo-bitcoin", tint: "#F7931A" },
  { value: "BYF", title: "BIST Yatırım Fonları", icon: "pie-chart", tint: "#14B8A6" },
  { value: "bruttakas", title: "Brüt Takas", icon: "swap-horizontal", tint: "#64748B" },
  { value: "devrekesici", title: "Devre Kesici", icon: "alert-circle", tint: "#DC2626" },
  { value: "dunyabono", title: "Dünya Bono", icon: "earth", tint: "#0EA5E9" },
  { value: "yurtdisi", title: "Yurt Dışı", icon: "airplane", tint: "#0891B2" },
];

const Markets: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const isDark = theme.themeDetail === "dark";

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const subtle = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)";

  // Tema değişmedikçe stabil referanslar.
  const scrollStyle = useMemo(
    () => ({ flex: 1 as const, backgroundColor: theme.darkerBrand }),
    [theme.darkerBrand]
  );
  const cardStyleExtra = useMemo(
    () => ({ backgroundColor: cardBg, borderColor: cardBorder }),
    [cardBg, cardBorder]
  );
  const titleStyleExtra = useMemo(
    () => ({ color: theme.white, fontFamily: theme.boldFont }),
    [theme.white, theme.boldFont]
  );

  const handleSelect = useCallback(
    (item: CategoryItem) => {
      if (item.value === "varantlar") {
        navigation.navigate("SymbolSearcherFilterList", {
          title: "Varantlar",
          category: "warrant",
        });
        return;
      }

      dispatch(select(item.value));

      const opt = listOptions.find((o) => o.value === item.value);
      if (
        opt &&
        opt.title !== "Devre Kesici" &&
        opt.title !== "Brüt Takas" &&
        opt.value !== "BYF"
      ) {
        const title = turkishToAsciiUpper(opt.title);
        request(symbolSend, title, " ");
      }

      navigation.navigate("MarketsList", { title: item.title });
    },
    [dispatch, navigation]
  );

  return (
    <ScrollView
      style={scrollStyle}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {ITEMS.map((item) => (
        <CategoryCard
          key={item.value}
          item={item}
          cardStyleExtra={cardStyleExtra}
          titleStyleExtra={titleStyleExtra}
          subtle={subtle}
          onSelect={handleSelect}
        />
      ))}
      <View style={s.bottomSpacer} />
    </ScrollView>
  );
};

// Tek kart — React.memo sayesinde item/style ref'leri değişmezse re-render olmuyor.
const CategoryCard = React.memo(function CategoryCard({
  item,
  cardStyleExtra,
  titleStyleExtra,
  subtle,
  onSelect,
}: {
  item: CategoryItem;
  cardStyleExtra: { backgroundColor: string; borderColor: string };
  titleStyleExtra: { color: string; fontFamily: string };
  subtle: string;
  onSelect: (item: CategoryItem) => void;
}) {
  // item.tint + "1F" — referans her render aynı kalsın diye memoize.
  const iconWrapStyle = useMemo(
    () => ({ backgroundColor: item.tint + "1F" }),
    [item.tint]
  );
  const onPress = useCallback(() => onSelect(item), [onSelect, item]);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={[s.card, cardStyleExtra]}
    >
      <View style={[s.iconWrap, iconWrapStyle]}>
        <Ionicons name={item.icon} size={18} color={item.tint} />
      </View>
      <Text style={[s.itemTitle, titleStyleExtra]} numberOfLines={1}>
        {item.title}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={subtle} />
    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
    // iOS'ta yumuşak gölge; Android'de elevation kaldırıldı
    // (elevation + yarı saydam bg gri çerçeve oluşturuyor)
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {},
    }),
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemTitle: {
    flex: 1,
    fontSize: 14.5,
    letterSpacing: 0.2,
  },
  bottomSpacer: { height: 24 },
});

export default Markets;
