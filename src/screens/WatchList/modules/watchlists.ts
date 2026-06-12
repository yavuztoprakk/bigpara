import { createSlice, PayloadAction, createAction } from "@reduxjs/toolkit";


export const defaultDemoList = [{ title: "İzleme Listem", codes: [	"XU100",
	"VIP-X030-T",
	"",
	"GARAN",
	"AKBNK",
	"HALKB",
	"ISCTR",
	"YKBNK",
	"SAHOL",
	"TCELL",
	"THYAO",
	"VAKBN",
	"DOHOL",
	"ZOREN",] }];


export const defaultWatchlist = [
	"XU100",
	"VIP-X030-T",
	"",
	"GARAN",
	"AKBNK",
	"HALKB",
	"ISCTR",
	"YKBNK",
	"SAHOL",
	"TCELL",
	"THYAO",
	"VAKBN",
	"DOHOL",
	"ZOREN",
];

// LOGOUT aksiyonunu Redux Toolkit ile tanımlıyoruz
export const logout = createAction("auth/logout");

export type WatchLists = Array<{ title: string; codes: string[] }>;
export interface WatchList {
	title: string;
	codes: string[];
}

interface WatchListsState {
	selectedIndex: number;
	lists: WatchLists;
}

const initialState: WatchListsState = {
	selectedIndex: 0,
	lists: [{ title: "İzleme Listem", codes: defaultWatchlist }],
};

const watchListsSlice = createSlice({
	name: "watchLists",
	initialState,
	reducers: {
		add(state, action: PayloadAction<WatchList>) {
			state.lists.push(action.payload);
			state.selectedIndex = state.lists.length - 1;
		},
		update(state, action: PayloadAction<string[]>) {
			state.lists[state.selectedIndex] = {
				...state.lists[state.selectedIndex],
				codes: action.payload,
			};
		},
		updateAll(state, action: PayloadAction<WatchLists>) {
			const watchlists = action.payload;
			if (watchlists.length > 0) {
				state.lists = watchlists;
				state.selectedIndex =
					state.selectedIndex > watchlists.length - 1 ? 0 : state.selectedIndex;
			}
		},
		remove(state, action: PayloadAction<WatchList>) {
			const indexToRemove = state.lists.findIndex(
				(list) => list.title === action.payload.title
			);
			if (indexToRemove !== -1) {
				state.lists.splice(indexToRemove, 1);
				state.selectedIndex =
					indexToRemove === state.selectedIndex ? 0 : state.selectedIndex;
			}
		},
		select(state, action: PayloadAction<number>) {
			state.selectedIndex = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(logout, () => initialState); // logout aksiyonu tetiklendiğinde durumu sıfırla
	},
});

export const {
	add,
	update,
	updateAll,
	remove,
	select,
} = watchListsSlice.actions;

export default watchListsSlice.reducer;
