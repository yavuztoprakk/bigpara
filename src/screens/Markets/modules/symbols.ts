import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import symbolCenter from "../../../modules/SymbolCenter";

export interface Symbol {
    code: string;
    composite: string;
    prefix: string;
    decPoint: number;
    seriNo: string;
    indexType: string;
    subMarket: string;
    group: string;
    original: string;
    canBeTraded: boolean;
    isBrutTakas: boolean;
}

export type SymbolMap = {
    [code: string]: Symbol;
};

const initialState: SymbolMap = {};


const symbolsSlice = createSlice({
    name: "symbols",
    initialState,
    reducers: {
        init: (state, action: PayloadAction<SymbolMap>) => {
            const newState = action.payload;
            return newState;
        },
        updateSymbols: (state, action: PayloadAction<SymbolMap>) => {
            symbolCenter.dispatch(action.payload);
            const updatedState = { ...state, ...action.payload };
            return updatedState;

        },
    },
});

export const { init, updateSymbols } = symbolsSlice.actions;

export const symbolSelector = createSelector(
    (state: any, code: string) => state.symbols,
    (_, code: string) => code,
    (symbols, code) => symbols[code]
);

export const codeSearchSelector = createSelector(
    (state: any) => state.symbols,
    (state: any) => state.ui.search.query.trim(),
    (symbols, query) =>
        query.length < 2
            ? []
            : Object.keys(symbols)
                .filter((code: any) => code?.toUpperCase().startsWith(query?.toUpperCase()))
                .sort()
);

export default symbolsSlice.reducer;
