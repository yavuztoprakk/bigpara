import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

// Level Tipi
export interface Level {
	price: string;
	lot: string;
	percent: string;
	buy: string;
	sell: string;
}

// Level Haritası
export type LevelsMap = {
	[code: string]: Level[];
};

// Başlangıç Durumu
const initialState: LevelsMap = {};

// Slice Tanımlama
const levelStatsSlice = createSlice({
	name: "levelStats",
	initialState,
	reducers: {
		update: (
			state,
			action: PayloadAction<{ code: string; data: Level[] }>
		) => {
			const { code, data } = action.payload;
			state[code] = data; // Gelen veriyi state'e ekle/güncelle
		},
	},
});

// Actions ve Reducer'ı Export Etme
export const { update } = levelStatsSlice.actions;
export default levelStatsSlice.reducer;

// Selector Tanımlama
export const levelStatsSelector = createSelector(
	(state: any) => state.levelStats || {}, // Eğer state boşsa hata olmaması için {} döndür
	(_, code: string) => code,
	(stats, code) => stats[code] || [] // Hata önleme için varsayılan boş dizi
);
