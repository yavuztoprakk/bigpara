import React, { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "../theme/ThemeContext";
import BoldText from "./BoldText";
const DarkModeToggler = () => {
  const { theme, toggleTheme } = useContext(ThemeContext); // Tema contextini kullanıyoruz
  const [currentTheme, setCurrentTheme] = useState(theme);

  // Temayı güncelleme ve AsyncStorage'a kaydetme
  const onDarkModeToggle = (v) => {
    AsyncStorage.setItem("IS_DARK_MODE_ON", v).then(() => {
      if (v === "0") toggleTheme("dark");
      else toggleTheme("light");
    });
  };

  useEffect(() => {
    setCurrentTheme(theme); // theme güncellenince state'i güncelle
  }, [theme]);

  const themeList = [
    { id: "dark", title: "Koyu Tema", v: "0" },
    { id: "light", title: "Açık Tema", v: "1" },
    // { id: "info", title: "IDeal Tema", v: "2" },
  ];

  const Item = ({ title, id, v }) => (
    <TouchableOpacity
      onPress={() => onDarkModeToggle(v)}
      style={[
        styles.listContainer,
        { borderBottomColor: currentTheme.primaryText },
      ]}
    >
      {currentTheme.detail === v ? (
        <View style={styles.iconView}>
          <Ionicons name={"checkmark"} size={25} color={currentTheme.green} />
        </View>
      ) : (
        <View style={styles.iconView} />
      )}
      <View style={styles.textView}>
        <BoldText style={[styles.text, { color: currentTheme.primaryText }]}>
          {title}
        </BoldText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: currentTheme.darkerBrand }]}
    >
      <FlatList
        data={themeList}
        renderItem={({ item }) => <Item {...item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 45,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    paddingLeft: 5,
    fontSize: 16,
  },
  iconView: { width: "10%", alignItems: "center" },
  textView: { width: "90%" },
});

export default DarkModeToggler;
