import React from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import BoldText from "../BoldText";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../theme/ThemeContext";

interface Props {
	title: string;
	value: string;
	disabled?: boolean;
	onPress?: () => void; // BottomSheet'i açmak için kullanılır
}

const FormRowForAttachment: React.FC<Props> = ({
	onPress,
	title,
	value,
	disabled,
}) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);
	return (
		<TouchableOpacity
			disabled={disabled}
			onPress={() => {
				Keyboard.dismiss(); // Klavyeyi kapat
				setTimeout(() => {
					if (onPress) {
						onPress(); // 3 saniye sonra onPress çalıştır
					}
				}, 300); // 3 saniye gecikme
			}}
			style={styles.row}
		>
			<View style={styles.columns}>
				<BoldText style={styles.label}>{title}</BoldText>

				<BoldText style={[styles.value, disabled && styles.valueDisabled]}>
					{value}
				</BoldText>

				{onPress && (
					<Ionicons
						style={styles.icon}
						name="chevron-forward"
						size={22}
						color="white"
					/>
				)}
			</View>
		</TouchableOpacity>
	);
};

const createStyles = (theme: any) =>
	StyleSheet.create({
		row: {
			paddingHorizontal: 15,
			borderBottomColor: "gray",
			borderBottomWidth: StyleSheet.hairlineWidth,
			height: 45,
		},
		columns: {
			flex: 1,
			flexDirection: "row",
			justifyContent: "space-between",
		},
		label: {
			alignSelf: "center",
			color: theme.primaryText,
		},
		value: {
			flex: 1,
			color: theme.white,
			textAlign: "right",
			alignSelf: "center",
		},
		valueDisabled: {
			color: theme.primaryText,
		},
		icon: {
			alignSelf: "center",
			marginLeft: 10,
			marginTop: 2,
			color: theme.primaryText,
		},
	});

export default FormRowForAttachment;
