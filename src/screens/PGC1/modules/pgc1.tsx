import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Brokerage {
    pgc: string;
    alısToplam: string;
    satısToplam: string;
    oran: string;
    tl: string;
    tlalıstoplam: string;
    tlsatıstoplam: string;
    tloran: string;
}

export type BrokerageList1 = Brokerage[];

const initialState: BrokerageList1 = [];  // Başlangıç durumu boş array olarak tanımlanmalı

const pgc1Slice = createSlice({
    name: "pgc1Brokerages",
    initialState,
    reducers: {
        update(state, action: PayloadAction<BrokerageList1>) {
            return action.payload;
        },
    },
});

export const { update } = pgc1Slice.actions;

export default pgc1Slice.reducer;
