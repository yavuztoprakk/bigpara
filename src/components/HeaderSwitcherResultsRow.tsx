import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import BoldText from "./BoldText";
import { HeaderSwitcherSelectHandler } from "./HeaderSwitcherResults";
import { RootState } from "../store";
import { useTheme } from "../theme/ThemeContext";

interface Props {
	code: string;
	onSelect: HeaderSwitcherSelectHandler;
	isLast: boolean;
}

const HeaderSwitcherResultsRow: React.FC<Props> = ({
	code,
	onSelect,
	isLast,
}) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);

	const data1 = useSelector((state: RootState) => state.symbolBrokerages);

	return (
		<TouchableOpacity
			style={{
				padding: 10,
				borderBottomWidth: isLast ? 0 : 1,
				borderBottomColor: theme.separator,
			}}
			onPress={() => onSelect(data1.length <= 0 ? code : code.split("|")[0])}
		>
			<BoldText style={styles.label}>
				{data1.length <= 0 ? code : code.replace("|", " - ")}
			</BoldText>
		</TouchableOpacity>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	label: {
		color: theme.white,
	},
});

export default HeaderSwitcherResultsRow;
