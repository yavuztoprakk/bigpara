import React from "react";
import { useSelector, useDispatch } from "react-redux";
import HeaderSwitcherResults from "../components/HeaderSwitcherResults";
import { codeSearchSelector } from "../screens/Markets/modules/symbols";
import { changeQuery } from "../modules/search";

export type HeaderSwitcherSelectHandler = (code: string) => void;

interface Props {
	position: string;
	onSelect: HeaderSwitcherSelectHandler;
}

const HeaderSwitcherResultsContainer: React.FC<Props> = ({
	position,
	onSelect
}) => {

	const dispatch = useDispatch();
	const query = useSelector((state: any) => state.ui.search.query.trim());
	const data = useSelector((state: any) => codeSearchSelector(state));
	const data1 = useSelector((state: any) => state.symbolBrokerages);

	const handleQueryChange = (newQuery: string) => {
		dispatch(changeQuery(newQuery));
	};
	return (
		<HeaderSwitcherResults
			query={query}
			data={data}
			data1={data1}
			position={position}
			onQueryChange={handleQueryChange}
			onSelect={onSelect}
		/>
	)
};

export default HeaderSwitcherResultsContainer;
