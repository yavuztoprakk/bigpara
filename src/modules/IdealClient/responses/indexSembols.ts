import AsyncStorage from "@react-native-async-storage/async-storage";
import { SEP1 } from "../constants";
import { loadSuccess } from "../../../screens/Markets/modules/lists";
import { AppDispatch, RootState } from "../../../store";

const SELECTED_LIST_VALUE_INDEX_SYMBOL = "SELECTED_LIST_VALUE_INDEX_SYMBOL";

const indexSymbols = async (
	store: { dispatch: AppDispatch; getState: () => RootState },
	message: string
) => {
	try {
		const indexSymbolsSelected = await AsyncStorage.getItem(SELECTED_LIST_VALUE_INDEX_SYMBOL);

		const selectedSymbol = indexSymbolsSelected ? indexSymbolsSelected.toString() : "";
		if (selectedSymbol) {
			store.dispatch(loadSuccess({ type: selectedSymbol, codes: message.split(SEP1) }));
		}
	} catch (error) {
		console.error("Error fetching index symbol:", error);
	}
};

export default indexSymbols;
