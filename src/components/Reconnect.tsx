import React, { useEffect, useRef } from "react";
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Animated,
	Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { setIsAnotherConnect, ws } from "../modules/IdealClient";
import {
	selectReconnect,
	hideReconnect,
} from "../modules/IdealClient/responses/reconnect";
import { useTheme } from "../theme/ThemeContext";

const { width } = Dimensions.get("window");

const Reconnect: React.FC = () => {
	const dispatch = useDispatch();
	const { theme } = useTheme();
	const show = useSelector(selectReconnect);

	const scaleAnim = useRef(new Animated.Value(0.85)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (show) {
			Animated.parallel([
				Animated.spring(scaleAnim, {
					toValue: 1,
					tension: 65,
					friction: 9,
					useNativeDriver: true,
				}),
				Animated.timing(opacityAnim, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			scaleAnim.setValue(0.85);
			opacityAnim.setValue(0);
		}
	}, [show]);

	const handleConfirm = () => {
		dispatch(hideReconnect());
		setIsAnotherConnect(false);
		ws?.reconnect();
	};

	if (!show) return null;

	return (
		<Modal transparent visible={show} statusBarTranslucent>
			<View style={styles.overlay}>
				<Animated.View
					style={[
						styles.card,
						{
							backgroundColor: theme.darkBrand,
							transform: [{ scale: scaleAnim }],
							opacity: opacityAnim,
						},
					]}
				>
					<View
						style={[
							styles.iconContainer,
							{ backgroundColor: theme.blue + "18" },
						]}
					>
						<Ionicons name="wifi-outline" size={32} color={theme.blue} />
						<View style={[styles.slashLine, { backgroundColor: theme.red }]} />
					</View>

					<Text style={[styles.title, { color: theme.onBlue, fontFamily: theme.boldFont }]}>
						Bağlantınız kesildi
					</Text>

					<Text
						style={[
							styles.message,
							{ color: theme.gray, fontFamily: theme.regularFont },
						]}
					>
						Başka bir cihazdan bu hesap ile oturum açıldığı için bağlantınız
						kesildi.
					</Text>

					<TouchableOpacity
						style={[styles.button, { backgroundColor: theme.blue }]}
						onPress={handleConfirm}
						activeOpacity={0.8}
					>
						<Ionicons
							name="refresh-outline"
							size={18}
							color="#FFFFFF"
							style={styles.buttonIcon}
						/>
						<Text style={[styles.buttonText, { fontFamily: theme.boldFont }]}>
							Yeniden bağlan
						</Text>
					</TouchableOpacity>
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		justifyContent: "center",
		alignItems: "center",
	},
	card: {
		width: width * 0.82,
		borderRadius: 20,
		paddingVertical: 32,
		paddingHorizontal: 28,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 12,
	},
	iconContainer: {
		width: 64,
		height: 64,
		borderRadius: 32,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
	},
	slashLine: {
		position: "absolute",
		width: 2,
		height: 36,
		borderRadius: 1,
		transform: [{ rotate: "45deg" }],
	},
	title: {
		fontSize: 19,
		marginBottom: 10,
	},
	message: {
		fontSize: 14,
		lineHeight: 20,
		textAlign: "center",
		marginBottom: 28,
	},
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		paddingHorizontal: 32,
		borderRadius: 14,
		width: "100%",
	},
	buttonIcon: {
		marginRight: 8,
	},
	buttonText: {
		color: "#FFFFFF",
		fontSize: 15,
	},
});

export default Reconnect;
