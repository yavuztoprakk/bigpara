import React from "react";
import { StyleSheet, View } from "react-native";
import BoldText from "../Text";
import { Column } from "./TableAll";
import { useTheme } from "../../theme/ThemeContext";

const HeaderColumn: React.FC<Column> = ({ textAlign, title, width }) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);
	return (
		<View style={[styles.container, { width }]}>
			<BoldText
				style={[styles.text, { textAlign: textAlign || "left", width }]}
			>
				{title}
			</BoldText>
		</View>
	);
}

const createStyles = (theme: any) => StyleSheet.create({
	container: {
		borderRightWidth: 1,
		borderRightColor: theme.darkerBrand
	},
	text: {
		color: theme.white,
		padding: 10
	}
});

export default HeaderColumn;
