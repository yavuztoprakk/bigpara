import { reducer as formReducer } from "redux-form";
import authReducer from "./../screens/Auth/modules/auth";
import { combineReducers } from "@reduxjs/toolkit";
import preferences from "../screens/Auth/modules/preferences";
import reconnect from "../modules/IdealClient/responses/reconnect";
import bottomSheet from "../modules/bottomSheet";
import survey from "../modules/survey";
import prices from "../screens/Markets/modules/prices";
import symbols from "../screens/Markets/modules/symbols";
import marketsReducer from "../screens/Markets/modules/markets";
import uiReducers from "../modules/ui";
import symbolBrokerages from "../components/symbolTest";
import columnForm from "../screens/Markets/modules/columnForm";
import watchListsReducer from "../screens/WatchList/modules/watchlists";
import chart from "../screens/Markets/modules/chart";
import fundamentalsReducers from "../modules/fundamentals";
import yieldStats from "../screens/Markets/modules/yieldStats";
import stats from "../screens/Markets/modules/stats";
//import newsReducer from "../screens/News/modules/news";
import books from "../modules/books";
import pageLastBrokerages from "../modules/pageStatus";
import logs from "../modules/logs";
import calendar from "../screens/Calendar/modules/calendar";
import alarmReducer from "../modules/alarms";
import dateForm from "../screens/DateForm/modules/dateForm";
import brokerageStats from "../screens/Markets/modules/brokerageStats";
import custodyChanges from "../screens/Markets/modules/custodyChanges";
import ownerStats from "../screens/Markets/modules/ownerStats";
import levelStats from "../screens/Markets/modules/levelStats";
import pushNotifications from "../modules/pushNotifications";
import updates from "../modules/updates";
import tabStatusBrokerages from "../modules/tabStatus";
import senetsBilgi from "../screens/Tools/modules/senetsBilgi";
import yatirimlar from "../screens/Tools/modules/yatirimlar";
import paramNeOldu from "../screens/Tools/modules/paramNeOldu";
import pivotAnalizi from "../screens/Tools/modules/pivotAnalizi";
import kademeAnalizi from "../screens/Tools/modules/kademeAnalizi";
import bilancoRapor from "../screens/Tools/modules/bilancoRapor";
import dividendCalendar from "../screens/DividendCalendar/modules/dividendCalendar";

const rootReducer = combineReducers({
	form: formReducer,
	auth: authReducer,
	preferences,
	reconnect,
	bottomSheet,
	survey,
	prices,
	symbols,
	markets: marketsReducer,
	ui: uiReducers,
	symbolBrokerages,
	columnForm,
	watchLists: watchListsReducer,
	chart,
	fundamentals: fundamentalsReducers,
	yieldStats,
	stats,
	//news: newsReducer,
	books,
	pageLastBrokerages,
	logs,
	calendar,
	alarms: alarmReducer,
	dateForm,
	brokerageStats,
	custodyChanges,
	ownerStats,
	levelStats,
	pushNotifications,
	updates,
	tabStatusBrokerages,
	senetsBilgi,
	yatirimlar,
	paramNeOldu,
	pivotAnalizi,
	kademeAnalizi,
	bilancoRapor,
	dividendCalendar,
});

export default rootReducer;
