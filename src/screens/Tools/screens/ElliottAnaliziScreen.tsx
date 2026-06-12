import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { withToolAds } from "../../../modules/ads/withToolAds";
import ToolFooterAd from "../../../modules/ads/ToolFooterAd";
import ToolMastheadAd from "../../../modules/ads/ToolMastheadAd";

const ElliottAnaliziScreen = () => {
  const { theme } = useTheme();
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.darkerBrand }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ToolMastheadAd />
      <View style={styles.placeholder}>
        <Text style={{ color: theme.white }}>Elliott Analizi</Text>
      </View>
      <ToolFooterAd />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 },
});

export default withToolAds(ElliottAnaliziScreen, "elliott-analizi");
