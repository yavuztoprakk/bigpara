import React from "react";
import { View, StyleSheet } from "react-native";
import BoldText from "./BoldText";
import { useTheme } from "../theme/ThemeContext";

interface Props {
	message: string;
}

const HeaderSwitcherResultsMessage: React.FC<Props> = ({ message }) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);
	return (
		<View style={styles.container}>
			<BoldText style={styles.text}>{message}</BoldText>
		</View>
	);
}

const createStyles = (theme: any) => StyleSheet.create({
	container: {
		padding: 15
	},
	text: {
		textAlign: "center",
		color: theme.primaryText
	}
});

export default HeaderSwitcherResultsMessage;
