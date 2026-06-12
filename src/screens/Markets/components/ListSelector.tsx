import React from "react";
import BottomSheetLayer from "../../../components/BottomSheet/BottomSheetLayer";
import Select, { Option } from "../../../components/BottomSheet/Select";
import { listOptions } from "../modules/lists";
import { request } from "../../../modules/IdealClient";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";
import { navigationRef } from "../../../routes/AppNavigator";

interface Props {
	open: boolean;
	close: () => void;
	selected: Option;
	select: (type: string) => void;
	navigation: any;
}
const navigatedLists = {
	varantlar: [
		"SymbolSearcherFilterList",
		{ title: "Varantlar", category: "warrant" },
	],
};

export const turkishToAsciiUpper = (str: any) => {
	if (!str) return "";

	// Önce Türkçe kurallarına göre büyük harfe dönüştür
	let upper = str.toLocaleUpperCase("tr-TR");

	// Ardından Türkçe harfleri ASCII muadilleriyle değiştir
	// (Ü -> U, Ö -> O, Ç -> C, Ş -> S, Ğ -> G, İ -> I)
	upper = upper
		.replace(/Ü/g, "U")
		.replace(/Ö/g, "O")
		.replace(/Ç/g, "C")
		.replace(/Ş/g, "S")
		.replace(/Ğ/g, "G")
		.replace(/İ/g, "I");

	return upper;
}

const ListSelector: React.FC<Props> = ({ open, close, select, selected, navigation }) => {
	return (
		<BottomSheetLayer
			title="Piyasalar"
			open={open}
			small={false}
			onCancel={close}
			contentHeight={385}
		>
			<Select
				onChange={(type) => {
					if (navigatedLists[type]) {

						if (navigationRef?.current) {
							navigationRef.current.navigate(...navigatedLists[type]);
						}
						/* navigation.navigate("SymbolSearcherFilterList", {
							title: "Varantlar",
							category: "warrant",
						}); */
					}
					else {
						const item = listOptions.find((item) => item.value === type);
						if (
							item?.title === "Devre Kesici" ||
							item?.title === "Brüt Takas" ||
							item?.value === "BYF"
						) { } else {
							const title = turkishToAsciiUpper(item?.title);
							request(symbolSend, title, " ");
						}

						select(type);
					}
					close();
				}}
				options={listOptions}
				value={selected.value}
			/>
		</BottomSheetLayer>
	);
}


export default ListSelector;
