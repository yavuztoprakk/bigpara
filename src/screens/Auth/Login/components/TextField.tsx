import React, { useState } from "react";
import { TextInput, StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BoldText from "../../../../components/BoldText";
import { useTheme } from "../../../../theme/ThemeContext";

const TextField = ({
  secure,
  label,
  input: { onChange, ...restInput },
  touched,
  error,
}) => {
  const [forceVisible, setForceVisible] = useState(false);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <React.Fragment>
      <BoldText style={styles.label}>{label}</BoldText>
      <View>
        <TextInput
          onChangeText={onChange}
          {...restInput}
          style={styles.input}
          secureTextEntry={secure && !forceVisible}
          textContentType="oneTimeCode"
          autoCapitalize="none"
        />
        {touched && error && <BoldText>{error}</BoldText>}
        {secure && (
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setForceVisible(!forceVisible)}
          >
            <Ionicons name="eye" size={23} color={theme.primaryText} />
          </TouchableOpacity>
        )}
      </View>
    </React.Fragment>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  icon: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 10,
  },
  input: {
    fontSize: 17,
    color: theme.white,
    fontFamily: theme.regularFont,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.darkBrand,
    backgroundColor: theme.darkBrand,
    borderRadius: 4,
    marginBottom: 15,
  },
  label: {
    color: theme.white,
    marginBottom: 5,
  },
});

export default TextField;
