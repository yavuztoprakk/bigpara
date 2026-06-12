import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import Text from "../../../components/Text";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Platform } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { useRoute } from "@react-navigation/native";
import store from "../../../store";
import { openDateForm, reset } from "../modules/dateForm";

const DateForm2Trigger = ({ open, navigation }) => {
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
						attachment: options.length === 1 ? "custom" : "custom"
					})
				);
			}

			}

			style={styles.button}
		>
			<Text style={styles.text}>

				İki Tarih Arası

			</Text>
			<Ionicons
				name="funnel"
				color={theme.onBlue}
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
		fontSize: 13,
		color: theme.onBlue,
	},
	icon: {
		position: "absolute",
		right: 0,
		top: Platform.OS === "ios" ? 0 : 3,
	},
});

export default DateForm2Trigger;
