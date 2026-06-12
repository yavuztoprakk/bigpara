import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Brokerage arayüzü
export interface Brokerage {
    values: string;
}

// BrokerageList türü
export type BrokerageList = Brokerage[];

// Initial state
const initialState: BrokerageList = [];

// Slice oluşturma
const turevlistBrokeragesSlice = createSlice({
    name: "turevlistBrokerages",
    initialState,
    reducers: {
        updateBrokerages(state, action: PayloadAction<BrokerageList>) {
            return action.payload;
        },
        resetBrokerages: () => {
            return initialState;
        }
    },
});

// Eylemler ve azaltıcılar dışa aktarılıyor
export const { updateBrokerages, resetBrokerages } = turevlistBrokeragesSlice.actions;
export default turevlistBrokeragesSlice.reducer;
