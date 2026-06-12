import React, { useMemo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Constants from "expo-constants";
import { useTheme } from "../../../theme/ThemeContext";

// app.json içindeki "expo.version" üzerinden okur. iOS'te buildNumber,
// Android'de versionCode varsa ayrıca döner.
const getVersionInfo = () => {
  const cfg = Constants.expoConfig as any;
  const version = cfg?.version ?? "—";
  const build =
    Platform.OS === "ios"
      ? cfg?.ios?.buildNumber
      : cfg?.android?.versionCode != null
        ? String(cfg.android.versionCode)
        : undefined;
  return { version, build };
};

const ACCENT = "#F07400";

const VersionFooter = () => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";

  // Tüm metinler BigPara turuncusu — her iki temada da aynı.
  const textColor = ACCENT;
  const dividerColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const { version, build } = useMemo(getVersionInfo, []);
  const yearLabel = useMemo(() => new Date().getFullYear(), []);

  return (
    <View style={styles.wrap}>
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      <Text
        style={[
          styles.versionText,
          { color: textColor, fontFamily: theme.boldFont },
        ]}
      >
        Sürüm {version}
        {build ? `  •  (${build})` : ""}
      </Text>

      <Text
        style={[
          styles.copyright,
          { color: textColor, fontFamily: theme.regularFont },
        ]}
      >
        © {yearLabel} BigPara · Tüm hakları saklıdır.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: "center",
  },
  divider: {
    height: 1,
    width: "55%",
    marginBottom: 18,
  },
  versionText: {
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  copyright: {
    fontSize: 10.5,
    letterSpacing: 0.4,
  },
});

export default VersionFooter;
