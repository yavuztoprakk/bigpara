import React, { useState, useMemo } from "react";
import { withToolAds } from "../../../modules/ads/withToolAds";
import ToolFooterAd from "../../../modules/ads/ToolFooterAd";
import ToolMastheadAd from "../../../modules/ads/ToolMastheadAd";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useTheme } from "../../../theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import type { SenetBilgi } from "../modules/senetsBilgi";

const SembolSecimScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { data, loading } = useSelector((state: any) => state.senetsBilgi);
  const [search, setSearch] = useState("");

  const isDark = theme.themeDetail === "dark";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const inputBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const subtleText = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)";
  const separatorColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const sortedAndFiltered = useMemo(() => {
    const sorted = [...data].sort((a: SenetBilgi, b: SenetBilgi) =>
      a.a.localeCompare(b.a, "tr")
    );
    if (!search.trim()) return sorted;
    const q = search.toUpperCase().trim();
    return sorted.filter(
      (item: SenetBilgi) =>
        item.a.toUpperCase().includes(q) ||
        item.f.toUpperCase().includes(q)
    );
  }, [data, search]);

  const handleSelect = (item: SenetBilgi) => {
    navigation.navigate("YeniYatirim", { selectedSymbol: item });
  };

  const renderItem = ({ item }: { item: SenetBilgi }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.rowContent}>
        <Text style={[styles.codeText, { color: theme.white, fontFamily: theme.boldFont }]}>
          {item.a}
        </Text>
        <Text
          style={[styles.nameText, { color: subtleText, fontFamily: theme.regularFont }]}
          numberOfLines={1}
        >
          {item.f}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={subtleText} />
    </TouchableOpacity>
  );

  const renderSeparator = () => (
    <View style={[styles.separator, { backgroundColor: separatorColor }]} />
  );

  if (loading && data.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.darkerBrand }]}>
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

  return (
    <View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchContainer, { backgroundColor: inputBg, borderColor: inputBorder }]}>
          <Ionicons name="search-outline" size={18} color={subtleText} />
          <TextInput
            style={[styles.searchInput, { color: theme.white, fontFamily: theme.regularFont }]}
            placeholder="Sembol veya şirket adı ara..."
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

      {/* List */}
      <FlatList
        data={sortedAndFiltered}
        keyExtractor={(item) => item.a + item.d}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={ToolMastheadAd}
        ListFooterComponent={ToolFooterAd}
        contentContainerStyle={styles.listContent}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    height: "100%",
  },
  listContent: {
    paddingBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  rowContent: {
    flex: 1,
    justifyContent: "center",
  },
  codeText: {
    fontSize: 14,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 11.5,
  },
  separator: {
    height: 1,
    marginLeft: 16,
  },
});

export default withToolAds(SembolSecimScreen, "sembol-secim");
