import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import LottieView from "lottie-react-native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  Platform,
  ScrollView,
  ViewToken,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import MastheadBanner from "../../../modules/ads/MastheadBanner";
import FeedAd from "../../../modules/ads/FeedAd";
import LazyAdSlot from "../../../modules/ads/LazyAdSlot";
import type { AdTargeting } from "../../../modules/ads/config";
import { MAX_FEED_ADS } from "../../../modules/ads/config";

// Haberler — diger bucket. Brief: kategori değişiminde reklam değişmeyecek →
// targeting sabit, kategori filtresinden bağımsız.
const NEWS_AD_TARGETING: AdTargeting = {
  bigpara_kategori: "haberler",
  catlist: ["haberler"],
};

const HEADER_LOGO_SOURCE = require("../../../../assets/bigpara/headerLogo.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_MARGIN = 16;
const CARD_GAP = 10;
const CAROUSEL_CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;
const SNAP_INTERVAL = CAROUSEL_CARD_WIDTH + CARD_GAP;
const CAROUSEL_HEIGHT = 220;

export const API_URL =
  "https://mobilapiv2.bigpara.com/api/bigpara/filter?query=DataSourceById&id=69e0e5324812f38ad161e555&skip=0&top=10&orderby=StartDate";

export interface NewsItem {
  Id: string;
  Url: string;
  ModifiedDate: string;
  Title: string;
  Description: string;
  Files: { Url: string }[];
  Ancestors: { Title: string }[];
}

const formatTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} saat önce`;
  return `${Math.floor(diffHour / 24)} gün önce`;
};

/* ═══════════════════════════════════════════
   CAROUSEL CARD
   ═══════════════════════════════════════════ */
const CarouselCard = memo(
  ({
    item,
    isDark,
    onPress,
  }: {
    item: NewsItem;
    isDark: boolean;
    onPress: () => void;
  }) => {
    const imageUrl = item.Files?.[0]?.Url;
    const category = item.Ancestors?.[0]?.Title ?? "";

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        style={styles.carouselCard}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.carouselImage} />
        ) : (
          <View
            style={[
              styles.carouselImage,
              { backgroundColor: isDark ? "#1d2126" : "#e5e5e5" },
            ]}
          />
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.45)", "rgba(0,0,0,0.85)"]}
          locations={[0.2, 0.55, 1]}
          style={styles.carouselOverlay}
        />
        {category ? (
          <View style={[styles.carouselBadge, { backgroundColor: "rgba(240,116,0,0.85)" }]}>
            <Text style={styles.carouselBadgeText}>{category}</Text>
          </View>
        ) : null}
        <View style={styles.carouselContent}>
          <Text style={styles.carouselTitle} numberOfLines={2}>
            {item.Title}
          </Text>
          <View style={styles.carouselMeta}>
            <Ionicons
              name="time-outline"
              size={11}
              color="rgba(255,255,255,0.50)"
            />
            <Text style={styles.carouselTime}>
              {formatTimeAgo(item.ModifiedDate)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

/* ═══════════════════════════════════════════
   CAROUSEL (FlatList-based, reliable)
   ═══════════════════════════════════════════ */
export const NewsCarousel = memo(
  ({
    data,
    isDark,
    theme,
    onItemPress,
  }: {
    data: NewsItem[];
    isDark: boolean;
    theme: any;
    onItemPress: (item: NewsItem) => void;
  }) => {
    const flatListRef = useRef<FlatList<NewsItem>>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeIndexRef = useRef(0);
    const autoPlayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const userInteracting = useRef(false);

    // Track visible item
    const onViewableItemsChanged = useRef(
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index != null) {
          const idx = viewableItems[0].index;
          activeIndexRef.current = idx;
          setActiveIndex(idx);
        }
      }
    ).current;

    const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 60,
    }).current;

    // Auto-play
    useEffect(() => {
      if (data.length <= 1) return;

      const startAutoPlay = () => {
        if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
        autoPlayTimer.current = setInterval(() => {
          if (userInteracting.current) return;
          const next =
            activeIndexRef.current >= data.length - 1
              ? 0
              : activeIndexRef.current + 1;
          flatListRef.current?.scrollToOffset({
            offset: next * SNAP_INTERVAL,
            animated: true,
          });
        }, 2500);
      };

      startAutoPlay();
      return () => {
        if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
      };
    }, [data.length]);

    const scrollTo = useCallback(
      (direction: "prev" | "next") => {
        const current = activeIndexRef.current;
        const target =
          direction === "next"
            ? Math.min(current + 1, data.length - 1)
            : Math.max(current - 1, 0);
        if (target === current) return;
        flatListRef.current?.scrollToOffset({
          offset: target * SNAP_INTERVAL,
          animated: true,
        });
      },
      [data.length]
    );

    const arrowBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
    const arrowColor = isDark ? "#fff" : "#000";

    return (
      <View style={styles.carouselSection}>
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item) => `carousel-${item.Id}`}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: CARD_MARGIN,
            gap: CARD_GAP,
          }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollBeginDrag={() => {
            userInteracting.current = true;
          }}
          onMomentumScrollEnd={() => {
            userInteracting.current = false;
          }}
          renderItem={({ item }) => (
            <CarouselCard
              item={item}
              isDark={isDark}
              onPress={() => onItemPress(item)}
            />
          )}
          getItemLayout={(_, index) => ({
            length: SNAP_INTERVAL,
            offset: SNAP_INTERVAL * index,
            index,
          })}
        />

      </View>
    );
  }
);

/* ═══════════════════════════════════════════
   UNDERLINE TAB BAR (Bloomberg style)
   ═══════════════════════════════════════════ */
const FilterBar = memo(
  ({
    categories,
    activeFilter,
    isDark,
    theme,
    onFilterChange,
  }: {
    categories: string[];
    activeFilter: string | null;
    isDark: boolean;
    theme: any;
    onFilterChange: (cat: string | null) => void;
  }) => {
    const scrollRef = useRef<ScrollView>(null);
    const allTabs = useMemo(() => [null, ...categories], [categories]);
    const tabLayouts = useRef<{ x: number; width: number }[]>([]);

    // Animated underline
    const underlineX = useSharedValue(0);
    const underlineW = useSharedValue(0);

    const underlineStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: underlineX.value }],
      width: underlineW.value,
    }));

    const springConfig = { damping: 20, stiffness: 180, mass: 0.8 };

    const handleTabPress = useCallback(
      (filterValue: string | null, index: number) => {
        onFilterChange(filterValue);
        const layout = tabLayouts.current[index];
        if (layout) {
          underlineX.value = withSpring(layout.x, springConfig);
          underlineW.value = withSpring(layout.width, springConfig);

          // Scroll to keep active tab visible
          scrollRef.current?.scrollTo({
            x: Math.max(0, layout.x - 40),
            animated: true,
          });
        }
      },
      [onFilterChange]
    );

    const handleTabLayout = useCallback(
      (index: number, x: number, width: number) => {
        tabLayouts.current[index] = { x, width };
        // Initialize underline to active tab
        const activeIndex = allTabs.indexOf(activeFilter);
        if (index === (activeIndex >= 0 ? activeIndex : 0)) {
          underlineX.value = x;
          underlineW.value = width;
        }
      },
      [activeFilter, allTabs]
    );

    const separatorColor = isDark
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.06)";

    return (
      <View style={styles.filterSection}>
        <ScrollView
          ref={scrollRef}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <View style={styles.tabsContainer}>
            {allTabs.map((filterValue, index) => {
              const label = filterValue ?? "Tümü";
              const isActive = activeFilter === filterValue;
              return (
                <TouchableOpacity
                  key={label}
                  activeOpacity={0.6}
                  onPress={() => handleTabPress(filterValue, index)}
                  onLayout={(e) => {
                    const { x, width } = e.nativeEvent.layout;
                    handleTabLayout(index, x, width);
                  }}
                  style={styles.tab}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isActive
                          ? "#F07400"
                          : isDark
                          ? "rgba(255,255,255,0.40)"
                          : "rgba(0,0,0,0.35)",
                        fontWeight: isActive ? "700" : "400",
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Animated underline */}
            <Animated.View
              style={[
                styles.underline,
                { backgroundColor: "#F07400" },
                underlineStyle,
              ]}
            />
          </View>
        </ScrollView>

        {/* Bottom separator line */}
        <View
          style={[styles.filterSeparator, { backgroundColor: separatorColor }]}
        />
      </View>
    );
  }
);

/* ═══════════════════════════════════════════
   NEWS LIST ROW
   ═══════════════════════════════════════════ */
const NewsListRow = memo(
  ({
    item,
    index,
    isDark,
    theme,
    onPress,
  }: {
    item: NewsItem;
    index: number;
    isDark: boolean;
    theme: any;
    onPress: () => void;
  }) => {
    const imageUrl = item.Files?.[0]?.Url;
    const category = item.Ancestors?.[0]?.Title ?? "";

    return (
      <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          style={styles.row}
        >
          <View style={styles.thumbWrap}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.thumb} />
            ) : (
              <View
                style={[
                  styles.thumb,
                  { backgroundColor: isDark ? "#1d2126" : "#e5e5e5" },
                ]}
              />
            )}
          </View>
          <View style={styles.rowText}>
            {category ? (
              <Text
                style={[styles.rowCategory, { color: "#F07400" }]}
                numberOfLines={1}
              >
                {category}
              </Text>
            ) : null}
            <Text
              style={[styles.rowTitle, { color: theme.white }]}
              numberOfLines={2}
            >
              {item.Title}
            </Text>
            <View style={styles.rowMeta}>
              <Ionicons
                name="time-outline"
                size={11}
                color={
                  isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)"
                }
              />
              <Text
                style={[
                  styles.rowTime,
                  {
                    color: isDark
                      ? "rgba(255,255,255,0.30)"
                      : "rgba(0,0,0,0.30)",
                  },
                ]}
              >
                {formatTimeAgo(item.ModifiedDate)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <View
          style={[
            styles.separator,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
        />
      </Animated.View>
    );
  }
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const News = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const isDark = theme.themeDetail === "dark";

  const setHeaderLogo = useCallback(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Image
          source={HEADER_LOGO_SOURCE}
          style={{ width: 130, height: 32 }}
          resizeMode="contain"
          fadeDuration={0}
        />
      ),
      headerTitleAlign: "center" as const,
    });
  }, [navigation]);

  useLayoutEffect(() => {
    setHeaderLogo();
  }, [setHeaderLogo]);

  useEffect(() => {
    return navigation.addListener("focus", setHeaderLogo);
  }, [navigation, setHeaderLogo]);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setError(false);
    // 504/timeout durumlarında 1 kez otomatik retry; her denemede 7 sn timeout.
    const attempt = async (remaining: number): Promise<any> => {
      try {
        return await axios.get(API_URL, { timeout: 7000 });
      } catch (e) {
        if (remaining > 0) {
          await new Promise((r) => setTimeout(r, 500));
          return attempt(remaining - 1);
        }
        throw e;
      }
    };
    try {
      const res = await attempt(1);
      setNews(res.data?.DataSourceContent?.Contents ?? []);
    } catch (_) {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    news.forEach((item) => {
      const cat = item.Ancestors?.[0]?.Title;
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [news]);

  const filteredNews = useMemo(() => {
    if (!activeFilter) return news;
    return news.filter(
      (item) => item.Ancestors?.[0]?.Title === activeFilter
    );
  }, [news, activeFilter]);

  const openDetail = useCallback(
    (item: NewsItem) => {
      navigation.navigate("NewsDetail", {
        url: item.Url,
        title: item.Title,
      });
    },
    [navigation]
  );

  const handleFilterChange = useCallback(
    (cat: string | null) => {
      setActiveFilter((prev) => (prev === cat ? null : cat));
    },
    []
  );

  const listHeader = useMemo(
    () => (
      <View>
        {news.length > 0 && (
          <NewsCarousel
            data={news}
            isDark={isDark}
            theme={theme}
            onItemPress={openDetail}
          />
        )}
        {/* Manşet alanı altına masthead reklam (brief) */}
        <MastheadBanner bucket="diger" targeting={NEWS_AD_TARGETING} />
      </View>
    ),
    [news, isDark, theme, openDetail]
  );

  if (loading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.darkerBrand }]}
      >
        <LottieView
          source={require("../../../../assets/lottie/loading-dots.json")}
          autoPlay
          loop
          renderMode="HARDWARE"
          style={{ width: 80, height: 80 }}
        />
      </View>
    );
  }

  if (error && news.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.darkerBrand }]}>
        <Ionicons
          name="cloud-offline-outline"
          size={48}
          color={isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)"}
        />
        <Text
          style={[
            styles.emptyText,
            {
              color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
              marginTop: 12,
              marginBottom: 18,
            },
          ]}
        >
          Haberler şu anda yüklenemedi
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={retry}
          style={styles.retryBtn}
        >
          <Ionicons name="refresh" size={16} color="#fff" />
          <Text style={styles.retryBtnText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredNews}
      keyExtractor={(item) => item.Id}
      style={{ flex: 1, backgroundColor: theme.darkerBrand }}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchNews();
          }}
          tintColor={theme.blue}
        />
      }
      ListHeaderComponent={
        <View>
          {listHeader}
          {categories.length > 0 && (
            <FilterBar
              categories={categories}
              activeFilter={activeFilter}
              isDark={isDark}
              theme={theme}
              onFilterChange={handleFilterChange}
            />
          )}
        </View>
      }
      renderItem={({ item, index }) => {
        // Brief: "5 haberde 1 feed reklam" — index 4, 9, 14, 19, 24 üstünde feed.
        // Sabit key (`news-feed-${slot}`) ile memoized FeedAd kategori değişiminde re-mount olmaz.
        const feedSlotIndex = Math.floor((index + 1) / 5);
        const shouldShowFeed =
          (index + 1) % 5 === 0 && feedSlotIndex >= 1 && feedSlotIndex <= MAX_FEED_ADS;

        const row = (
          <NewsListRow
            item={item}
            index={index}
            isDark={isDark}
            theme={theme}
            onPress={() => openDetail(item)}
          />
        );

        if (!shouldShowFeed) return row;

        return (
          <View>
            {row}
            <LazyAdSlot reservedHeight={250}>
              <FeedAd
                key={`news-feed-${feedSlotIndex}`}
                bucket="diger"
                slot={feedSlotIndex as 1 | 2 | 3 | 4 | 5}
                targeting={NEWS_AD_TARGETING}
              />
            </LazyAdSlot>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons
            name="newspaper-outline"
            size={44}
            color={
              isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"
            }
          />
          <Text
            style={[
              styles.emptyText,
              {
                color: isDark
                  ? "rgba(255,255,255,0.30)"
                  : "rgba(0,0,0,0.30)",
              },
            ]}
          >
            Bu kategoride haber bulunamadı
          </Text>
        </View>
      }
      ListFooterComponent={<View style={{ height: 40 }} />}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 20,
  },

  /* ─ Carousel ─ */
  carouselSection: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  carouselCard: {
    width: CAROUSEL_CARD_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  carouselImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  carouselBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  carouselBadgeText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  carouselContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  carouselTitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    letterSpacing: 0.15,
    marginBottom: 6,
  },
  carouselMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  carouselTime: {
    color: "rgba(255,255,255,0.40)",
    fontSize: 10.5,
    fontWeight: "500",
  },

  /* ─ Nav bar ─ */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.06)",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  dotGradient: {
    flex: 1,
    borderRadius: 3,
  },

  /* ─ Filter (underline tabs) ─ */
  filterSection: {
    paddingTop: 4,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    position: "relative",
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    borderRadius: 1,
  },
  filterSeparator: {
    height: StyleSheet.hairlineWidth,
  },

  /* ─ Row ─ */
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbWrap: {
    width: 76,
    height: 76,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: { elevation: 2 },
    }),
  },
  thumb: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  rowText: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  rowCategory: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
    letterSpacing: 0.1,
    marginBottom: 5,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rowTime: {
    fontSize: 11,
    fontWeight: "500",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 106,
    marginRight: 16,
  },

  /* ─ Empty ─ */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },

  /* ─ Retry ─ */
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F07400",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 13.5,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

export default News;
