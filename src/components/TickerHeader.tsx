
import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { columnOptions } from "../screens/Markets/modules/lists";
import { TouchableOpacity } from "react-native-gesture-handler";
import BoldText from "./BoldText";
import { useTheme } from "../theme/ThemeContext";
import { useSelector } from "react-redux";
import { columnsSelector } from "../screens/Auth/modules/preferences";

interface Props {
	open: (colIndex: number) => void;
	disableOpen?: boolean;
	// Liste tarafından (örn. compact mode) override edilen kolonlar.
	// Verilmezse Redux'tan kullanıcı tercihi okunur.
	columns?: string[];
}

const TickerHeader: React.FC<Props> = ({ open, disableOpen = false, columns: externalColumns }) => {
	const { theme } = useTheme();
	const styles = useMemo(() => createStyles(theme), [theme]);
	const columnsFromState = useSelector((state: any) =>
		columnsSelector(state)
	);
	const columns = externalColumns
		? externalColumns
		: disableOpen
			? ["lastPrice", "K", "M", "equilibriumChangePercent"]
			: columnsFromState;

	const totalCols = columns.length + 1;

	return (
		<View style={styles.container}>
			<View style={styles.innerContainer}>
				<View style={styles.logoSpacer} />
				<View style={styles.contentArea}>
					<View style={(styles as any)[`colCode${totalCols}`] || styles.colCode5}>
						<TouchableOpacity
							onPress={!disableOpen ? () => open(-1) : undefined}
							onLongPress={!disableOpen ? () => open(-1) : undefined}
						>
							<BoldText style={[styles.label, styles.codeLabel]}>Sembol</BoldText>
						</TouchableOpacity>
					</View>
					{columns.map((col: string, i: number) => (
						<View
							key={i}
							style={(styles as any)[`colValue${totalCols}`] || styles.colValue5}
						>
							<TouchableOpacity
								onPress={!disableOpen ? () => open(i) : undefined}
								onLongPress={!disableOpen ? () => open(-1) : undefined}
							>
								<BoldText style={styles.label}>
									{(columnOptions as any)[col]?.shortTitle || (columnOptions as any)[col]?.title || col}
								</BoldText>
							</TouchableOpacity>
						</View>
					))}
				</View>
			</View>
		</View>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	container: {
		paddingHorizontal: 12,
		paddingTop: 8,
		paddingBottom: 4,
		backgroundColor: theme.darkerBrand,
	},
	innerContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
	},
	logoSpacer: {
		width: 32,
	},
	contentArea: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
	},
	colCode3: {
		width: "36%",
	},
	colCode4: {
		width: "28%",
	},
	colCode5: {
		width: "24%",
	},
	colValue3: {
		width: "32%",
	},
	colValue4: {
		width: "24%",
	},
	colValue5: {
		width: "19%",
	},
	label: {
		textAlign: "right",
		color: theme.primaryText,
		fontSize: 12,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		opacity: 0.6,
	},
	codeLabel: {
		textAlign: "left",
	},
});

export default TickerHeader;
