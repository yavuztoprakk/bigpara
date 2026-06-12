import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";
import BoldText from "../BoldText";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Option } from "./Select";

interface Props {
	option: Option;
	active: boolean;
	onPress: (value: string) => void;
	onDelete?: () => void;
	showDeleteIcon?: boolean;
}

const ACCENT = "#F07400";

const SelectRow: React.FC<Props> = ({
	option,
	active,
	onPress,
	onDelete,
	showDeleteIcon = false,
}) => {
	const { theme } = useTheme();
	const isDark = theme.themeDetail === "dark";
	const styles = createStyles(theme, active, isDark);

	return (
		<View style={styles.outer}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={() => onPress(option.value)}
				style={styles.row}
			>
				{/* Modern radio dot */}
				<View style={styles.radioOuter}>
					{active && <View style={styles.radioInner} />}
				</View>

				<BoldText style={styles.title} numberOfLines={1}>
					{option.title}
				</BoldText>

				{showDeleteIcon && onDelete && (
					<TouchableOpacity
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						onPress={onDelete}
						activeOpacity={0.6}
						style={styles.deleteBtn}
					>
						<Ionicons name="trash-outline" size={17} color={theme.red} />
					</TouchableOpacity>
				)}
			</TouchableOpacity>
		</View>
	);
};

const createStyles = (theme: any, active: boolean, isDark: boolean) => {
	const activeBg = isDark ? "rgba(240,116,0,0.10)" : "rgba(240,116,0,0.07)";
	const subtleBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

	return StyleSheet.create({
		outer: {
			paddingHorizontal: 12,
			paddingVertical: 4,
		},
		row: {
			flexDirection: "row",
			alignItems: "center",
			height: 50,
			paddingHorizontal: 14,
			borderRadius: 14,
			backgroundColor: active ? activeBg : "transparent",
			borderWidth: active ? 1 : StyleSheet.hairlineWidth,
			borderColor: active ? ACCENT + "55" : subtleBorder,
		},
		radioOuter: {
			width: 20,
			height: 20,
			borderRadius: 10,
			borderWidth: 2,
			borderColor: active ? ACCENT : subtleBorder,
			alignItems: "center",
			justifyContent: "center",
			marginRight: 12,
		},
		radioInner: {
			width: 10,
			height: 10,
			borderRadius: 5,
			backgroundColor: ACCENT,
		},
		title: {
			flex: 1,
			color: active ? ACCENT : theme.primaryText,
			fontSize: 15,
			letterSpacing: 0.2,
		},
		deleteBtn: {
			width: 32,
			height: 32,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 999,
		},
	});
};

export default SelectRow;
