import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import Text from "../../../components/Text";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Platform } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";

interface Props {
  open: (type: string) => void;
}

const FilterTrigger: React.FC<Props> = ({ open }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      onPress={() => open("calendarFilterEkonomikTakvim")}
      style={styles.button}
    >
      <Text style={styles.text}>Filtrele</Text>
      <Ionicons
        name="funnel"
        color={theme.white}
        size={17}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  button: {
    paddingRight: 22,
    marginRight: 10,
  },
  text: {
    color: theme.white,
  },
  icon: {
    position: "absolute",
    right: 0,
    top: Platform.OS === "ios" ? 0 : 3,
  },
});

export default FilterTrigger;
