import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  LayoutAnimation,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../theme/ThemeContext";

const Layout = {
  window: {
    width: Dimensions.get("window").width,
  },
};

const SearchContainerHorizontalMargin = 10;
const SearchContainerWidth =
  Layout.window.width - SearchContainerHorizontalMargin * 2;

const SearchIcon = () => {
  const { theme } = useTheme();
  return (
    <View style={styles.searchIconContainer}>
      <Ionicons name="search" size={18} color={theme.placeholder} />
    </View>
  );
};

const SearchBar = ({
  placeholder = "Sembol Ara...",
  textColor,
  placeholderTextColor = "#ccc",
  tintColor = "#007AFF",
  cancelButtonText,
  onChangeQuery,
  onSubmit,
  onCancelPress,
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [text, setText] = useState("");
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [inputWidth, setInputWidth] = useState(SearchContainerWidth);
  const textInputRef = useRef(null);
  useEffect(() => {
    textInputRef.current?.focus();
    setShowCancelButton(true);
  }, []);

  const handleLayoutCancelButton = (e) => {
    if (showCancelButton) return;

    const cancelButtonWidth = e.nativeEvent.layout.width;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCancelButton(true);
    setInputWidth(SearchContainerWidth - cancelButtonWidth);
  };

  const handleChangeText = (inputText) => {
    setText(inputText);
    onChangeQuery?.(inputText);
  };

  const handleSubmit = () => {
    onSubmit?.(text);
    textInputRef.current?.blur();
  };

  const handleCancel = () => {
    onCancelPress
      ? onCancelPress(() => navigation.goBack())
      : navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { width: inputWidth }]}>
        <TextInput
          ref={textInputRef}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={text}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          style={[styles.searchInput, { color: textColor || theme.text }]}
        />
        <SearchIcon />
      </View>
      {showCancelButton && (
        <View style={styles.cancelButtonContainer}>
          <TouchableOpacity
            onPress={handleCancel}
            onLayout={handleLayoutCancelButton}
          >
            <Text style={{ color: tintColor }}>{cancelButtonText}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    height: 40,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    flex: 1,
    marginHorizontal: SearchContainerHorizontalMargin,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
  },
  searchIconContainer: {
    padding: 10,
  },
  cancelButtonContainer: {
    marginLeft: 8,
  },
});

export default SearchBar;
