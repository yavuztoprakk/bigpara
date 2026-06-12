import React, { useCallback, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { codesSelector, update as updateList } from "../modules/lists";
import WatchListEditor from "../components/WatchListEditor";
import { BorderlessButton } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { HeaderBackButton } from '@react-navigation/elements';
import { update as updateWatchList } from "../../WatchList/modules/watchlists";
import Text from "../../../components/Text";
import { RootState } from "../../../store";
import { useTheme } from "../../../theme/ThemeContext";

interface Props {
	navigation: any;
	route: any;
}

const WatchListEditorContainer: React.FC<Props> = ({ navigation, route }) => {
	const { theme } = useTheme();
	const dispatch = useDispatch();

	const watchList = route?.params?.watchList
	const selectedCodes = useSelector((state: RootState) => state.watchLists.lists[state.watchLists.selectedIndex]?.codes
	);

	const applyHeader = useCallback(() => {
		navigation.setOptions({
			title: (route?.params?.watchList || { title: "İzleme Listem" }).title,
			headerTintColor: theme.onBlue,
			headerTitleAlign: "center",
			headerLeft: () =>
				Platform.OS === "ios" ? (
					<BorderlessButton
						onPress={() => navigation.goBack()}
						style={{ marginLeft: 15 }}
					>
						<Text style={{ color: theme.onBlue }}>Kaydet</Text>
					</BorderlessButton>
				) : (
					<HeaderBackButton
						tintColor={theme.onBlue}
						onPress={() => navigation.goBack()}
					/>
				),
		});
	}, [navigation, route, theme]);

	useLayoutEffect(() => {
		applyHeader();
		return navigation.addListener("focus", applyHeader);
	}, [applyHeader]);

	const updateWatchListHandler = (codes: string[]) => {
		dispatch(updateWatchList(codes));
	};

	return (
		<WatchListEditor
			navigation={navigation}
			watchList={watchList}
			selectedCodes={selectedCodes}
			update={updateWatchListHandler}
		/>
	);
};

export default WatchListEditorContainer;
