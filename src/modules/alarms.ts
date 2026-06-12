import { combineReducers } from "redux";
import create from "../screens/AlarmsCreate/modules/create";
import list from "../screens/Alarms/modules/list";

export default combineReducers({
	list,
	create,
});
