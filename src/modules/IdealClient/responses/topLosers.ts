import { loadSuccess } from "../../../screens/Markets/modules/lists";
import { SEP1 } from "../constants";
import { AppDispatch, RootState } from "../../../store"; // Adjust path based on your project structure

// Define the parser function
export const topLosers = (
	store: { dispatch: AppDispatch; getState: () => RootState },
	message: string
) => {
	const parsedData = message.split(SEP1);
	store.dispatch(loadSuccess({ type: "topLosers", codes: parsedData }));
};
