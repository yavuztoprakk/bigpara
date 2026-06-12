// import React, {
// 	useEffect,
// 	useMemo,
// 	useCallback,
// 	useRef,
// 	useState,
// } from "react";
// import {
// 	StyleSheet,
// 	View,
// 	TouchableOpacity,
// 	Keyboard,
// 	KeyboardEvent,
// 	Platform,
// 	Animated,
// 	ScrollView,
// } from "react-native";
// import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
// import { Ionicons } from "@expo/vector-icons";
// import BoldText from "../BoldText";
// import { useTheme } from "../../theme/ThemeContext";
// import { useDispatch, useSelector } from "react-redux";
// import { close } from "../../modules/bottomSheet";

// interface Props {
// 	children?: React.ReactNode;
// 	titleView?: React.ReactElement;
// 	title?: string;
// 	contentHeight: number;
// 	onCancel?: () => void;
// 	small: boolean;
// 	zIndex?: number;
// }

// const BottomSheetLayer: React.FC<Props> = ({
// 	children,
// 	titleView,
// 	title,
// 	contentHeight,
// 	onCancel,
// 	small,
// 	zIndex = 0,
// }) => {
// 	const { theme } = useTheme();
// 	const styles = createStyles(theme);
// 	const dispatch = useDispatch();
// 	const bottomSheetRef = useRef<BottomSheet>(null);
// 	const [adjustedHeight, setAdjustedHeight] = useState(contentHeight);
// 	const fadeAnim = useRef(new Animated.Value(0)).current;

// 	// Redux'tan `open` durumunu alıyoruz.
// 	const { open } = useSelector((state: any) => state.ui.bottomSheet);


// 	// Snap points'leri dinamik olarak ayarla
// 	const snapPoints = useMemo(() => [adjustedHeight], [adjustedHeight]);

// 	// Klavye event'lerini dinle
// 	useEffect(() => {
// 		const onKeyboardShow = (e: KeyboardEvent) => {
// 			const keyboardHeight = e.endCoordinates.height + 70;

// 			const numberHeight = Platform.OS === "ios" ? 100 : 220;
// 			setAdjustedHeight(keyboardHeight + numberHeight);
// 			Platform.OS === "ios" ? null : bottomSheetRef.current?.expand(); // Klavye açılınca yeniden konumla
// 		};

// 		const onKeyboardHide = () => {
// 			setAdjustedHeight(contentHeight);
// 			bottomSheetRef.current?.snapToIndex(0); // Eski boyuta geri dön
// 		};

// 		const showListener = Keyboard.addListener(
// 			"keyboardDidShow",
// 			onKeyboardShow
// 		);
// 		const hideListener = Keyboard.addListener(
// 			"keyboardDidHide",
// 			onKeyboardHide
// 		);

// 		return () => {
// 			showListener.remove();
// 			hideListener.remove();
// 		};
// 	}, [contentHeight]);

// 	// Açma ve kapama işlemleri
// 	useEffect(() => {
// 		if (open) {
// 			bottomSheetRef.current?.expand();
// 		} else {
// 			bottomSheetRef.current?.close();
// 		}
// 	}, [small, open]);

// 	// Arka plan animasyonunu yönetmek için useEffect
// 	useEffect(() => {
// 		if (open) {
// 			Animated.timing(fadeAnim, {
// 				toValue: 1,
// 				duration: 200,
// 				useNativeDriver: true,
// 			}).start();
// 		} else {
// 			Animated.timing(fadeAnim, {
// 				toValue: 0,
// 				duration: 200,
// 				useNativeDriver: true,
// 			}).start();
// 		}
// 	}, [open]);

// 	const handleClose = () => {
// 		dispatch(close());
// 		if (onCancel) onCancel();
// 	};

// 	const handleSheetChanges = useCallback(
// 		(index: number) => {
// 			if (index === -1) {
// 				dispatch(close());
// 			}
// 		},
// 		[dispatch]
// 	);
// 	return (
// 		<>
// 			<Animated.View
// 				style={[
// 					styles.backdrop,
// 					{
// 						opacity: fadeAnim,
// 						zIndex: zIndex * 100,
// 					},
// 				]}
// 				pointerEvents={open ? "auto" : "none"}
// 			/>
// 			<BottomSheet
// 				backgroundStyle={{ backgroundColor: theme.darkestBrand }}
// 				ref={bottomSheetRef}
// 				index={open ? 0 : -1}
// 				snapPoints={snapPoints}
// 				enablePanDownToClose={true}
// 				enableContentPanningGesture={false}
// 				enableHandlePanningGesture={false}
// 				onChange={handleSheetChanges}
// 				enableDynamicSizing={false}
// 				handleIndicatorStyle={{ display: "none" }}
// 				style={[styles.bottomSheet, { zIndex: zIndex * 100 + 1 }]}
// 			>
// 				<BottomSheetView style={styles.header}>
// 					<View style={{ flex: 1 }}>
// 						{titleView || <BoldText style={styles.title}>{title}</BoldText>}
// 					</View>
// 					<TouchableOpacity onPress={handleClose} style={styles.closeButton}>
// 						<Ionicons name="close-outline" size={25} color={theme.onBlue} />
// 					</TouchableOpacity>
// 				</BottomSheetView>
// 				<BottomSheetView style={{ height: adjustedHeight }}>
// 					{children}
// 				</BottomSheetView>
// 			</BottomSheet>
// 		</>
// 	);
// };

// const createStyles = (theme: any) =>
// 	StyleSheet.create({
// 		header: {
// 			flexDirection: "row",
// 			alignItems: "center",
// 			justifyContent: "space-between",
// 			paddingHorizontal: 20,
// 			paddingVertical: 10,
// 			backgroundColor: theme.darkestBrand,
// 			borderTopLeftRadius: 15,
// 			borderTopRightRadius: 15,
// 		},
// 		title: {
// 			fontSize: 18,
// 			color: theme.white,
// 		},
// 		closeButton: {
// 			marginTop: 0,
// 		},
// 		content: {
// 			flex: 1,
// 			backgroundColor: theme.darkerBrand,
// 			paddingHorizontal: 20,
// 			paddingVertical: 10,
// 		},
// 		backdrop: {
// 			...StyleSheet.absoluteFillObject,
// 			backgroundColor: "rgba(0, 0, 0, 0.5)",
// 			position: "absolute",
// 		},
// 		bottomSheet: {
// 			position: "relative",
// 		},
// 	});

// export default BottomSheetLayer;


import React, {
	useEffect,
	useMemo,
	useCallback,
	useRef,
	useState,
} from "react";
import {
	StyleSheet,
	View,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	Animated,
	Keyboard,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import BoldText from "../BoldText";
import { useTheme } from "../../theme/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { close } from "../../modules/bottomSheet";

interface Props {
	children?: React.ReactNode;
	titleView?: React.ReactElement;
	title?: string;
	contentHeight: number;
	onCancel?: () => void;
	small: boolean;
	zIndex?: number;
}

const BottomSheetLayer: React.FC<Props> = ({
	children,
	titleView,
	title,
	contentHeight,
	onCancel,
	small,
	zIndex = 0,
}) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);
	const dispatch = useDispatch();
	const bottomSheetRef = useRef<BottomSheet>(null);
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const [keyboardVisible, setKeyboardVisible] = useState(false);

	const { open } = useSelector((state: any) => state.ui.bottomSheet);
	const snapPoints = useMemo(() => [contentHeight], [contentHeight]);

	useEffect(() => {
		if (open) {
			bottomSheetRef.current?.expand();
		} else {
			bottomSheetRef.current?.close();
		}
	}, [small, open]);
	useEffect(() => {
		const showSub = Keyboard.addListener("keyboardDidShow", () => {
			setKeyboardVisible(true);
		});
		const hideSub = Keyboard.addListener("keyboardDidHide", () => {
			setKeyboardVisible(false);
		});

		return () => {
			showSub.remove();
			hideSub.remove();
		};
	}, []);
	useEffect(() => {
		if (!keyboardVisible) {
			setTimeout(() => {
				bottomSheetRef.current?.expand();
			}, 50);
		}
	}, [contentHeight, keyboardVisible]);

	useEffect(() => {
		if (open) {
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
		}
	}, [open]);

	const handleClose = () => {
		dispatch(close());
		if (onCancel) onCancel();
	};

	const handleSheetChanges = useCallback(
		(index: number) => {
			if (index === -1) {
				dispatch(close());
			}
		},
		[dispatch]
	);

	return (
		<>
			<Animated.View
				style={[
					styles.backdrop,
					{
						opacity: fadeAnim,
						zIndex: zIndex * 100,
					},
				]}
				pointerEvents={open ? "auto" : "none"}
			/>
			<BottomSheet
				backgroundStyle={{ backgroundColor: theme.darkestBrand }}
				ref={bottomSheetRef}
				index={open ? 0 : -1}
				snapPoints={snapPoints}
				enablePanDownToClose={true}
				enableContentPanningGesture={false}
				enableHandlePanningGesture={false}
				onChange={handleSheetChanges}
				enableDynamicSizing={false}
				handleIndicatorStyle={{ display: "none" }}
				style={[styles.bottomSheet, { zIndex: zIndex * 100 + 1 }]}
			>
				<BottomSheetView style={styles.header}>
					<View style={{ flex: 1 }}>
						{titleView || <BoldText style={styles.title}>{title}</BoldText>}
					</View>
					<TouchableOpacity onPress={handleClose} style={styles.closeButton}>
						<Ionicons name="close-outline" size={25} color={theme.onBlue} />
					</TouchableOpacity>
				</BottomSheetView>

				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={{ height: contentHeight, paddingTop: 40 }}
					keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 30}
				>
					{children}
				</KeyboardAvoidingView>
			</BottomSheet>
		</>
	);
};

const createStyles = (theme: any) =>
	StyleSheet.create({
		header: {
			zIndex: 999,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: 20,
			//paddingVertical: 1,
			paddingBottom: 5,
			backgroundColor: theme.darkestBrand,
			borderTopLeftRadius: 15,
			borderTopRightRadius: 15,
		},
		title: {
			fontSize: 18,
			color: theme.white,
		},
		closeButton: {
			marginTop: 0,
		},
		backdrop: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: "rgba(0, 0, 0, 0.5)",
			position: "absolute",
		},
		bottomSheet: {
			position: "relative",
		},
	});

export default BottomSheetLayer;
