import React from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

const Header = ({
  backgroundColor,
  tintColor,
  backButton = false,
  children,
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: backgroundColor || theme.header },
      ]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.innerContainer}>
        {backButton && (
          <Ionicons
            name="arrow-back"
            size={24}
            color={tintColor || theme.text}
            onPress={handleGoBack}
          />
        )}
        {children}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.header,
    },
    innerContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      height: 56, // Standart AppBar yüksekliği
    },
  });

export default Header;
