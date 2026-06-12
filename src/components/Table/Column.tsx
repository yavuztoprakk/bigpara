import React from "react";
import { StyleSheet, View } from "react-native";
import BoldText from "../Text";
import { Column } from "./Table";
import { changeColor } from "../../screens/Markets/modules/prices";
import { useTheme } from "../../theme/ThemeContext";

const numeral = require("numeral");

interface Props {
	column: Column;
	value: any;
	fixed?: boolean;
}

const ValColumn: React.FC<Props> = ({ value, column, fixed }) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);

	const displayValue =
		column.type === "change" && value
			? numeral(value).format("0,0.00")
			: column.type === "tl" && typeof value === "number"
				? value.toFixed(2)
				: value;

	return (
		<View style={styles.container}>
			{typeof column.render !== "function" && (
				<BoldText
					numberOfLines={fixed ? 3 : 1}
					adjustsFontSizeToFit
					style={[
						styles.text,
						{
							textAlign: column.textAlign || "left",
							width: column.width,
						},
						column.type === "change" && { color: changeColor(value, theme), fontFamily: theme.boldFont, },
						fixed && { color: theme.white },
					]}
				>
					{displayValue}
				</BoldText>
			)}
			{column.render && column.render(value)}
		</View>
	);
}

const createStyles = (theme: any) => StyleSheet.create({
	container: {
		borderBottomWidth: 1,
		borderBottomColor: theme.darkBrand,
		justifyContent: "center",
		height: 40,
	},
	text: {
		color: theme.primaryText,
		paddingHorizontal: 10,
		alignItems: "center",
		textAlign: "right",
	},
});

export default ValColumn;
