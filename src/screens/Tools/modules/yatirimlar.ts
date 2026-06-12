import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Yatirim {
    sembolKodu: string;
    sirketAdi: string;
    composite: string;
    miktar: number;
    alisFiyati: number;
}

interface YatirimlarState {
    list: Yatirim[];
}

const initialState: YatirimlarState = {
    list: [],
};

const yatirimlarSlice = createSlice({
    name: "yatirimlar",
    initialState,
    reducers: {
        addYatirim(state, action: PayloadAction<Yatirim>) {
            state.list.push(action.payload);
        },
        removeYatirim(state, action: PayloadAction<string>) {
            state.list = state.list.filter((y) => y.sembolKodu !== action.payload);
        },
    },
});

export const { addYatirim, removeYatirim } = yatirimlarSlice.actions;
export default yatirimlarSlice.reducer;
