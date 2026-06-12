import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Brokerage {
    code: any;
    value: any;
    toUpperCase: any;
    includes: any;
    startsWith: any;
    total: any;
}

export type BrokerageList = Brokerage[];

const initialState: BrokerageList = [];

const symbolBrokeragesSlice = createSlice({
    name: "symbolBrokerages",
    initialState,
    reducers: {
        update: (state, action: PayloadAction<BrokerageList>) => {
            return action.payload;
        },
    },
});

export const { update } = symbolBrokeragesSlice.actions;
export default symbolBrokeragesSlice.reducer;
