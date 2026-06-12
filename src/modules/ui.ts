import { combineReducers } from "redux";
import search from "./search";
import bottomSheet from "./bottomSheet";

export default combineReducers({
	search,
	bottomSheet
});
