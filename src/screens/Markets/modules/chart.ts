import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";

export interface DetailChartPreferences {
    period: string;
    count: number;
}

export interface ChartDataPoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number; // Eksikse, bu alanı ekleyebilirsiniz
}

export type ChartPeriodMap = {
    [period: string]: ChartDataPoint[];
};

export type ChartMap = {
    [code: string]: ChartPeriodMap;
};

// Initial State
const initialState: ChartMap = {};

// Slice
const chartSlice = createSlice({
    name: "chart",
    initialState,
    reducers: {
        updateChart(state, action: PayloadAction<{ code: string; period: string; data: ChartDataPoint[] }>) {
            const { code, period, data } = action.payload;
            if (!state[code]) {
                state[code] = {};
            }
            state[code][period] = data;
        },
        // Ekstra bir reducer ile `DetailChartPreferences` güncellemesini yönetin
        updateChartPreferences(state: any, action: PayloadAction<DetailChartPreferences>) {
            const { period, count } = action.payload;
            state.period = period;
            state.count = count;
        }
    },
});

// Actions
export const { updateChart, updateChartPreferences } = chartSlice.actions;

// Selectors
export const chartSelector = createSelector(
    (state: { chart: ChartMap }) => state.chart,
    (_: any, code: string) => code,
    (_: any, _code: string, period: string) => period,
    (_: any, _code: string, _period: string, count: number) => count,
    (_: any, _code: string, _period: string, _count: number, type: keyof ChartDataPoint) => type,
    (chart, code, period, count, col) =>
        chart[code]?.[period]?.slice(-count).map((d) => (col ? d[col] : d)) ?? []
);

// Reducer
export default chartSlice.reducer;
