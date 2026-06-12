import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	View,
	StyleSheet,
	TouchableOpacity,
	TextInputProps,
} from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useTheme } from "../../theme/ThemeContext";
import numeral from "numeral";

interface Props extends TextInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	focus?: boolean;
	numeric?: boolean;
	decimal?: boolean;
	onFocus?: () => void;
	onBlur?: () => void;
}

const FormRowForInput: React.FC<Props> = ({
	label,
	value,
	onChange,
	focus = false,
	numeric = false,
	decimal = false,
	onFocus,
	onBlur,
	style,
	...otherProps
}) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);

	const inputRef = useRef<typeof BottomSheetTextInput>(null);
	const [focused, setFocused] = useState(false);

	// Format the value for numeric or decimal inputs
	const formattedValue = useMemo(
		() =>
			numeric && !!value
				? numeral(value).format(decimal && !focused ? "0,0.00" : "0,0")
				: value,
		[value, numeric, decimal, focused]
	);

	const formattedOnChange = (text: string) => {
		onChange(numeric ? text.replace(/[\.,]/g, "") : text);
	};

	useEffect(() => {
		if (focus) {
			// Focus input after a short delay to ensure proper rendering
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [focus]);

	return (
		<TouchableOpacity
			onPress={() => inputRef.current?.focus()}
			style={[styles.row, style]}
			activeOpacity={1}
		>
			<View style={styles.columns}>
				{/* <BoldText style={styles.label}>{label}</BoldText> */}
				<BottomSheetTextInput
					ref={inputRef}
					value={formattedValue}
					onChangeText={formattedOnChange}
					style={styles.textInput}
					autoCorrect={false}
					autoCapitalize="none"
					placeholderTextColor={theme.primaryText}
					accessibilityLabel={label}
					onFocus={() => {
						setFocused(true);
						if (numeric && decimal) {
							onChange("");
						}
						if (onFocus) onFocus();
					}}
					onBlur={() => {
						setFocused(false);
						if (onBlur) onBlur();
					}}
					{...otherProps}
				/>
			</View>
		</TouchableOpacity>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	columns: {
		flex: 1,
		flexDirection: "column",
	},
	row: {
		paddingHorizontal: 15,
		borderBottomColor: theme.darkBrand,
		borderBottomWidth: 1,
		height: 50, // Adjusted height for better spacing
		backgroundColor: theme.darkerBrand, // Dynamic background support
		marginVertical: 5,
	},
	label: {
		color: theme.primaryText,
		fontSize: 16,
		marginBottom: 5, // Spacing between label and input
	},
	textInput: {
		height: 45,
		color: theme.white,
		fontFamily: theme.boldFont,
		textAlign: "left",
		padding: 10,
		borderRadius: 8, // Rounded input for better aesthetics
		backgroundColor: theme.darkBrand, // Input background color
	},
});

export default FormRowForInput;
