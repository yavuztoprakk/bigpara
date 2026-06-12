import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface KademeLevel {
    price: string;
    lot: string;
    percent: string;
    buy: string;
    sell: string;
}

interface KademeAnaliziState {
    data: KademeLevel[];
    code: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: KademeAnaliziState = {
    data: [],
    code: null,
    loading: false,
    error: null,
};

const kademeAnaliziSlice = createSlice({
    name: "kademeAnalizi",
    initialState,
    reducers: {
        fetchKademeStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchKademeSuccess(state, action: PayloadAction<{ code: string; data: KademeLevel[] }>) {
            state.code = action.payload.code;
            state.data = action.payload.data;
            state.loading = false;
            state.error = null;
        },
        fetchKademeFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchKademeStart,
    fetchKademeSuccess,
    fetchKademeFailure,
} = kademeAnaliziSlice.actions;

export default kademeAnaliziSlice.reducer;
