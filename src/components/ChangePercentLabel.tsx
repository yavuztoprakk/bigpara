import React from "react";
import BoldText from "./BoldText";
import { TextStyle } from "react-native";
import { changeColor } from "../screens/Markets/modules/prices";
import { useTheme } from "../theme/ThemeContext";

interface Props {
	change: number;
	textStyle?: TextStyle;
}

const ChangePercentLabel: React.FC<Props> = ({ change, textStyle }) => {
	const { theme } = useTheme();
	const color = changeColor(change, theme);

	return (
		<BoldText style={{ color, ...textStyle }}>
			%{isNaN(change) ? "-" : change.toFixed(2)}
		</BoldText>
	);
};

export default ChangePercentLabel;
