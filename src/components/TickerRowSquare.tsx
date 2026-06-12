import React, { useState, useEffect, useMemo, useRef, memo } from "react";
import {
	View,
	Text,
	Image,
	Platform,
	Dimensions,
	StyleSheet,
	Animated,
	InteractionManager,
} from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "../theme/ThemeContext";
import { Price, formatPrice } from "../screens/Markets/modules/prices";
import { Symbol } from "../screens/Markets/modules/symbols";
import priceCenter from "../modules/PriceCenter";
import TickerTime from "./TickerTime";
import ChangeSquareBackgroundColor from "./ChangeSquareBackgroundColor";
import { columnOptions } from "../screens/Markets/modules/lists";
import BoldText from "./BoldText";
import SymbolLogo from "./SymbolLogo";
import numeral from "numeral";

const screen_width = Math.min(
	Dimensions.get("window").height,
	Dimensions.get("window").width
);
const width_factor = screen_width / 390;

interface Props {
	code: string;
	symbol: Symbol;
	columns: string[];
}

const TickerRowSquare: React.FC<Props> = memo(
	({ code, symbol, columns }) => {
		const { theme } = useTheme();
		const styles = createStyles(theme);
		// Redux'taki ilk fiyat
		const initial = useSelector((state: any) => state.prices[code]);
		const [price, setPrice] = useState<Price | undefined>(initial);
		const prevPriceRef = useRef<Price | undefined>(initial);

		// Animasyon için
		const highlightAnim = useRef(new Animated.Value(0)).current;
		const isThrottled = useRef(false);
		const pending = useRef<Price | null>(null);

		// Fiyat güncellemesi geldiğinde animasyonu tetikleyen fonksiyon
		const startAnimation = () => {
			highlightAnim.setValue(1);
			Animated.timing(highlightAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start();
		};

		const handlePrice = (newPrice: Price) => {
			if (isThrottled.current) {
				pending.current = newPrice;
				return;
			}
			isThrottled.current = true;
			setTimeout(() => {
				isThrottled.current = false;
				if (pending.current) {
					handlePrice(pending.current);
					pending.current = null;
				}
			}, 100);

			// Sadece görünür kolonlardaki değişime bak
			const changed = columns.some(
				(col) =>
					prevPriceRef.current &&
					prevPriceRef.current[col] !== newPrice[col]
			);
			prevPriceRef.current = newPrice;
			setPrice(newPrice);

			if (changed) {
				InteractionManager.runAfterInteractions(startAnimation);
			}
		};

		// priceCenter aboneliği
		useEffect(() => {
			const unsub = priceCenter.subscribe(code, (p) => {
				if (typeof requestAnimationFrame === "function") {
					requestAnimationFrame(() => handlePrice(p));
				} else {
					setTimeout(() => handlePrice(p), 0);
				}
			});
			return () => unsub();
		}, [code]);

		// Hook'lar her zaman koşulsuz çağrılmalı (Rules of Hooks).
		// Bu yüzden useMemo'yu early return'den ÖNCE çağırıyoruz.
		const bgColor = useMemo(() => {
			if (!price) return "#646769";
			let c = "#646769";
			columns.forEach((col) => {
				if (
					col === "changePercent" ||
					col === "equilibriumChangePercent"
				) {
					c = ChangeSquareBackgroundColor(price[col]) || "";
				}
			});
			return c;
		}, [columns, price, theme.darkerBrand]);

		if (!symbol || !price) return null;

		// Animated.View opacity için
		const opacity = highlightAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [1, 0.7],
		});

		return (
			<Animated.View
				style={[
					styles.container,
					{ backgroundColor: bgColor, opacity },
				]}
			>
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<SymbolLogo code={code} size={24} />
					<View style={{ marginLeft: 4, flexShrink: 1 }}>
						<Text
							adjustsFontSizeToFit
							numberOfLines={1}
							style={{
								...styles.codeLabel,
								paddingLeft: 0,
								fontSize:
									Platform.OS === "ios" && code.length > 7 ? 14 : 18,
							}}
						>
							{code}
						</Text>
						{price["Y"] != null && (
							<TickerTime time={price["Y"]} textStyle={{ fontSize: 10, marginTop: 1 }} />
						)}
					</View>
				</View>
				{symbol &&
					price &&
					columns.map((col, i) => (
						<View key={i} style={styles.valueView}>
							{col !== "changePercent" &&
								col !== "equilibriumChangePercent" ? (
								<>
									<Text style={styles.valueLabelTitle}>
										{columnOptions[col].shortTitle ||
											columnOptions[col].title}
									</Text>
									<Text style={styles.valueLabel} numberOfLines={1}>
										{["A", "B", "C", "F", "H", "M", "T", "U"].includes(col) &&
											price[col] !== 0 &&
											col === "F"
											? numeral(price[col])
												.format("0[.]0 a")
												.toString()
											: formatPrice(price[col], symbol)}
									</Text>
								</>
							) : (
								<BoldText style={styles.percentLabel}>
									%{isNaN(price[col]) ? "-" : price[col].toFixed(2)}
								</BoldText>
							)}
						</View>
					))}
			</Animated.View>
		);
	}
);

const createStyles = (theme: any) =>
	StyleSheet.create({
		container: {
			width: Math.round(width_factor * 130),
			height: Math.round(width_factor * 130),
			borderColor: theme.darkBrand,
			borderWidth: 1,
			flexGrow: 0,
			flexShrink: 1,
			flexBasis: "50%",
			flexDirection: "column",
			alignItems: "center",
			padding: "10%",
			justifyContent: "center",
		},
		codeLabel: {
			color: "white",
			fontFamily: theme.boldFont,
			fontWeight: "bold",
		},
		valueView: {
			flexDirection: "row",
			width: "100%",
		},
		valueLabelTitle: {
			color: "white",
			flex: 1,
			fontFamily: theme.boldFont,
			fontSize: 14,
			textAlign: "left",
		},
		valueLabel: {
			color: "white",
			flex: 1,
			fontFamily: theme.boldFont,
			fontSize: 14,
			textAlign: "right",
		},
		percentLabel: {
			color: "white",
			flex: 1,
			textAlign: "center",
			fontSize: 18,
			fontWeight: "bold",
		},
	});

export default TickerRowSquare;