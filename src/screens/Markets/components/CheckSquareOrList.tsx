import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { updateSquareOrListValueMarket } from "../../Auth/modules/preferences";
import { useTheme } from "../../../theme/ThemeContext";

const ACCENT = "#F07400";
const ACCENT_END = "#FF8C1A";

const CheckSquareOrList: React.FC = () => {
	const { theme } = useTheme();
	const isDark = theme.themeDetail === "dark";
	const squareOrListValueMarket = useSelector(
		(state: any) => state.preferences.butonClickValueMarket.butonClickValueMarket
	);
	const dispatch = useDispatch();

	const inactiveBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
	const inactiveIcon = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)";

	// Redux'ta `squareOrListValueMarket = true` → liste görünümü
	const isListMode = squareOrListValueMarket;

	const setMode = (listMode: boolean) => {
		if (listMode !== isListMode) {
			dispatch(updateSquareOrListValueMarket(listMode));
		}
	};

	const renderItem = (mode: "list" | "square", iconName: "list" | "grid") => {
		const isActive =
			(mode === "list" && isListMode) || (mode === "square" && !isListMode);

		const iconEl = (
			<Ionicons
				name={isActive ? iconName : (`${iconName}-outline` as any)}
				size={15}
				color={isActive ? "#fff" : inactiveIcon}
			/>
		);

		return (
			<TouchableOpacity
				key={mode}
				activeOpacity={0.85}
				onPress={() => setMode(mode === "list")}
				style={s.itemTouchable}
			>
				{isActive ? (
					<LinearGradient
						colors={[ACCENT, ACCENT_END]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={s.activeItem}
					>
						{iconEl}
					</LinearGradient>
				) : (
					<View style={s.inactiveItem}>{iconEl}</View>
				)}
			</TouchableOpacity>
		);
	};

	return (
		<View style={[s.wrap, { backgroundColor: inactiveBg }]}>
			{renderItem("list", "list")}
			{renderItem("square", "grid")}
		</View>
	);
};

const s = StyleSheet.create({
	wrap: {
		flexDirection: "row",
		borderRadius: 999,
		padding: 3,
		alignItems: "center",
	},
	itemTouchable: {
		// hit area
	},
	activeItem: {
		width: 28,
		height: 28,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
	inactiveItem: {
		width: 28,
		height: 28,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
	},
});

export default CheckSquareOrList;
