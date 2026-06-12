import React, { useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import BoldText from "../BoldText";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../theme/ThemeContext";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

interface Props {
	title: string;
	value: string;
	disabled?: boolean;
	showOptionsButton: boolean;
	onOpenSelect: () => void;
	onChange: (newPrice: string) => void;
}

const FormRowForPrice: React.FC<Props> = ({
	title,
	value,
	showOptionsButton,
	onOpenSelect,
	onChange,
	disabled = false,
}) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);

	const inputRef = useRef<TextInput>(null);

	return (
		<View style={[styles.row, styles.rowContainer]}>
			<View style={[styles.columns, styles.columnsContainer]}>
				<View style={styles.leftButtonWrapper}>
					<TouchableOpacity
						style={styles.leftButton}
						onPress={() => inputRef.current?.focus()}
						disabled={disabled}
					>
						<BoldText style={styles.label}>{title}</BoldText>
						<BottomSheetTextInput
							ref={inputRef}
							value={value}
							autoCorrect={false}
							onChangeText={onChange}
							style={[styles.textInput, disabled && styles.textInputDisabled]}
							editable={!disabled}
							placeholderTextColor={theme.primaryText}
						/>
					</TouchableOpacity>
				</View>

				{showOptionsButton && (
					<TouchableOpacity
						style={styles.iconButton}
						onPress={onOpenSelect}
					>
						<Ionicons
							style={styles.icon}
							name="menu"
							size={22}
							color={theme.primaryText}
						/>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	columns: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	row: {
		paddingHorizontal: 15,
		borderBottomColor: theme.darkBrand,
		borderBottomWidth: 1,
		height: 40,
	},
	label: {
		alignSelf: "center",
		color: theme.primaryText,
	},
	rowContainer: {
		paddingRight: 5,
	},
	columnsContainer: {
		alignItems: "center",
	},
	leftButtonWrapper: {
		flexGrow: 1,
	},
	leftButton: {
		flexDirection: "row",
		alignItems: "center",
	},
	textInput: {
		flexGrow: 1,
		height: 45,
		color: theme.white,
		fontFamily: theme.boldFont,
		textAlign: "right",
		paddingRight: 15,
	},
	textInputDisabled: {
		color: theme.primaryText,
	},
	iconButton: {
		width: 30,
		height: 50,
		alignItems: "flex-end",
		justifyContent: "center",
		paddingRight: 15,
	},
	icon: {
		alignSelf: "center",
		color: theme.primaryText,
	},
});

export default FormRowForPrice;
