import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	View,
	ScrollView,
	NativeSyntheticEvent,
	NativeScrollEvent,
	Animated,
	StyleSheet,
} from "react-native";
import Header from "./Header";
import { useTheme } from "../../theme/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import BoldText from "../BoldText";
import { Ionicons } from "@expo/vector-icons";
import Level from "./Level";

interface Props {
	depth: number;
	hideHeader?: boolean;
	showTotal?: boolean;
	symbol: any;
}

const OrderBook: React.FC<Props> = ({
	depth,
	hideHeader = false,
	showTotal = true,
	symbol,
}) => {
	const scrollViewRef = useRef<ScrollView>(null);
	const { theme } = useTheme();
	const styles = useMemo(() => createStyles(theme), [theme]);

	const scrollWrapperHeight = useMemo(
		() => styles.rowContainer.height * Math.min(13, depth),
		[depth, styles.rowContainer.height]
	);

	const scrollableHeight = useMemo(
		() => styles.rowContainer.height * depth - scrollWrapperHeight,
		[depth, scrollWrapperHeight, styles.rowContainer.height]
	);

	const [bottomScrollable, setBottomScrollable] = useState(depth > 10);
	const [disableHelp, setDisableHelp] = useState(false);
	const [topScrollable, setTopScrollable] = useState(false);

	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const { y } = event.nativeEvent.contentOffset;
			setTopScrollable(y > 0);
			setBottomScrollable(y < scrollableHeight);
		},
		[depth]
	);
	const opacityAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		setDisableHelp(false);
		Animated.spring(opacityAnim, {
			delay: 3000,
			toValue: 0,
			useNativeDriver: true,
		}).start();

		const timer = setTimeout(() => setDisableHelp(true), 3500);
		return () => clearTimeout(timer);
	}, [opacityAnim]);

	return (
		<View>
			{!hideHeader && (
				<View style={{ height: 40 }}>
					<Header />
				</View>
			)}

			<View>
				<LinearGradient
					start={[0, 0]}
					end={[0, 1]}
					colors={[theme.darkestBrand, "transparent"]}
					pointerEvents="none"
					style={{
						opacity: topScrollable ? 0.7 : 0,
						height: 30,
						position: "absolute",
						left: 0,
						right: 0,
						top: 0,
						zIndex: 2,
					}}
				/>

				<LinearGradient
					start={[0, 0]}
					end={[0, 1]}
					colors={["transparent", theme.darkestBrand]}
					pointerEvents="none"
					style={{
						opacity: bottomScrollable ? 0.7 : 0,
						height: 30,
						position: "absolute",
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 2,
					}}
				/>

				{disableHelp === false && depth > 10 && (
					<Animated.View
						pointerEvents="none"
						style={{
							backgroundColor: "rgba(0, 0, 0, 0.6)",
							position: "absolute",
							alignSelf: "center",
							bottom: 10,
							zIndex: 3,
							paddingVertical: 3,
							paddingRight: 6,
							paddingLeft: 12,
							borderRadius: 10,
							opacity: opacityAnim,
						}}
					>
						<BoldText style={{ color: theme.onBlue }}>
							<Ionicons name="chevron-down" size={14} color={theme.onBlue} /> 25
							Kademe{" "}
							<Ionicons name="chevron-down" size={14} color={theme.onBlue} />
						</BoldText>
					</Animated.View>
				)}

				<ScrollView
					ref={scrollViewRef}
					scrollEnabled={depth > 10}
					style={{ height: scrollWrapperHeight }}
					onScroll={handleScroll}
					scrollEventThrottle={16}
				>
					{[...Array(depth).keys()].map((i) => (
						<View key={`${i}`} style={styles.rowContainer}>
							<View style={styles.row}>
								<View style={styles.col}>
									<Level symbol={symbol} side="B" row={i} />
								</View>
								<View style={styles.col}>
									<Level symbol={symbol} side="A" row={i} />
								</View>
							</View>
						</View>
					))}
				</ScrollView>
			</View>

			{depth > 1 && showTotal && (
				<View style={styles.rowContainer}>
					<View style={styles.row}>
						<View style={styles.col}>
							<Level symbol={symbol} side="B" aggregate row={depth} />
						</View>
						<View style={styles.col}>
							<Level symbol={symbol} side="A" aggregate row={depth} />
						</View>
					</View>
				</View>
			)}
		</View>
	);
};

const createStyles = (theme: any) =>
	StyleSheet.create({
		rowContainer: {
			height: 20,
		},
		row: {
			flex: 1,
			flexDirection: "row",
			backgroundColor: theme.darkerBrand,
		},
		col: {
			width: "50%",
			height: 20,
		},
	});

export default OrderBook;
