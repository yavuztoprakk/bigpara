import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ParamNeOlduItem {
    s: string;
    n: number;
    r: number;
}

export interface ParamNeOlduData {
    p: string;
    p1: number;
    list: ParamNeOlduItem[];
}

interface ParamNeOlduState {
    data: ParamNeOlduData | null;
    loading: boolean;
    error: string | null;
}

const initialState: ParamNeOlduState = {
    data: null,
    loading: false,
    error: null,
};

const paramNeOlduSlice = createSlice({
    name: "paramNeOldu",
    initialState,
    reducers: {
        fetchParamNeOlduStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchParamNeOlduSuccess(state, action: PayloadAction<ParamNeOlduData>) {
            state.data = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchParamNeOlduFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchParamNeOlduStart,
    fetchParamNeOlduSuccess,
    fetchParamNeOlduFailure,
} = paramNeOlduSlice.actions;

export default paramNeOlduSlice.reducer;
