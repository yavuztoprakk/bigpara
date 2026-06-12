import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { open as openBottomSheet, close as closeBottomSheet, changeAttachment } from "../../../modules/bottomSheet";

const XDate = require("xdate");

export const modulusTimeframeOptions = [
	{ value: "1", title: "1 dakika" },
	{ value: "2", title: "2 dakika" },
	{ value: "3", title: "3 dakika" },
	{ value: "4", title: "4 dakika" },
	{ value: "5", title: "5 dakika" },
	{ value: "8", title: "8 dakika" },
	{ value: "10", title: "10 dakika" },
	{ value: "15", title: "15 dakika" },
	{ value: "20", title: "20 dakika" },
	{ value: "30", title: "30 dakika" },
	{ value: "60", title: "60 dakika" },
	{ value: "S", title: "Seans" },
	{ value: "G", title: "Gün" },
	{ value: "H", title: "Hafta" },
	{ value: "A", title: "Ay" },
	{ value: "Y", title: "Yıl" },
];

export const levelStatsOptions = [
	{ value: "G", title: "Gün" },
	{ value: "1", title: "Son 1 Dk" },
	{ value: "2", title: "Son 2 Dk" },
	{ value: "5", title: "Son 5 Dk" },
	{ value: "10", title: "Son 10 Dk" },
	{ value: "30", title: "Son 30 Dk" },
	{ value: "60", title: "Son 60 Dk" },
	{ value: "S1", title: "1. Seans" },
	{ value: "S2", title: "2. Seans" },
];

export const custodyOptions = [
	{ value: "SON", title: "Güncel Takas" },
	{ value: "1", title: "1 Gün Öncesi" },
	{ value: "2", title: "2 Gün Öncesi" },
	{ value: "3", title: "3 Gün Öncesi" },
	{ value: "4", title: "4 Gün Öncesi" },
	{ value: "5", title: "5 Gün Öncesi" },
	{ value: "10", title: "10 Gün Öncesi" },
];

export const singleDateOptions = [
	{ value: "custom-single", title: "Seçili Tarih" },
];

export const custodyChangeOptions = [
	{ value: "day", title: "Günlük" },
	{ value: "week", title: "Haftalık" },
	{ value: "month", title: "Aylık" },
	{ value: "custom", title: "İki Tarih Arası" },
];

export const pitOptions = [
	{ value: "custom-single", title: "Tek gün" },
	{ value: "custom", title: "İki Tarih Arası" },
];
export const pitOptions1 = [
	{ value: "custom", title: "İki Tarih Arası" },
];


export const piteOptions = [
	{ value: "custom-single", title: "Tek Gün" },
	{ value: "custom", title: "İki Tarih Arası Değişim" },
];

export const custodyBrokeragesOptions = [
	{ value: "1", title: "Son 1 Gün" },
	{ value: "2", title: "Son 2 Gün" },
	{ value: "3", title: "Son 3 Gün" },
	{ value: "4", title: "Son 4 Gün" },
	{ value: "5", title: "Son 5 Gün" },
	{ value: "10", title: "Son 10 Gün" },
];

export const custodyPiteBrokeragesOptions = [
	{ value: "0", title: "Anlık" },
	...custodyBrokeragesOptions,
];

export const brokerageStatsOptions = [
	{ value: "custom", title: "İki Tarih Arası" },
];

export const singleDateRangeOptions = [
	{ value: "custom", title: "İki Tarih Arası" },
];

// Fallback to friday on saturday/sunday
export const fixWeekend = (date: any) => {
	const newDate = date.clone();
	if (newDate.getDay() === 6) {
		newDate.addDays(-1);
	} else if (newDate.getDay() === 0) {
		newDate.addDays(-2);
	}
	return newDate;
};

export const parseRangeOptions = (value: any, format = "yyyyMMdd") => {
	let end = fixWeekend(XDate());
	let start = fixWeekend(XDate());

	if (value && value.startsWith("custom|")) {
		[start, end] = value
			.split("|")
			.slice(1)
			.map((d: any) => fixWeekend(XDate(new Date(d))));
	} else if (value && value.startsWith("custom-single|")) {
		const date = value.split("custom-single|")[1];
		start = fixWeekend(XDate(new Date(date)));
		end = fixWeekend(XDate(new Date(date)));
	} else if (value === "week") {
		start.addWeeks(-1);
		start = fixWeekend(start);
	} else if (value === "month") {
		start.addMonths(-1);
		start = fixWeekend(start);
	} else if (value === "year") {
		start.addYears(-1);
		start = fixWeekend(start);
	} else if (value === "day") {
		start.addDays(-1);
		start = fixWeekend(start);
	}

	return [start.toString(format), end.toString(format)];
};
export const openDateForm = createAsyncThunk(
	"dateForm/open",
	async ({ selected, options, attachment }: { selected: string; options: any[]; attachment?: string }, { dispatch }) => {
		dispatch(dateFormSlice.actions.open({ selected, options }));
		dispatch(openBottomSheet({ type: "dateForm" }));
		if (attachment) {
			dispatch(changeAttachment(attachment));
		}
	}
);

export const closeDateForm = createAsyncThunk(
	"dateForm/close",
	async (_, { dispatch }) => {
		dispatch(dateFormSlice.actions.reset());
		dispatch(closeBottomSheet());
	}
);

const dateFormSlice = createSlice({
	name: "dateForm",
	initialState: {
		selected: null,
		options: [],
	},
	reducers: {
		open: (state, action) => {
			state.selected = action.payload.selected;
			state.options = action.payload.options;
		},
		reset: () => {
			return {
				selected: null,
				options: [],
			};
		},
		select: (state, action) => {
			state.selected = action.payload;
		},
	},
});

export const { reset, select } = dateFormSlice.actions;

export default dateFormSlice.reducer;

