import React, { useState, useCallback } from "react";
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Modal,
	Pressable,
	Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import Text from "./Text";

// Ekranım header'ında bigpara logosunun solunda görünen küçük saat ikonu.
// Tıklanınca "Veriler 15 dk. gecikmelidir" mesajı tooltip olarak açılır.
// Sadece demo modda görünür (isDemo true).
const ACCENT = "#F07400";
// iOS native-stack header ~44, Android ~56 yüksekliğinde — tooltip bunun altına anchor'lanır.
const HEADER_HEIGHT = Platform.OS === "ios" ? 44 : 56;

const DelayedHeaderBadge: React.FC = () => {
	const { theme } = useTheme();
	const insets = useSafeAreaInsets();
	const isDemo = useSelector((state: any) => state.auth?.demo);
	const [open, setOpen] = useState(false);

	const isDark = theme.themeDetail === "dark";

	const handleOpen = useCallback(() => setOpen(true), []);
	const handleClose = useCallback(() => setOpen(false), []);

	if (!isDemo) return null;

	const cardBg = isDark ? "#2A1A0F" : "#FFF3E6";
	const cardBorder = isDark ? "rgba(240,116,0,0.45)" : "rgba(240,116,0,0.35)";
	const titleColor = isDark ? "#FFB978" : "#A04A00";
	const descColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(60,30,0,0.78)";

	const tooltipTop = insets.top + HEADER_HEIGHT + 2;
	// Ok'un yatay konumu — badge'in icon-wrap merkezine yaklaşık denk gelsin.
	const arrowLeft = 22;

	return (
		<>
			<TouchableOpacity
				accessibilityRole="button"
				accessibilityLabel="Veri gecikme bilgisi"
				activeOpacity={0.7}
				onPress={handleOpen}
				style={s.touch}
				hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
			>
				<View style={[s.iconWrap, { backgroundColor: isDark ? "rgba(240,116,0,0.18)" : "rgba(240,116,0,0.12)" }]}>
					<Ionicons name="time-outline" size={18} color={ACCENT} />
				</View>
			</TouchableOpacity>

			<Modal
				visible={open}
				transparent
				animationType="fade"
				onRequestClose={handleClose}
				statusBarTranslucent
			>
				<Pressable style={s.backdrop} onPress={handleClose}>
					<View pointerEvents="box-none" style={[s.tooltipAnchor, { paddingTop: tooltipTop }]}>
						<View
							pointerEvents="none"
							style={[
								s.arrow,
								{
									marginLeft: arrowLeft,
									borderBottomColor: cardBg,
								},
							]}
						/>
						<Pressable
							onPress={() => { }}
							style={[
								s.tooltipCard,
								{
									backgroundColor: cardBg,
									borderColor: cardBorder,
								},
							]}
						>
							<Text
								allowFontScaling={false}
								style={[s.title, { color: titleColor, fontFamily: theme.boldFont }]}
							>
								Veriler 15 dk. gecikmelidir
							</Text>
							<Text
								allowFontScaling={false}
								style={[s.desc, { color: descColor, fontFamily: theme.regularFont }]}
							>
								Canlı veri için müşteri girişi yapmanız gerekmektedir
							</Text>
						</Pressable>
					</View>
				</Pressable>
			</Modal>
		</>
	);
};

const s = StyleSheet.create({
	touch: {
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	iconWrap: {
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: "center",
		justifyContent: "center",
	},
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.06)",
	},
	tooltipAnchor: {
		paddingHorizontal: 12,
	},
	arrow: {
		width: 0,
		height: 0,
		borderLeftWidth: 8,
		borderRightWidth: 8,
		borderBottomWidth: 8,
		borderLeftColor: "transparent",
		borderRightColor: "transparent",
	},
	tooltipCard: {
		alignSelf: "stretch",
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderRadius: 14,
		borderWidth: StyleSheet.hairlineWidth,
		...Platform.select({
			ios: {
				shadowColor: ACCENT,
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.2,
				shadowRadius: 10,
			},
			android: { elevation: 4 },
		}),
	},
	title: {
		fontSize: 13,
		letterSpacing: 0.2,
		marginBottom: 4,
	},
	desc: {
		fontSize: 12,
		lineHeight: 16,
		letterSpacing: 0.1,
	},
});

export default DelayedHeaderBadge;
