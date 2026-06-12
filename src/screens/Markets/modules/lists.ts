import { createSlice, createSelector } from "@reduxjs/toolkit";

export interface Option {
    value: string;
    title: string;
}


export const listOptions: Option[] = [
    { value: "bist30", title: "BIST 30" },
    //{ value: "xu050", title: "BIST 50" },
    { value: "bist100", title: "BIST 100" },
    { value: "topGainers", title: "Yükselen" },
    { value: "topLosers", title: "Düşen" },
    { value: "varantlar", title: "Varantlar" },
    { value: "topVolume", title: "Hacim" },
    { value: "doviz", title: "Döviz" },
    { value: "endeksler", title: "Endeksler" },
    { value: "kripto", title: "Kripto" },
    { value: "bruttakas", title: "Brüt Takas" },
    { value: "devrekesici", title: "Devre Kesici" },
    { value: "dunyabono", title: "Dünya Bono" },
    { value: "viopaktif", title: "VIOP Aktif" },
    { value: "viopvadeli", title: "VIOP Vadeli" },
    { value: "yurtdisi", title: "Yurt dışı" },
    { value: "anapazar", title: "Ana Pazar" },
    { value: "yildizpazar", title: "Yıldız Pazar" },
    { value: "altpazar", title: "Alt Pazar" },
    /*  { value: "xBank", title: "BIST Banka" },
     { value: "xGida", title: "BIST Gıda" },
     { value: "xuSin", title: "BIST Sınai" },
     //{ value: "xutum", title: "BIST Tüm" },
     { value: "xhold", title: "BIST Holding" },
     { value: "xutek", title: "BIST Teknoloji" },
     { value: "xmana", title: "BIST Metal Ana" },
     //{ value: "xktum", title: "BIST Katılım Tüm" },
     { value: "xk030", title: "BIST Katılım 30" },
     { value: "xk050", title: "BIST Katılım 50" },
     { value: "xk100", title: "BIST Katılım 100" }, */
    //{ value: "xharz", title: "BIST Halka Arz" },
    { value: "BYF", title: "BIST Yatırım Fonları" },
    //{ value: "xarku", title: "BIST Aracı Kurumlar" },
];

export const columnOptions = {
    lastPrice: { title: "Son Fiyat", shortTitle: "Son", value: "lastPrice" },
    bid: { title: "Alış", value: "bid" },
    ask: { title: "Satış", value: "ask" },
    changePercent: {
        title: "Güniçi % Değişim",
        shortTitle: "%G",
        value: "changePercent",
    },
    J: { title: "Yüksek", shortTitle: "Yüks.", value: "J" },
    L: { title: "Düşük", shortTitle: "Düş.", value: "L" },
    dayClose: {
        title: "Önceki Gün Kapanış",
        shortTitle: "Ö.G.Kpn",
        value: "dayClose",
    },
    N: { title: "Tavan", value: "N" },
    O: { title: "Taban", value: "O" },
    D: { title: "Ağırlıklı Ortalama Fiyat", shortTitle: "A.Ort", value: "D" },
    F: { title: "Hacim", value: "F" },
    H: { title: "Lot", value: "H" },
    A: { title: "Son İşlem Lot", shortTitle: "S.İ.Lot", value: "A" },
    B: { title: "Alış Lot", shortTitle: "A.Lot", value: "B" },
    C: { title: "Satış Lot", shortTitle: "S.Lot", value: "C" },
    K: { title: "Denge Fiyatı", shortTitle: "Dng.F.", value: "K" },
    M: { title: "Denge Miktarı", shortTitle: "Dng.M.", value: "M" },
    equilibriumChangePercent: {
        title: "Denge % Değişim",
        shortTitle: "Dng.%",
        value: "equilibriumChangePercent",
    },
    T: { title: "Denge Alışta Kalan Lot", shortTitle: "Dng.B", value: "T" },
    U: { title: "Denge Satışta Kalan Lot", shortTitle: "Dng.A", value: "U" },
    8: { title: "Fiyat Adımı", shortTitle: "Adım", value: "8" },
    R: { title: "F/K", value: "R" },
    S: { title: "PDDD", value: "S" },
};

const initialState = {
    selected: listOptions[0],
    watchlist: [],
    lists: {},
};

const listsSlice = createSlice({
    name: "lists",
    initialState,
    reducers: {
        select: (state, action) => {
            state.selected = listOptions.find(option => option.value === action.payload) || state.selected;
        },
        loadSuccess: (state, action) => {
            state.lists[action.payload.type] = action.payload.codes;
        },
        changeColumns: (state, action) => {
            state.columns = action.payload;
        },
        update: (state, action) => {
            state.lists[action.payload.type] = action.payload.codes;
        },
        logout: () => initialState,
    },
});

export const { select, loadSuccess, changeColumns, update, logout } = listsSlice.actions;

export const listsReducer = listsSlice.reducer;

export const codesSelector = createSelector(
    (state: any) => state.markets.lists,
    (state, type) => type,
    (lists, type) => lists[type] || []
);


export const selectedListCodesSelector = createSelector(
    (state: any) => state.markets.lists,
    (lists) => {
        const selectedListKey = lists.selected.value;
        const selectedCodes = lists.lists[selectedListKey] || []; // Adjusted path to access lists.lists
        return selectedCodes;
    }
);


export default listsReducer;