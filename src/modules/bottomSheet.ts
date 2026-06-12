import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BottomSheetState {
	type: string;
	attachment: string | null;
	open: boolean;
	backdrop: boolean;
	order: boolean;
	detailOrderBook: boolean;
}

const initialState: BottomSheetState = {
	type: "",
	attachment: null,
	open: false,
	backdrop: true,
	order: false,
	detailOrderBook: false,

};


const bottomSheetSlice = createSlice({
	name: "bottomSheet",
	initialState,
	reducers: {
		open: (state, action: PayloadAction<{ type: string; backdrop?: boolean, order?: boolean, detailOrderBook?: boolean }>) => {
			const { type, backdrop, order, detailOrderBook } = action.payload;
			state.open = true;
			state.type = type;
			state.backdrop = backdrop ?? true;
			state.order = order ?? false;
			state.detailOrderBook = detailOrderBook ?? false;

		},
		close: (state) => {
			state.open = false;
			state.type = "";
			state.attachment = null;
			state.backdrop = true;
			state.order = false;
		},
		changeAttachment: (state, action: PayloadAction<string | null>) => {
			state.attachment = action.payload;
		},
	},
});

export const { open, close, changeAttachment } = bottomSheetSlice.actions;

export default bottomSheetSlice.reducer;
