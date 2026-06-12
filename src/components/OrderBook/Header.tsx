import React from "react";
import { View, StyleSheet } from "react-native";
import BoldText from "../BoldText";
import { useTheme } from '../../theme/ThemeContext';

const Header: React.FC = () => {
	const { theme } = useTheme();
	const styles = createStyles(theme);

	return (
		<View style={styles.container}>
			<View style={styles.side}>
				<BoldText style={{ ...styles.col }}>A. E</BoldText>
				<BoldText style={{ ...styles.col, ...styles.buyLotColor }}>
					A. Lot
				</BoldText>
				<BoldText style={{ ...styles.col, ...styles.buyPriceCol }}>
					Alış
				</BoldText>
			</View>
			<View style={styles.side}>
				<BoldText style={{ ...styles.col, ...styles.sellPriceCol }}>
					Satış
				</BoldText>
				<BoldText style={{ ...styles.col, ...styles.sellLotCol }}>
					S. Lot
				</BoldText>
				<BoldText style={{ ...styles.col }}>S. E</BoldText>
			</View>
		</View>
	);
}


const createStyles = (theme: any) => StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: theme.darkestBrand,
		borderBottomWidth: 1,
		borderBottomColor: theme.darkBrand,
	},
	side: {
		width: "48%",
		flex: 1,
		flexDirection: "row",
	},
	col: {
		color: theme.onBlue,
		padding: 10,
	},
	buyLotColor: {
		flexGrow: 1,
		textAlign: "right",
	},
	buyPriceCol: {
		width: 60,
		textAlign: "right",
	},
	sellLotCol: {
		flexGrow: 1,
		textAlign: "left",
	},
	sellPriceCol: {
		width: 60,
		textAlign: "left",
	},
});

export default Header;
