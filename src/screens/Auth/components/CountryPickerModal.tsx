import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// @ts-ignore - react-native-flags has no types
import Flag from "react-native-flags";
import { useTheme } from "../../../theme/ThemeContext";
import { countries, Country } from "../data/countries";

interface Props {
  visible: boolean;
  selectedCode?: string;
  onClose: () => void;
  onSelect: (country: Country) => void;
}

const normalize = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");

const CountryPickerModal: React.FC<Props> = ({
  visible,
  selectedCode,
  onClose,
  onSelect,
}) => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";
  const accent = "#F07400";
  const text = theme.white;
  const readable = isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.68)";
  const subtle = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)";
  const placeholder = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)";
  const inputBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.025)";
  const inputBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const rowBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return countries;
    const q = normalize(query.trim());
    return countries.filter(
      (c) =>
        normalize(c.name).includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q.toLowerCase())
    );
  }, [query]);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setQuery("");
    onClose();
  };

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable style={s.backdrop} onPress={handleClose}>
        <Pressable
          style={[
            s.sheet,
            {
              backgroundColor: isDark ? "#181E26" : "#FFFFFF",
              borderColor: inputBorder,
            },
          ]}
          onPress={() => {}}
        >
          <View style={s.handle} />

          <View style={s.headerRow}>
            <Text style={[s.title, { color: text, fontFamily: theme.boldFont }]}>
              Ülke Seçin
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={subtle} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              s.searchRow,
              { backgroundColor: inputBg, borderColor: inputBorder },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={16}
              color={subtle}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={[s.searchInput, { color: text, fontFamily: theme.regularFont }]}
              placeholder="Ülke veya kod ara"
              placeholderTextColor={placeholder}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color={subtle} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            style={s.list}
            renderItem={({ item }) => {
              const isSelected = item.code === selectedCode;
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item)}
                  style={[
                    s.row,
                    {
                      borderBottomColor: rowBorder,
                      backgroundColor: isSelected
                        ? accent + "12"
                        : "transparent",
                    },
                  ]}
                >
                  <Flag code={item.flag} size={24} type="flat" />
                  <Text
                    style={[
                      s.rowName,
                      {
                        color: isSelected ? accent : text,
                        fontFamily: isSelected
                          ? theme.boldFont
                          : theme.regularFont,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      s.rowDial,
                      { color: readable, fontFamily: theme.boldFont },
                    ]}
                  >
                    {item.dialCode}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={accent}
                      style={{ marginLeft: 6 }}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={s.emptyWrap}>
                <Text
                  style={[
                    s.emptyText,
                    { color: subtle, fontFamily: theme.regularFont },
                  ]}
                >
                  Sonuç bulunamadı
                </Text>
              </View>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "80%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 22 : 16,
  },
  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(127,127,127,0.35)",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    letterSpacing: -0.2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    height: "100%",
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rowName: {
    flex: 1,
    fontSize: 14,
  },
  rowDial: {
    fontSize: 13.5,
  },
  emptyWrap: {
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
  },
});

export default CountryPickerModal;
