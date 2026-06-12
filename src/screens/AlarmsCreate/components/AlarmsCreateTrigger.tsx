import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import store from "../../../store";
import { open } from "../modules/create";

type IconName = keyof typeof Ionicons.glyphMap;

interface Props {
  code: string;
  icon?: IconName;
  size?: number;
  disabled?: boolean;
}

const AlarmsCreateTrigger: React.FC<Props> = ({
  code,
  icon = "notifications",
  size = 24,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => {
        store.dispatch(open({ code }))
      }
      }
      style={styles.button}
    >
      <Ionicons
        name={icon}
        color={disabled ? "#9999" : theme.white}
        size={size}
      />
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    button: {
      paddingRight: 15,
      paddingLeft: 10,
    },
  });

export default AlarmsCreateTrigger;
