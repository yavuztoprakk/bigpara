import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../theme/ThemeContext";
import { showMessage } from "react-native-flash-message";

const ACCENT = "#F07400";

type MenuKey = "Contact" | "Privacy" | "Terms";

type MenuOption = {
  key: MenuKey;
  icon: string;
  label: string;
  route?: string;
};

const OPTIONS: ReadonlyArray<MenuOption> = [
  { key: "Contact", icon: "mail-outline", label: "Bize Yazın", route: "BizeYazin" },
  { key: "Privacy", icon: "shield-checkmark-outline", label: "Gizlilik Politikası", route: "GizlilikPolitikasi" },
  { key: "Terms", icon: "document-text-outline", label: "Kullanıcı Sözleşmesi", route: "KullaniciSozlesmesi" },
];

const Hakkimizda = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const isDark = theme.themeDetail === "dark";

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const subtle = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)";
  const chevron = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)";

  const handlePress = (option: MenuOption) => {
    if (option.route) {
      navigation.navigate(option.route);
      return;
    }
    // İçerikler ilerleyen aşamada bağlanacak
    showMessage({ type: "info", message: `${option.label}: Yakında aktif olacak.` });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: subtle, fontFamily: theme.boldFont },
          ]}
        >
          HAKKIMIZDA
        </Text>

        {OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            activeOpacity={0.7}
            onPress={() => handlePress(option)}
            style={[
              styles.menuItem,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: ACCENT + "18" }]}>
              <Ionicons name={option.icon as any} size={18} color={ACCENT} />
            </View>
            <Text
              style={[
                styles.menuLabel,
                { color: theme.white, fontFamily: theme.regularFont },
              ]}
            >
              {option.label}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={chevron} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14.5,
  },
});

export default Hakkimizda;
