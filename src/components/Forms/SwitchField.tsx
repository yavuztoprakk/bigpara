import React from "react";
import { Switch } from "react-native-paper";
import { View, Platform } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import BoldText from "../BoldText";
import { useTheme } from "../../theme/ThemeContext";

const switchStyles = Platform.select({
	ios: {
		transform: [{ scaleX: 0.65 }, { scaleY: 0.65 }, { translateX: -12 }],
	},
	default: {
		transform: [{ translateX: -3 }],
	},
});

const SwitchField = ({ label, input: { onChange, value }, style }) => {
	const { theme } = useTheme();
	return (
		<View
			style={[
				{
					flex: 1,
					flexDirection: "row",
					justifyContent: "flex-start",
					alignItems: "center",
				},
				style,
			]}
		>
			<Switch
				color={theme.portfolio}
				value={value}
				onValueChange={onChange}
				style={switchStyles}
			/>
			<TouchableWithoutFeedback onPress={() => onChange(!value)}>
				<BoldText style={{ color: theme.white }}>{label}</BoldText>
			</TouchableWithoutFeedback>
		</View>
	);
}


export default SwitchField;
