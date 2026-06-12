import React from "react";
import { StyleSheet, View, Text } from "react-native";
import WatchListEditorTriggerContainer from "../containers/WatchListEditorTriggerContainer";
import CheckSquareOrList from "./CheckSquareOrList";
import { useTheme } from "../../../theme/ThemeContext";

interface Props {
	selectedListTitle: string;
	navigation: any;
}

const ListSelectorTrigger: React.FC<Props> = ({ selectedListTitle, navigation }) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);
	return (
		<View style={styles.container}>
			<Text
				style={[styles.title, { color: theme.white, fontFamily: theme.boldFont }]}
				numberOfLines={1}
			>
				{selectedListTitle}
			</Text>
			<View style={styles.actions}>
				<CheckSquareOrList />
				<WatchListEditorTriggerContainer navigation={navigation} />
			</View>
		</View>
	);
};

const createStyles = (theme: any) =>
	StyleSheet.create({
		container: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			backgroundColor: theme.darkestBrand,
			paddingHorizontal: 14,
			paddingVertical: 8,
		},
		title: {
			flex: 1,
			fontSize: 17,
			letterSpacing: 0.2,
			marginRight: 12,
		},
		actions: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
	});

export default ListSelectorTrigger;
