import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PivotAnaliziData {
    [key: string]: any;
}

interface PivotAnaliziState {
    data: PivotAnaliziData | null;
    loading: boolean;
    error: string | null;
}

const initialState: PivotAnaliziState = {
    data: null,
    loading: false,
    error: null,
};

const pivotAnaliziSlice = createSlice({
    name: "pivotAnalizi",
    initialState,
    reducers: {
        fetchPivotAnaliziStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchPivotAnaliziSuccess(state, action: PayloadAction<PivotAnaliziData>) {
            state.data = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchPivotAnaliziFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchPivotAnaliziStart,
    fetchPivotAnaliziSuccess,
    fetchPivotAnaliziFailure,
} = pivotAnaliziSlice.actions;

export default pivotAnaliziSlice.reducer;
