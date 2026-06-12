import React, { useState } from "react";
import SearchLayout from "../../../components/SearchLayout/SearchLayout";
import WatchListEditorAddResultsContainer from "./WatchListEditorAddResultsContainer";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../theme/ThemeContext";

interface Props {
	route: any
}

const WatchListEditorAddContainer: React.FC<Props> = ({ route }) => {
	const { theme } = useTheme();

	const [searchText, setSearchText] = useState("");

	// Parametreleri route üzerinden alıyoruz
	const watchList = route.params?.watchList;
	const onAdd = route.params?.onAdd;
	const onRemove = route.params?.onRemove;
	const navigation = useNavigation();

	return (
		<SearchLayout
			onChangeQuery={setSearchText}
			onSubmit={setSearchText}
			headerBackgroundColor={theme.darkestBrand}
			headerTintColor={theme.onBlue}
			cancelButtonText="Kapat"
		>
			{searchText.trim().length > 0 && (
				<WatchListEditorAddResultsContainer
					watchList={watchList}
					add={onAdd}
					remove={onRemove}
					query={searchText}
				/>
			)}
		</SearchLayout>
	);
};

export default WatchListEditorAddContainer;
