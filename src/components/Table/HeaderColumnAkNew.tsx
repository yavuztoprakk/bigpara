import React from "react";
import { StyleSheet, View } from "react-native";
import BoldText from "../Text";
import { ColumnAkNew } from "./TableAkNew";
import { useTheme } from "../../theme/ThemeContext";

const HeaderColumn: React.FC<ColumnAkNew> = ({ textAlign, title, width }) => {
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
		borderRightColor: theme.darkBrand
	},
	text: {
		color: theme.white,
		padding: 10
	}
});

export default HeaderColumn;
