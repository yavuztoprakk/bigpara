import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "reselect";

export interface YieldStats {
    title: string;
    low: number;
    high: number;
    change: number;
}

export type YieldStatsMap = {
    [code: string]: YieldStats[];
};

interface YieldStatsState {
    yieldStats: YieldStatsMap;
}

const initialState: YieldStatsState = {
    yieldStats: {},
};

const yieldStatsSlice = createSlice({
    name: "yieldStats",
    initialState,
    reducers: {
        updateYieldStats(state, action: PayloadAction<{ code: string; stats: YieldStats[] }>) {
            state.yieldStats[action.payload.code] = action.payload.stats;
        },
    },
});

export const { updateYieldStats } = yieldStatsSlice.actions;

export const yieldStatsReducer = yieldStatsSlice.reducer;

export const yieldStatsSelector = createSelector(
    (state: any): YieldStatsMap => state.yieldStats.yieldStats || {}, // state yapısına dikkat
    (_, code: string) => code,
    (stats, code) => stats[code] || [] // Eğer kod yoksa boş bir array döner
);

export default yieldStatsReducer;
