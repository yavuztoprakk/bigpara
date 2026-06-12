import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { TouchableHighlight, StyleSheet, View } from "react-native";
import Text from "../Text";
import { useTheme } from "../../theme/ThemeContext";
import { Level as LevelModel, levelSelector } from "../../modules/books";

interface Props {
	side: string;
	symbol: Symbol;
	aggregate: boolean;
	row: any;
}

const Level: React.FC<LevelModel & Props> = ({
	side,
	symbol,
	aggregate,
	row,
}) => {
	const { theme } = useTheme();
	const styles = useMemo(() => createStyles(theme), [theme]);

	const [receivedFirstPrice, setReceivedFirstPrice] = useState(2);
	const [highlight, setHighlight] = useState(false);

	const levelData = useSelector((state) =>
		levelSelector(state, symbol, side, row, aggregate)
	) || { lot: "", price: "" };

	useEffect(() => {
		if (receivedFirstPrice > 0 && !aggregate) {
			setReceivedFirstPrice((prev) => prev - 1);
		} else if (receivedFirstPrice === 0 && !aggregate) {
			setHighlight(true);
			const timer = setTimeout(() => setHighlight(false), 1000);
			return () => clearTimeout(timer);
		}
	}, [levelData.price, levelData.lot, aggregate, receivedFirstPrice]);

	const formatLotValue = useCallback((value: string) => {
		if (!value) return "";
		const number = parseFloat(value.replace(/,/g, ""));
		if (isNaN(number)) return value;
		return number >= 10000000
			? (number / 1000000).toFixed(2) + "M"
			: new Intl.NumberFormat("tr-TR").format(number);
	}, []);

	const containerStyle = useMemo(
		() => ({
			...styles.container,
			backgroundColor: highlight
				? side === "A"
					? theme.red
					: theme.green
				: aggregate
					? theme.darkBrand
					: "transparent",
		}),
		[highlight, side, theme, aggregate]
	);

	const textColor = useMemo(
		() => (highlight ? theme.black : side === "A" ? theme.red : theme.green),
		[highlight, side, theme]
	);

	const priceWidth = useMemo(
		() => (levelData.price.length >= 4 ? 80 : 55),
		[levelData.price.length]
	);

	return (
		<TouchableHighlight style={containerStyle}>
			<View style={styles.innerRow}>
				{side === "B" && (
					<Text style={{ ...styles.bidCountCol, color: textColor }}>
						{levelData.count !== "NaN" && levelData.count}
					</Text>
				)}
				<Text
					style={{
						...(side === "A"
							? { ...styles.askPriceCol, width: priceWidth }
							: styles.bidLotCol),
						color: textColor,
					}}
				>
					{side === "A" ? levelData.price : formatLotValue(levelData.lot)}
				</Text>
				<Text
					style={{
						...(side === "A"
							? { ...styles.askLotCol, width: priceWidth }
							: { ...styles.bidPriceCol, width: priceWidth }),
						color: textColor,
					}}
				>
					{side === "A" ? formatLotValue(levelData.lot) : levelData.price}
				</Text>
				{side === "A" && (
					<Text style={{ ...styles.askCountCol, color: textColor }}>
						{levelData.count}
					</Text>
				)}
			</View>
		</TouchableHighlight>
	);
};

const createStyles = (theme: any) =>
	StyleSheet.create({
		container: {
			flex: 1,
			flexDirection: "row",
			paddingTop: 1,
		},
		innerRow: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
		},
		askLotCol: {
			flexGrow: 1,
			textAlign: "left",
		},
		askPriceCol: {
			textAlign: "left",
			paddingLeft: 5,
		},
		bidLotCol: {
			flexGrow: 1,
			textAlign: "right",
		},
		bidPriceCol: {
			textAlign: "right",
			paddingRight: 5,
		},
		bidCountCol: {
			textAlign: "left",
			opacity: 0.8,
			paddingLeft: 10,
		},
		askCountCol: {
			textAlign: "right",
			opacity: 0.8,
			paddingRight: 10,
		},
	});

export default Level;
