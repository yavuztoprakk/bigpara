import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { useTheme } from "../theme/ThemeContext";

const Loading: React.FC = () => {
	const { theme } = useTheme();
	return (
		<View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
			<LottieView
				source={require("../../assets/lottie/loading-dots.json")}
				autoPlay
				loop
				renderMode="HARDWARE"
				style={styles.lottie}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	lottie: {
		width: 80,
		height: 80,
	},
});

export default Loading;
