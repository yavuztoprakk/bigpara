import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Stats arayüzü
export interface Stats {
    ceiling: string;
    floor: string;
    difference: string;
    high: string;
    low: string;
    wavg: string;
    lot: string;
    volume: string;
    eqPrice: string;
    eqLot: string;
    eqBidRemaining: string;
    eqAskRemaining: string;
    moneyIn: string;
    moneyOut: string;
    moneyTotal: string;
    moneyDifference: string;
    varantUnderlying: string;
    varantDaysUntilExpiration: string;
    varantExpiration: string;
    varantType: string;
    varantExecutionPrice: string;
    varantUnderwriter: string;
    viopOpenPosition: string;
    viopOpenPositionDifference: string;
    viopSettlementPrice: string;
    viopPrevSettlementPrice: string;
    viopTheoreticalPrice: string;
    marketCap: string;
    ownersEquity: string;
    paidInCapital: string;
    outstandingShares: string;
    fk: string;
}

// StatsMap türü
export type StatsMap = {
    [code: string]: Stats;
};

// Başlangıç durumu
const initialState: StatsMap = {};

// createSlice kullanarak slice oluşturma
const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {
        update: (state, action: PayloadAction<{ code: string, stats: Stats }>) => {
            state[action.payload.code] = action.payload.stats;
        },
    },
});


// Selector'lar
export const statsSelector = (state: any, code: string) => state.stats[code];

// Eylemler ve azaltıcılar dışa aktarılıyor
export const { update } = statsSlice.actions;
export default statsSlice.reducer;

