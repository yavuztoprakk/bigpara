
import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
	memo,
} from "react";
import {
	View,
	Text,
	Platform,
	StyleSheet,
	Animated,
	InteractionManager,
} from "react-native";
import SymbolLogo from "./SymbolLogo";
import { useTheme } from "../theme/ThemeContext";
import { Price, formatPrice, changeColor } from "../screens/Markets/modules/prices";
import { Symbol } from "../screens/Markets/modules/symbols";
import priceCenter from "../modules/PriceCenter";
import TickerTime from "./TickerTime";
import { useSelector, shallowEqual } from "react-redux";
import { columnsSelector } from "../screens/Auth/modules/preferences";

const numeral = require("numeral");

interface Props {
	code: string;
	symbol: Symbol;
	selectedList: string;
	initialPrice?: Price;
	onPriceUpdate?: (code: string, price: Price) => void;
	isAnimating?: boolean;
	// Liste tarafından (örn. compact mode) override edilen kolonlar.
	// Verilmezse Redux'tan kullanıcı tercihi okunur.
	columns?: string[];
}

const fontSize = 15;

const NUMERAL_COLUMNS = ["A", "B", "C", "F", "H", "M", "T", "U"];

const hasVisibleDataChanged = (
	prevPrice: Price,
	newPrice: Price,
	columns: string[]
): boolean => {
	if (!prevPrice || !newPrice) return false;
	return columns.some(
		(column) =>
			prevPrice[column] !== newPrice[column] &&
			typeof prevPrice[column] === "number" &&
			typeof newPrice[column] === "number"
	);
};

const TickerRow: React.FC<Props> = memo(
	({
		code,
		symbol,
		selectedList,
		initialPrice,
		onPriceUpdate,
		isAnimating,
		columns: externalColumns,
	}) => {
		const { theme } = useTheme();
		const styles = useMemo(() => createStyles(theme), [theme]);
		const [price, setPrice] = useState<Price | undefined>(initialPrice);
		const prevPriceRef = useRef<Price | undefined>(initialPrice);
		const highlightAnim = useRef(new Animated.Value(0)).current;
		const unsubscribeRef = useRef<(() => void) | null>(null);
		const shouldAnimate = useRef(false);
		const preferenceColumns = useSelector(columnsSelector, shallowEqual);
		const pageLastBrokerages = useSelector(
			(state: any) => state.pageLastBrokerages,
			shallowEqual
		);
		const columns = useMemo(() => {
			if (
				selectedList === "devrekesici" &&
				pageLastBrokerages?.page === "Markets"
			) {
				return ["lastPrice", "K", "M", "equilibriumChangePercent"];
			}
			// externalColumns: liste tarafından (ListContainer compact mode)
			// override edildiyse onu kullan; aksi halde kullanıcı tercihi.
			return externalColumns ?? preferenceColumns ?? [];
		}, [selectedList, pageLastBrokerages, preferenceColumns, externalColumns]);

		const isThrottled = useRef(false);
		const pendingUpdate = useRef<Price | null>(null);

		const startAnimation = useCallback(() => {
			highlightAnim.setValue(1);
			Animated.timing(highlightAnim, {
				toValue: 0,
				duration: 700,
				useNativeDriver: Platform.OS !== "web",
			}).start();
		}, [highlightAnim]);

		const handlePriceChange = useCallback(
			(newPrice: Price) => {
				if (isThrottled.current) {
					pendingUpdate.current = newPrice;
					return;
				}

				isThrottled.current = true;
				setTimeout(() => {
					isThrottled.current = false;
					if (pendingUpdate.current) {
						handlePriceChange(pendingUpdate.current);
						pendingUpdate.current = null;
					}
				}, 100);

				const visibleDataChanged = hasVisibleDataChanged(
					prevPriceRef.current as Price,
					newPrice,
					columns
				);

				shouldAnimate.current = visibleDataChanged && !isAnimating;

				setPrice(newPrice);
				prevPriceRef.current = newPrice;

				if (onPriceUpdate) {
					onPriceUpdate(code, newPrice);
				}

				if (shouldAnimate.current) {
					InteractionManager.runAfterInteractions(() => {
						startAnimation();
					});
				}
			},
			[columns, code, onPriceUpdate, isAnimating, startAnimation]
		);

		useEffect(() => {
			if (!onPriceUpdate) {
				if (unsubscribeRef.current) {
					unsubscribeRef.current();
				}

				const unsubscribe = priceCenter.subscribe(code, (newPrice) => {
					if (requestAnimationFrame) {
						requestAnimationFrame(() => handlePriceChange(newPrice));
					} else {
						setTimeout(() => handlePriceChange(newPrice), 0);
					}
				});

				unsubscribeRef.current = unsubscribe;

				return () => {
					if (unsubscribeRef.current) {
						unsubscribeRef.current();
						unsubscribeRef.current = null;
					}
				};
			}
		}, [code, handlePriceChange, onPriceUpdate]);

		useEffect(() => {
			if (initialPrice && initialPrice !== prevPriceRef.current) {
				handlePriceChange(initialPrice);
			}
		}, [initialPrice, handlePriceChange]);

		useEffect(() => {
			if (price && prevPriceRef.current !== price) {
				prevPriceRef.current = price;
			}
		}, [columns, price]);

		const totalCols = columns.length + 1;
		const colCodeStyle = (styles as any)[`colCode${totalCols}`] || styles.colCode5;
		const colValueStyle = (styles as any)[`colValue${totalCols}`] || styles.colValue5;

		// Satır bazlı kompakt mod: SON fiyatın tam sayı kısmı 5 haneden uzun ise
		// (örn. BTCTRY 3.340.819,00) ALIŞ/SATIŞ hücreleri "--" gösterilir; SON
		// ve %G normal akar. Header sabit kalır, sadece bu satırın iki hücresi boşalır.
		const hideBidAsk = useMemo(() => {
			const lp = (price as any)?.lastPrice;
			if (typeof lp !== "number" || lp <= 0) return false;
			return Math.floor(Math.abs(lp)).toString().length > 5;
		}, [price]);

		if (!symbol || !price) {
			return (
				<View style={styles.shadowWrap}>
					<Animated.View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
						<View style={styles.row}>
							<SymbolLogo code={code} size={32} />
							<View style={styles.contentArea}>
								<View style={[styles.codeSection, colCodeStyle]}>
									<Text adjustsFontSizeToFit numberOfLines={1} style={styles.codeLabel}>
										{code}
									</Text>
								</View>
								{columns.map((_: string, i: number) => (
									<View key={i} style={colValueStyle}>
										<Text style={[styles.valueLabel, { opacity: 0.3 }]}>—</Text>
									</View>
								))}
							</View>
						</View>
					</Animated.View>
				</View>
			);
		}

		const backgroundColor = highlightAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [theme.darkerBrand, theme.hightlight],
		});

		const hasData = price.lastPrice != null && price.lastPrice > 0;

		return (
			<View style={styles.shadowWrap}>
			<Animated.View style={[styles.container, { backgroundColor }]}>
				<View style={styles.row}>
					<SymbolLogo code={code} size={32} />
					<View style={styles.contentArea}>
						<View style={[styles.codeSection, colCodeStyle]}>
							<Text
								adjustsFontSizeToFit
								numberOfLines={1}
								style={[
									styles.codeLabel,
									Platform.OS === "android" &&
									code.length > 7 && { fontSize: 12 },
								]}
							>
								{code}
							</Text>
							{typeof (price as any)["Y"] === "number" && (
								<TickerTime time={(price as any)["Y"]} textStyle={{ fontSize: 10, color: theme.primaryText, marginTop: 1 }} />
							)}
						</View>

						{columns.map((column: string, i: number) => {
							const isChangePercent = column === "changePercent" || column === "equilibriumChangePercent";

							if (isChangePercent) {
								const changeVal = (price as any)[column] as number;
								const percentColor = changeVal !== undefined ? changeColor(changeVal, theme) : theme.primaryText;
								const isPositive = hasData && changeVal !== undefined && changeVal > 0;
								const isNeutral = !hasData || changeVal === undefined || isNaN(changeVal) || changeVal === 0;

								return (
									<View key={i} style={[colValueStyle, styles.changeBadgeWrapper]}>
										<View
											style={[
												styles.changeBadge,
												{
													backgroundColor: isNeutral
														? (theme.themeDetail === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")
														: isPositive
															? (theme.themeDetail === "dark" ? "rgba(5,196,107,0.15)" : "rgba(5,150,105,0.12)")
															: (theme.themeDetail === "dark" ? "rgba(255,63,52,0.15)" : "rgba(255,43,47,0.12)"),
												},
											]}
										>
											<Text
												style={[
													styles.changeText,
													{ color: hasData ? percentColor : theme.primaryText, opacity: hasData ? 1 : 0.3 },
												]}
												numberOfLines={1}
												adjustsFontSizeToFit
												minimumFontScale={0.75}
											>
												{hasData && changeVal !== undefined
													? String(isNaN(changeVal) ? "-" : changeVal.toFixed(2))
													: "---"
												}
											</Text>
										</View>
									</View>
								);
							}

							const isBidOrAsk = column === "bid" || column === "ask";
							const shouldHide = isBidOrAsk && hideBidAsk;

							return (
								<View key={i} style={colValueStyle}>
									<Text
										adjustsFontSizeToFit
										numberOfLines={1}
										style={[styles.valueLabel, (shouldHide || !hasData) && { opacity: 0.3 }]}
									>
										{shouldHide
											? "--"
											: hasData
												? (NUMERAL_COLUMNS.includes(column) &&
													(price as any)[column] !== undefined &&
													(price as any)[column] !== 0)
													? String(numeral((price as any)[column]).format("0[.]0 a"))
													: String(formatPrice((price as any)?.[column] || 0, symbol) || "--")
												: "--"
										}
									</Text>
								</View>
							);
						})}
					</View>
				</View>
			</Animated.View>
			</View>
		);
	},
	(prevProps, nextProps) => {
		if (
			prevProps.code !== nextProps.code ||
			prevProps.selectedList !== nextProps.selectedList
		) {
			return false;
		}
		if (
			(!prevProps.initialPrice && nextProps.initialPrice) ||
			(prevProps.initialPrice && !nextProps.initialPrice)
		) {
			return false;
		}
		if (prevProps.isAnimating !== nextProps.isAnimating) {
			return false;
		}
		// Header'dan kolon değiştirildiğinde re-render olmuyordu — columns shallow karşılaştırması.
		const prevCols = prevProps.columns;
		const nextCols = nextProps.columns;
		if (prevCols !== nextCols) {
			if (!prevCols || !nextCols || prevCols.length !== nextCols.length) {
				return false;
			}
			for (let i = 0; i < prevCols.length; i++) {
				if (prevCols[i] !== nextCols[i]) return false;
			}
		}
		return true;
	}
);

const createStyles = (theme: any) =>
	StyleSheet.create({
		shadowWrap: {
			marginHorizontal: 12,
			marginVertical: 4,
			borderRadius: 12,
			backgroundColor: theme.darkerBrand,
			...(theme.themeDetail === "dark"
				? {}
				: {
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.08,
					shadowRadius: 6,
					elevation: 3,
				}),
		},
		container: {
			borderRadius: 12,
			overflow: "hidden",
			backgroundColor: theme.darkerBrand,
			...(theme.themeDetail === "dark"
				? {
					borderWidth: StyleSheet.hairlineWidth,
					borderColor: "rgba(255,255,255,0.06)",
				}
				: {
					borderWidth: StyleSheet.hairlineWidth,
					borderColor: "rgba(0,0,0,0.06)",
				}),
		},
		row: {
			flexDirection: "row",
			alignItems: "center",
			paddingHorizontal: 8,
			paddingVertical: 10,
			minHeight: 56,
		},
		contentArea: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
		},
		codeSection: {
			justifyContent: "center",
			paddingLeft: 10,
		},
		codeLabel: {
			color: theme.white,
			fontFamily: theme.boldFont,
			fontSize: fontSize,
			letterSpacing: 0.3,
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
			justifyContent: "center",
		},
		colValue4: {
			width: "24%",
			justifyContent: "center",
		},
		colValue5: {
			width: "19%",
			justifyContent: "center",
		},
		valueLabel: {
			color: theme.white,
			textAlign: "right",
			fontFamily: theme.regularFont,
			fontSize: fontSize,
			width: "100%",
			opacity: 0.9,
		},
		changeBadgeWrapper: {
			alignItems: "flex-end",
		},
		changeBadge: {
			paddingHorizontal: 4,
			paddingVertical: 2,
			borderRadius: 6,
			alignItems: "center",
			justifyContent: "center",
		},
		changeText: {
			fontFamily: theme.boldFont,
			fontSize: 12,
			letterSpacing: 0.2,
		},
	});

export default memo(TickerRow);
