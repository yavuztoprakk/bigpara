import React, {
	useRef,
	useEffect,
	useState,
	useCallback,
	useMemo,
} from "react";
import { Platform, StyleSheet } from "react-native";
import { TouchableOpacity, TextInput } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import { changeQuery } from "../modules/search";
import { useTheme } from "../theme/ThemeContext";
import { request, wssControl } from "../modules/IdealClient";
import symbolTest from "../modules/IdealClient/request/symbolTest";

interface Props {
	code: string;
	onSelect: (item: string) => void;
}

const HeaderSwitcher: React.FC<Props> = ({ code, onSelect }) => {
	const { theme } = useTheme();
	const styles = useMemo(() => createStyles(theme), [theme]);
	const ref = useRef<TextInput>(null);
	const [focused, setFocused] = useState(false);


	const dispatch = useDispatch();
	const query = useSelector((state: any) => state.ui.search.query);
	const data1 = useSelector((state: any) => state.symbolBrokerages);
	const data = useSelector((state: any) => state.symbols);
	const isDemo = useSelector((state: any) => state.auth.demo);
	const isFocused = useIsFocused();

	useEffect(() => {
		if (focused && data1?.length < 1 && wssControl === "connect") {
			request(symbolTest);
		}
	}, [focused, data1, wssControl]);

	useEffect(() => {
		if (!focused && isFocused) {
			dispatch(changeQuery(""));
		}
	}, [focused, isFocused, dispatch]);

	const handleChangeText = useCallback(
		(text: string) => {
			dispatch(changeQuery(text));
		},
		[dispatch]
	);

	const handleSubmit = useCallback(() => {
		if (!isDemo && data1 && data1.length > 0) {
			// onSelect(data1[0]);
		} else if (data && data.length > 0) {
			onSelect(data[0]);
		}
	}, [data, data1, isDemo, onSelect]);

	return (
		<TouchableOpacity
			activeOpacity={1}
			onPress={() => ref.current?.focus()}
			style={styles.button}
		>
			<Ionicons
				style={styles.icon}
				name="search"
				size={16}
				color={theme.white}
			/>
			<TextInput
				ref={ref}
				value={focused ? query : code}
				onChangeText={handleChangeText}
				style={styles.input}
				placeholderTextColor={theme.white}
				placeholder="Ara..."
				autoCapitalize="characters"
				spellCheck={false}
				autoCorrect={false}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				returnKeyType="go"
				onSubmitEditing={handleSubmit}
			/>
		</TouchableOpacity>
	);
};

const createStyles = (theme: any) =>
	StyleSheet.create({
		button: {
			height: 34,
			borderRadius: 10,
			borderWidth: 1,
			borderColor: "#444",
			alignSelf: "center",
			paddingHorizontal: 8,
			paddingLeft: 30,
			backgroundColor: theme.darkerBrand,
			justifyContent: "center",
		},
		icon: {
			position: "absolute",
			left: 10,
			top: "50%",
			marginTop: -10,
		},
		input: {
			color: theme.white,
			maxWidth: 100,
			minWidth: 0,
			fontSize: 14,
			lineHeight: 18,
			...Platform.select({
				android: {
					paddingVertical: 0,
					height: 22,
					textAlignVertical: "center",
					includeFontPadding: false,
				},
			}),
		},
	});

export default React.memo(HeaderSwitcher);
