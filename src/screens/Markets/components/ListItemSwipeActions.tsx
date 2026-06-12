import React from "react";
import { View, StyleSheet } from "react-native";
import BoldText from "../../../components/BoldText";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../../theme/ThemeContext";

interface Props {
	showTradeButtons: boolean;
	onBuy: () => void;
	onSell: () => void;
}

const ListItemSwipeActions: React.FC<Props> = ({
	showTradeButtons,
	onBuy,
	onSell,
}) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);

	return (
		<View style={[styles.container, { width: showTradeButtons ? 120 : 0 }]}>
			{showTradeButtons && (
				<React.Fragment>
					<TouchableOpacity
						onPress={onBuy}
						style={[styles.tradeButton, styles.buyButton]}
					>
						<BoldText style={styles.tradeLabel}>AL</BoldText>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={onSell}
						style={[styles.tradeButton, styles.sellButton]}
					>
						<BoldText style={styles.tradeLabel}>SAT</BoldText>
					</TouchableOpacity>
				</React.Fragment>
			)}
		</View>
	);
}


const createStyles = (theme: any) => StyleSheet.create({
	container: {
		justifyContent: "flex-end",
		flexDirection: "row",
	},
	tradeButton: {
		width: 60,
		height: 40,
		justifyContent: "center",
	},
	buyButton: {
		backgroundColor: theme.green,
	},
	sellButton: {
		backgroundColor: theme.red,
	},
	tradeLabel: {
		textAlign: "center",
	},
});

export default ListItemSwipeActions;
