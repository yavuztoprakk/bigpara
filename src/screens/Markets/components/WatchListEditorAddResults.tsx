import React from "react";
import { FlatList } from "react-native";
import WatchListEditorAddRow from "./WatchListEditorAddRow";

interface Props {
	codes: string[];
	selectedCodes: string[];
	add: (code: string) => void;
	remove: (code: string) => void;
}

const WatchListEditorAddResults: React.FC<Props> = ({
	codes,
	selectedCodes,
	add,
	remove,
}) => (
	<FlatList
		data={codes}
		keyExtractor={(code) => code}
		keyboardShouldPersistTaps="always"
		initialNumToRender={20}
		renderItem={({ item }) => (
			<WatchListEditorAddRow
				code={item}
				added={selectedCodes.indexOf(item) > -1}
				onAdd={add}
				onRemove={remove}
			/>
		)}
		style={{ flex: 1 }}
	/>
);

export default WatchListEditorAddResults;
