import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import WatchListEditorAddResults from "../components/WatchListEditorAddResults";
import { selectedListCodesSelector } from "../modules/lists";

const WatchListEditorAddResultsContainer = ({ query, watchList }) => {
	// Redux'tan gerekli state'leri alıyoruz
	const selectedCodes = useSelector((state: any) =>
		watchList
			? state.watchLists.lists[state.watchLists.selectedIndex].codes
			: selectedListCodesSelector(state)
	);

	const codes = useSelector((state: any) => state.symbols);

	const filteredAndSortedCodes = useMemo(() => {
		return Object.keys(codes)
			.filter((code) => code.toUpperCase().startsWith(query.toUpperCase()))
			.sort();
	}, [codes, query]);

	return (
		<WatchListEditorAddResults selectedCodes={selectedCodes} codes={filteredAndSortedCodes} />
	);
};

export default WatchListEditorAddResultsContainer;
