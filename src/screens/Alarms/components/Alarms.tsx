import React from "react";
import { StyleSheet, FlatList } from "react-native";
import Row from "./Row";
import { useTheme } from "../../../theme/ThemeContext";

const Alarms: React.FC<any> = ({
	data,
	loading,
	load,
	deleteAlarm,
}) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);
	const renderRow = ({ item }) => <Row onDelete={deleteAlarm} {...item} />;
	const keyExtractor = (item) => `${item.id}`;

	return (
		<FlatList
			style={styles.container}
			refreshing={loading}
			onRefresh={load}
			renderItem={renderRow}
			data={data}
			initialNumToRender={20}
			keyExtractor={keyExtractor}
		/>
	);
};
const createStyles = (theme: any) => StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default Alarms;
