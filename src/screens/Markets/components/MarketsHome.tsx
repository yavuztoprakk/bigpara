import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import MarketSummary from "./MarketSummary";
import Markets from "./Markets";

interface Props {
  navigation: any;
}

const TABS = ["Piyasa Özeti", "Piyasalar"] as const;
const ACTIVE_BG = "#F07400";
const ACTIVE_TEXT = "#FFFFFF";

const MarketsHome: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const isDark = theme.themeDetail === "dark";

  const inactiveBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const inactiveText = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";

  const containerStyle = useMemo(
    () => ({ flex: 1 as const, backgroundColor: theme.darkerBrand }),
    [theme.darkerBrand]
  );
  const tabBarBg = useMemo(
    () => ({
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    }),
    [isDark]
  );

  return (
    <View style={containerStyle}>
      <View style={[s.tabBar, tabBarBg]}>
        {TABS.map((tab, i) => (
          <TabButton
            key={tab}
            label={tab}
            isActive={activeTab === i}
            inactiveBg={inactiveBg}
            inactiveText={inactiveText}
            boldFont={theme.boldFont}
            regularFont={theme.regularFont}
            onPress={() => setActiveTab(i)}
          />
        ))}
      </View>

      {activeTab === 0 ? <MarketSummary navigation={navigation} /> : <Markets navigation={navigation} />}
    </View>
  );
};

const TabButton = React.memo(function TabButton({
  label,
  isActive,
  inactiveBg,
  inactiveText,
  boldFont,
  regularFont,
  onPress,
}: {
  label: string;
  isActive: boolean;
  inactiveBg: string;
  inactiveText: string;
  boldFont: string;
  regularFont: string;
  onPress: () => void;
}) {
  const btnStyle = useMemo(
    () => ({ backgroundColor: isActive ? ACTIVE_BG : inactiveBg }),
    [isActive, inactiveBg]
  );
  const textStyle = useMemo(
    () => ({
      color: isActive ? ACTIVE_TEXT : inactiveText,
      fontFamily: isActive ? boldFont : regularFont,
    }),
    [isActive, inactiveText, boldFont, regularFont]
  );

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[s.tab, btnStyle]}>
      <Text style={[s.tabText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 13.5,
    letterSpacing: 0.2,
  },
});

export default MarketsHome;
