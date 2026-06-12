import React, { useState } from "react";
import BoldText from "../BoldText";
import { TextInput, StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

const TextField = ({
	secure,
	label,
	input: { onChange, onBlur, value },
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
					value={value}
					onChangeText={onChange}
					onBlur={onBlur}
					style={styles.input}
					//keyboardType='number-pad'
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
						{forceVisible ?
							<Ionicons
								name="eye"
								size={26}
								color={theme.primaryText}
							/>
							:
							<Ionicons
								name="eye-off"
								size={26}
								color={theme.primaryText}
							/>
						}

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
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	input: {
		fontSize: 17,
		color: theme.white,
		fontFamily: theme.regularFont,
		padding: 10,
		borderWidth: 1,
		borderColor: theme.primaryText,
		borderRadius: 8,
		marginBottom: 20,
	},
	label: {
		color: theme.white,
		marginBottom: 5,
	},
});

export default TextField;
