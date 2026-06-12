import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import type { AgreementBlock } from "./data/membershipAgreement";

const ACCENT = "#F07400";
const CONTENT_MAX_WIDTH = 720;

// `**...**` ile sarılmış parçaları kalın <Text> olarak render eder.
// Düz metinler outer <Text>'in stilini miras alır → ekstra wrap yok.
const renderRich = (text: string, strongStyle: any): React.ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={idx} style={strongStyle}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return part;
  });
};

type LegalDocumentProps = {
  title: string;
  blocks: AgreementBlock[];
};

const LegalDocument = ({ title, blocks }: LegalDocumentProps) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDark = theme.themeDetail === "dark";

  // Responsive: dar ekranda 18px yan boşluk; geniş ekranda (tablet)
  // içerik 720px ile sınırlanıp ortalanır → uzun satır okumayı zorlaştırmasın.
  const horizontalPadding = useMemo(() => {
    if (width > CONTENT_MAX_WIDTH + 36) {
      return (width - CONTENT_MAX_WIDTH) / 2;
    }
    return 18;
  }, [width]);

  const palette = useMemo(() => {
    const text = theme.white;
    const muted = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.72)";
    const subtle = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.42)";
    const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";
    const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const divider = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    return { text, muted, subtle, cardBg, cardBorder, divider };
  }, [isDark, theme.white]);

  const paragraphStyle = useMemo(
    () => ({
      fontSize: 14.5,
      lineHeight: 23,
      color: palette.muted,
      fontFamily: theme.regularFont,
    }),
    [palette.muted, theme.regularFont],
  );

  const strongStyle = useMemo(
    () => ({
      fontSize: 14.5,
      lineHeight: 23,
      color: palette.text,
      fontFamily: theme.boldFont,
    }),
    [palette.text, theme.boldFont],
  );

  const renderBlock = (block: AgreementBlock, index: number) => {
    switch (block.type) {
      case "h1":
        return (
          <Text
            key={index}
            style={[
              styles.h1,
              {
                color: ACCENT,
                fontFamily: theme.boldFont,
                marginTop: index === 0 ? 0 : 28,
              },
            ]}
            selectable
          >
            {block.text}
          </Text>
        );

      case "h2":
        return (
          <Text
            key={index}
            style={[
              styles.h2,
              { color: palette.text, fontFamily: theme.boldFont },
            ]}
            selectable
          >
            {block.text}
          </Text>
        );

      case "p":
        return (
          <Text
            key={index}
            style={[styles.paragraph, paragraphStyle]}
            selectable
          >
            {renderRich(block.text, strongStyle)}
          </Text>
        );

      case "ul":
        return (
          <View key={index} style={styles.list}>
            {block.items.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={[styles.bullet, { color: ACCENT }]}>•</Text>
                <Text style={[styles.listItemText, paragraphStyle]} selectable>
                  {renderRich(item, strongStyle)}
                </Text>
              </View>
            ))}
          </View>
        );

      case "company": {
        const c = block.data;
        return (
          <View
            key={index}
            style={[
              styles.companyCard,
              { backgroundColor: palette.cardBg, borderColor: palette.cardBorder },
            ]}
          >
            <Text
              style={[
                styles.companyName,
                { color: palette.text, fontFamily: theme.boldFont },
              ]}
              selectable
            >
              {c.name}
            </Text>

            <CompanyRow label="Adres" value={c.address} palette={palette} theme={theme} />
            <CompanyRow label="Telefon" value={c.phone} palette={palette} theme={theme} />
            <CompanyRow label="E-Posta" value={c.email} palette={palette} theme={theme} />
            <CompanyRow label="Mersis" value={c.mersis} palette={palette} theme={theme} />
            <CompanyRow label="KEP" value={c.kep} palette={palette} theme={theme} />
          </View>
        );
      }

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: horizontalPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            { color: palette.text, fontFamily: theme.boldFont },
          ]}
        >
          {title}
        </Text>
        <View style={[styles.divider, { backgroundColor: palette.divider }]} />

        {blocks.map(renderBlock)}
      </ScrollView>
    </View>
  );
};

type CompanyRowProps = {
  label: string;
  value: string;
  palette: {
    text: string;
    muted: string;
    subtle: string;
  };
  theme: any;
};

const CompanyRow = ({ label, value, palette, theme }: CompanyRowProps) => (
  <View style={styles.companyRow}>
    <Text
      style={[
        styles.companyLabel,
        { color: palette.subtle, fontFamily: theme.boldFont },
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.companyValue,
        { color: palette.muted, fontFamily: theme.regularFont },
      ]}
      selectable
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 22,
  },
  h1: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  h2: {
    fontSize: 14.5,
    lineHeight: 20,
    marginTop: 14,
    marginBottom: 6,
  },
  paragraph: {
    marginBottom: 10,
  },
  list: {
    marginTop: 2,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bullet: {
    width: 16,
    fontSize: 16,
    lineHeight: 23,
  },
  listItemText: {
    flex: 1,
  },
  companyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 14.5,
    lineHeight: 20,
    marginBottom: 12,
  },
  companyRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  companyLabel: {
    width: 74,
    fontSize: 11.5,
    letterSpacing: 0.4,
    paddingTop: 2,
  },
  companyValue: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});

export default LegalDocument;
