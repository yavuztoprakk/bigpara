import { combineReducers } from "redux";
import listReducer from "./list";

export default combineReducers({
	list: listReducer
});
