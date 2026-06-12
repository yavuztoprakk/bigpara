import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: number = 0;

const tabStatusBrokeragesSlice = createSlice({
	name: "tabStatusBrokerages",
	initialState,
	reducers: {
		updateTabStatusBrokerages: (state, action: PayloadAction<number>) => {
			return action.payload;
		},
	},
});

// Actions ve reducer'ı dışa aktar
export const { updateTabStatusBrokerages } = tabStatusBrokeragesSlice.actions;
export default tabStatusBrokeragesSlice.reducer;