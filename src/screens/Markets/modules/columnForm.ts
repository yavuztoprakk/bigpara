import { createSlice } from "@reduxjs/toolkit";
import { open as openBottomSheet } from "../../../modules/bottomSheet";

const initialState = 0;

const columnFormSlice = createSlice({
	name: "columnForm",
	initialState,
	reducers: {
		columnFormOpen: (state, action) => action.payload,
	},
});

export const { columnFormOpen } = columnFormSlice.actions;

export const open = (colIndex: any) => (dispatch: any) => {
	dispatch(columnFormOpen(colIndex));
	dispatch(openBottomSheet({ type: "columnForm" }));
};

export default columnFormSlice.reducer;
