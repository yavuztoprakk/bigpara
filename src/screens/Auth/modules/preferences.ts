import { createSlice, createSelector } from "@reduxjs/toolkit";
//import { todayKey } from "../../../modules/survey";
const XDate = require("xdate");

export const todayKey = () => new XDate().toString("yyyyMMdd");
export const rightSwipeOptions = [
  { value: "DetailOrderBook", title: "Derinlik" },
  { value: "DetailTradingView", title: "Teknik Analiz" },
  { value: "DetailNews", title: "Haberler" },
];
export interface SquareOrListValueWatchlist {
  butonClickValue: boolean;
}
export interface SquareOrListValueMarket {
  butonClickValueMarket: boolean;
}

export interface UpdateTimeModeControl {
  updateTimeModeControl: boolean;
}
export interface UpdateNotificationChannelControl {
  updateNotificationChannelControl: boolean;
}
export interface DetailChartPreferences {
  period: string;
  count: number;
}

export const defaultChartPreferences = { period: "G", count: 255 };
export const defaultSquareOrListValueWatchlist = { butonClickValue: true };
export const defaultSquareOrListValueMarket = { butonClickValueMarket: true };
export const defaultUpdateTimeModeControl = { updateTimeModeControl: false };
export const defaultUpdateNotificationChannelControl = { updateNotificationChannelControl: true };

export interface DetailChartPreferences {
  period: string;
  count: number;
}

export type InitialTab = "WatchList" | "Markets" | "News" | "Tools";

interface Preferences {
  columns: string[];
  columnsCount: number;
  detailChart: DetailChartPreferences;
  modulusStates: any;
  lastSurvey?: string;
  rightSwipeAction: string;
  orderDepth: number;
  defaultOrderQuantity: string;
  localAuth: boolean;
  butonClickValue: SquareOrListValueWatchlist;
  butonClickValueMarket: SquareOrListValueMarket;
  updateTimeModeControl: UpdateTimeModeControl;
  updateNotificationChannelControl: UpdateNotificationChannelControl;
  executionPush: boolean;
  initialTab: InitialTab;
}

// Başlangıç state yapısı
const initialState: Preferences = {
  columns: ["lastPrice", "bid", "ask", "changePercent"],
  columnsCount: 4,
  detailChart: defaultChartPreferences,
  modulusStates: null,
  lastSurvey: null,
  rightSwipeAction: "DetailOrderBook",
  orderDepth: 1,
  defaultOrderQuantity: "",
  butonClickValue: defaultSquareOrListValueWatchlist,
  butonClickValueMarket: defaultSquareOrListValueMarket,
  updateTimeModeControl: defaultUpdateTimeModeControl,
  localAuth: false,
  updateNotificationChannelControl: defaultUpdateNotificationChannelControl,
  executionPush: false,
  initialTab: "WatchList",
};

export interface DetailChartPreferences {
  period: string;
  count: number;
}

// Slice oluşturma
const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    updateColumnsCount: (state, action) => {
      state.columnsCount = action.payload;
    },
    updateRightSwipeAction: (state, action) => {
      state.rightSwipeAction = action.payload;
    },
    updateOrderDepth: (state, action) => {
      state.orderDepth = action.payload;
    },
    updateDefaultOrderQuantity: (state, action) => {
      state.defaultOrderQuantity = action.payload;
    },
    updateModulusStates: (state, action) => {
      state.modulusStates = {
        ...state.modulusStates,
        [action.payload.code]: action.payload.data,
      };
    },
    updateSquareOrListValueWatchlist: (state: any, action) => {
      console.log('Watchlist Görünüm Değeri:', action.payload);
      console.log('Önceki Watchlist State:', state.butonClickValue);
      
      // State'i doğru şekilde güncelle
      state.butonClickValue = {
        butonClickValue: action.payload
      };
    },
    updateSquareOrListValueMarket: (state, action) => {
      console.log('Market Görünüm Değeri:', action.payload);
      console.log('Önceki Market State:', state.butonClickValueMarket);
      state.butonClickValueMarket = {
        butonClickValueMarket: action.payload
      };
    },
    updateTimeModeControl: (state: any, action) => {
      state.updateTimeModeControl.updateTimeModeControl = action.payload;
    },
    updateLocalAuth: (state, action) => {
      state.localAuth = action.payload;
    },
    submitSurvey: (state) => {
      state.lastSurvey = todayKey();
    },
    updateColumns: (state, action) => {
      state.columns = action.payload;
    },
    updateChartPreferences: (state, action) => {
      state.detailChart = action.payload;
    },
    updateExecutionPush: (state, action) => {
			state.executionPush = action.payload;
		},
    updateNotificationChannelControl: (state, action) => {
      state.updateNotificationChannelControl = action.payload;
    },
    updateInitialTab: (state, action) => {
      state.initialTab = action.payload;
    },
  },
});

// Selectors
export const columnsCountSelector = createSelector(
  (state) => state.preferences,
  (preferences) => preferences.columnsCount || 4
);

export const columnsSelector = createSelector(
  columnsCountSelector,
  (state) => state.preferences,
  (count, preferences) => {
    let cols = preferences.columns.slice(0, count);
    if (cols.length < count) {
      cols = [...cols, ...Array(count - cols.length).fill("lastPrice")];
    }
    return cols;
  }
);

// Actionlar ve reducer dışa aktarımı
export const {
  updateColumnsCount,
  updateRightSwipeAction,
  updateOrderDepth,
  updateDefaultOrderQuantity,
  updateModulusStates,
  updateSquareOrListValueWatchlist,
  updateSquareOrListValueMarket,
  updateTimeModeControl,
  submitSurvey,
  updateColumns,
  updateChartPreferences,
  updateLocalAuth,
  updateNotificationChannelControl,
  updateExecutionPush,
  updateInitialTab
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
