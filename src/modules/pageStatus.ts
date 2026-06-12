import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Brokerage {
    page: string;
    code: string;
}

export type BrokerageList = Brokerage[];

const initialState: BrokerageList = [];

const pageLastBrokeragesSlice = createSlice({
    name: "pageLastBrokerages",
    initialState,
    reducers: {
        updatePageLastBrokerages: (state, action: PayloadAction<BrokerageList>) => {
            return action.payload;
        },
    },
});

// Actions ve reducer'ı dışa aktar
export const { updatePageLastBrokerages } = pageLastBrokeragesSlice.actions;
export default pageLastBrokeragesSlice.reducer;
