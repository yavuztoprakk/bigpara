import React, { useState } from "react";
import { useController } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, StyleSheet, View, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import BoldText from "../BoldText";

const ControlledInput = ({
  secure = false,
  label = "",
  name,
  control,
  rules = undefined,
  defaultValue,
  keyboardType = undefined,
  inputStyle = {},
  controlColor = false,
}: {
  secure?: boolean;
  label?: string;
  name: string;
  control: any;
  rules?: any;
  defaultValue?: any;
  keyboardType?: any;
  inputStyle?: any;
  controlColor?: boolean
}) => {
  const [forceVisible, setForceVisible] = useState(false);
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
    formState: { touchedFields, dirtyFields },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    icon: {
      position: "absolute",
      right: 0,
      top: 0,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    errorText: { color: theme.red, marginTop: 5 },
    inputContainer: { marginBottom: 20 },
    input: {
      fontSize: 17,
      color: theme.white,
      fontFamily: theme.regularFont,
      padding: 10,
      borderWidth: 1,
      borderColor: theme.separator,
      borderRadius: 4,
    },
    label: {
      color: theme.white,
      marginBottom: 5,
    },
  });

  return (
    <React.Fragment>
      <BoldText style={styles.label}>{label}</BoldText>
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          style={[styles.input, inputStyle]}
          secureTextEntry={secure && !forceVisible}
          textContentType="oneTimeCode"
          autoCapitalize="none"
          keyboardType={keyboardType}
        />
        {error && <BoldText style={styles.errorText}>{error.message}</BoldText>}
        {secure && (
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setForceVisible(!forceVisible)}
          >
            <Ionicons name="eye" size={26} color={controlColor ? "white" : theme.primaryText} />
          </TouchableOpacity>
        )}
      </View>
    </React.Fragment>
  );
};

export default ControlledInput;
