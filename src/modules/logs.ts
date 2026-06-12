import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const LOG_STORE_LIMIT = 150;

const initialState: string[] = [];

const logsSlice = createSlice({
	name: "logs",
	initialState,
	reducers: {
		log: (state, action: PayloadAction<string>) => {
			const message = `${new Date().toISOString()}\n${action.payload}`;
			// Yeni mesajı ekleyip, sınırı aşmayan en fazla 150 mesajı döndür
			return [message, ...state].slice(0, LOG_STORE_LIMIT);
		},
	},
});

// Actions ve reducer'ı dışa aktar
export const { log } = logsSlice.actions;
export default logsSlice.reducer;
