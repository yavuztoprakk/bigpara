import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SenetBilgi {
    a: string; // Sembol kodu (ör: "A1CAP")
    b: string; // Pazar tipi
    c: string;
    d: string; // Senet ID
    e: string;
    f: string; // Şirket adı (ör: "A1 CAPITAL YATIRIM")
    g: string; // Seri
    h: string; // Pazar adı
    i: number;
    j: number;
}

interface SenetsBilgiState {
    data: SenetBilgi[];
    loading: boolean;
    error: string | null;
    prefix: string | null;
    seri: string | null;
}

const initialState: SenetsBilgiState = {
    data: [],
    loading: false,
    error: null,
    prefix: null,
    seri: null,
};

const senetsBilgiSlice = createSlice({
    name: "senetsBilgi",
    initialState,
    reducers: {
        fetchSenetsBilgiStart(state, action: PayloadAction<{ prefix: string; seri: string }>) {
            state.loading = true;
            state.error = null;
            state.prefix = action.payload.prefix;
            state.seri = action.payload.seri;
        },
        fetchSenetsBilgiSuccess(state, action: PayloadAction<SenetBilgi[]>) {
            state.data = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchSenetsBilgiFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchSenetsBilgiStart,
    fetchSenetsBilgiSuccess,
    fetchSenetsBilgiFailure,
} = senetsBilgiSlice.actions;

export default senetsBilgiSlice.reducer;
