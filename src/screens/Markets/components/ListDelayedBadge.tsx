import React from "react";
import { TouchableOpacity, View, StyleSheet, Platform } from "react-native";
import Text from "../../../components/Text";
import { useTheme } from "../../../theme/ThemeContext";

interface Props {
	navigation: any;
}

const ACCENT = "#F07400";

const ListDelayedBadge: React.FC<Props> = ({ navigation }) => {
	const { theme } = useTheme();
	const isDark = theme.themeDetail === "dark";

	const handlePress = () => null; // navigation.navigate("InfoOpenAccount");

	// Opak arka plan — altındaki satır içeriği görünmesin.
	const containerStyle = {
		backgroundColor: isDark ? "#2A1A0F" : "#FFF3E6",
		borderColor: isDark ? "rgba(240,116,0,0.45)" : "rgba(240,116,0,0.35)",
	};

	const titleColor = isDark ? "#FFB978" : "#A04A00";
	const descColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(60,30,0,0.78)";

	return (
		<TouchableOpacity
			activeOpacity={0.85}
			onPress={handlePress}
			style={[s.container, containerStyle]}
		>
			<View style={s.body}>
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
			</View>
		</TouchableOpacity>
	);
};

const s = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: 10,
		// Liste alanından ufak boşluk + tab bar'a yakın dursun.
		marginTop: 6,
		marginBottom: 8,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 14,
		borderWidth: StyleSheet.hairlineWidth,
		...Platform.select({
			ios: {
				shadowColor: ACCENT,
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.18,
				shadowRadius: 10,
			},
			android: { elevation: 3 },
		}),
	},
	body: {
		alignItems: "center",
	},
	title: {
		fontSize: 12.5,
		letterSpacing: 0.2,
		marginBottom: 2,
		textAlign: "center",
	},
	desc: {
		fontSize: 11.5,
		lineHeight: 15,
		letterSpacing: 0.1,
		textAlign: "center",
	},
});

export default ListDelayedBadge;
