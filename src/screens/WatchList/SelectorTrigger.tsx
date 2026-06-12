import React from "react";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { open } from "../../modules/bottomSheet";
import { WatchList } from "./modules/watchlists";
import { useTheme } from "../../theme/ThemeContext";
import CheckSquareOrList from "./CheckSquareOrList";

const ACCENT = "#F07400";

interface Props {
	list: WatchList;
	navigation: any;
}

const SelectorTrigger: React.FC<Props> = ({ list }) => {
	const { theme } = useTheme();
	const isDark = theme.themeDetail === "dark";
	const dispatch = useDispatch();

	const triggerBg = isDark ? "rgba(240,116,0,0.10)" : "rgba(240,116,0,0.08)";
	const triggerBorder = isDark ? "rgba(240,116,0,0.35)" : "rgba(240,116,0,0.30)";

	return (
		<View style={[styles.container, { backgroundColor: theme.darkestBrand }]}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={() => dispatch(open({ type: "watchListSelector" }))}
				style={[styles.trigger, { backgroundColor: triggerBg, borderColor: triggerBorder }]}
			>
				<Ionicons name="albums-outline" size={14} color={ACCENT} style={{ marginRight: 6 }} />
				<Text
					style={[styles.triggerText, { color: ACCENT, fontFamily: theme.boldFont }]}
					numberOfLines={1}
				>
					{list?.title}
				</Text>
				<Ionicons name="chevron-down" size={14} color={ACCENT} style={{ marginLeft: 6 }} />
			</TouchableOpacity>
			<CheckSquareOrList />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	trigger: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 999,
		borderWidth: 1,
		maxWidth: "70%",
	},
	triggerText: {
		fontSize: 13.5,
		letterSpacing: 0.2,
		flexShrink: 1,
	},
});

export default SelectorTrigger;
