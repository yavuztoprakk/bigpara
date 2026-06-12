import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { summaryTables } from '../FintablesClient';
import flashMessage from '../flashMessage';

export interface ScoreRow {
    label: string;
    value: boolean;
    type: string;
}

export interface ScoreSummary {
    title: string;
    value: number;
    rows: ScoreRow[];
}

export interface SummaryRow {
    title: string;
    value: number;
}

export interface BarData {
    title: string;
    values: number[];
    labels: string[];
}

export interface Summary {
    data?: {
        multiples: SummaryRow[];
        income: {
            period: string;
            data: SummaryRow[];
        };
        balance: {
            period: string;
            data: SummaryRow[];
        };
        scores?: ScoreSummary[];
        bars?: BarData[];
        info?: SummaryRow[];
    };
    loading: boolean;
    error?: any;
}

export type SummaryMap = {
    [code: string]: Summary;
};

const initialState: SummaryMap = {};

const initialSummary: Summary = {
    data: null,
    loading: false,
    error: null,
};

export const loadSummary = createAsyncThunk(
    'summary/load',
    async (code: string, { rejectWithValue }) => {
        try {
            const res = await summaryTables(code);
            const incomeData = res.data[0].columns[0].data;
            const balanceData = res.data[0].columns[1].data;
            const multiplesData = res.data[2].columns[0].data;

            const income = {
                period: `${incomeData.periods[0].year}/${incomeData.periods[0].month}`,
                data: incomeData.values.map((row: { title: any; values: any[]; }) => ({
                    title: row.title,
                    value: row.values[0],
                })),
            };

            const balance = {
                period: `${balanceData.periods[0].year}/${balanceData.periods[0].month}`,
                data: balanceData.values.map((row: { title: any; values: any[]; }) => ({
                    title: row.title,
                    value: row.values[0],
                })),
            };

            const multiples = multiplesData.map((row: { label: any; value: any; }) => ({
                title: row.label,
                value: row.value,
            }));

            const scores: ScoreSummary[] =
                res.data[5] &&
                res.data[5].columns.map((col: { title: any; data: { filter: (arg0: (a: any) => boolean) => { (): any; new(): any; length: any; }; }; }) => ({
                    title: col.title,
                    value: col.data.filter((a) => a.value === true).length,
                    rows: col.data,
                }));

            const info: SummaryRow[] = res.data.find(
                (row: { type: string; }) => row.type === 'meta'
            )?.data;

            const bars: BarData[] =
                res.data[1] &&
                res.data[1].columns[0].type === 'bar' &&
                res.data[1].columns.map((col: { title: any; data: { values: any; periods: any[]; }; }) => ({
                    title: col.title,
                    values: col.data.values,
                    labels: col.data.periods.map(
                        (p) => `${p.year}/${p.month}`
                    ),
                }));

            return {
                income,
                balance,
                multiples,
                scores,
                bars,
                info,
            };
        } catch (e: any) {
            flashMessage({
                type: 'danger',
                message: 'Temel analiz verilerini alırken bir hata oluştu.',
            });
            return rejectWithValue(e.toString().message);
        }
    }
);

const summarySlice = createSlice({
    name: 'summary',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadSummary.pending, (state, action) => {
                state[action.meta.arg] = {
                    ...initialSummary,
                    loading: true,
                };
            })
            .addCase(loadSummary.fulfilled, (state, action) => {
                state[action.meta.arg] = {
                    ...state[action.meta.arg],
                    loading: false,
                    data: action.payload,
                };
            })
            .addCase(loadSummary.rejected, (state, action) => {
                state[action.meta.arg] = {
                    ...state[action.meta.arg],
                    loading: false,
                    error: action.payload,
                };
            });
    },
});

export const summarySelector = createSelector(
    (state: any) => state.fundamentals.summaries, // Doğrudan summaries reducer'ını seçiyoruz
    (_: any, code: string) => code,
    (summaries, code) => {
        const selectedSummary = summaries[code];
        return selectedSummary || initialSummary;
    }
);

export default summarySlice.reducer;
