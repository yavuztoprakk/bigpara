import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import Text from "../../../components/Text";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Platform } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { useRoute } from "@react-navigation/native";
import { openDateForm, reset } from "../modules/dateForm";
import store from "../../../store";
import { formatDate } from "../../DetailCustodyChange/components/SelectedDates";

const DateFormTrigger = ({ navigation }) => {
	const { theme } = useTheme();
	const styles = creatStyles(theme);
	const route = useRoute();
	const days = route.params?.days
	const options = route.params?.options

	useEffect(() => () => {
		store.dispatch(reset())
	}, []);

	return (
		<TouchableOpacity
			onPress={() => {
				store.dispatch(
					openDateForm({
						selected: days,
						options,
						attachment: options.length === 1 ? "custom-single" : undefined,
					})
				);
			}
			}
			style={styles.button}
		>
			<Text
				adjustsFontSizeToFit
				numberOfLines={1}
				style={styles.text}>
				{days?.startsWith("custom|")
					? "İki Tarih Arası"
					: days?.startsWith("custom-single|")
						? formatDate(new Date(days.split("custom-single|")[1]))
						: options.filter((o: any) => o.value === days)[0]?.title}
			</Text>
			<Ionicons
				name="funnel"
				color={theme.white}
				size={17}
				style={styles.icon}
			/>
		</TouchableOpacity>
	);
};

const creatStyles = (theme: any) => StyleSheet.create({
	button: {
		paddingRight: 22,
		marginRight: 10,
	},
	text: {
		color: theme.white,
	},
	icon: {
		position: "absolute",
		right: 0,
		top: Platform.OS === "ios" ? 0 : 3,
	},
});

export default DateFormTrigger;
