import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BilancoRaporData {
    [key: string]: any;
}

interface BilancoRaporState {
    data: BilancoRaporData | null;
    loading: boolean;
    error: string | null;
}

const initialState: BilancoRaporState = {
    data: null,
    loading: false,
    error: null,
};

const bilancoRaporSlice = createSlice({
    name: "bilancoRapor",
    initialState,
    reducers: {
        fetchBilancoRaporStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchBilancoRaporSuccess(state, action: PayloadAction<BilancoRaporData>) {
            state.data = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchBilancoRaporFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchBilancoRaporStart,
    fetchBilancoRaporSuccess,
    fetchBilancoRaporFailure,
} = bilancoRaporSlice.actions;

export default bilancoRaporSlice.reducer;
