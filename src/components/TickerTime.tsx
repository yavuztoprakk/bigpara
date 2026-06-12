import React from "react";
import { StyleSheet } from "react-native";
import Text from "./Text";
import { useTheme } from "../theme/ThemeContext";

const TickerTime = ({ time, textStyle }) => {
	const { theme } = useTheme(); // Tema kullanımı

	// Memoized styles to dynamically apply theme
	const styles = createStyles(theme);

	const strTime = `${time}`.padStart(6, "0");

	return (
		<Text style={[styles.time, textStyle]}>
			{strTime.substring(0, 2)}:{strTime.substring(2, 4)}:
			{strTime.substring(4, 6)}
		</Text>
	);
};

// Function to create styles dynamically based on the theme
const createStyles = (theme: { white: any; }) =>
	StyleSheet.create({
		time: {
			color: theme.white, // Temadan gelen renk
			fontSize: 12,
		},
	});

export default TickerTime;
