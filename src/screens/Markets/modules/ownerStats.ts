import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

// 🎯 OwnerStatsRow, OwnerStats ve OwnerStatsMap Tipleri
export interface OwnerStatsRow {
	title: string;
	lot: number;
	percentage: number;
}

export interface OwnerStats {
	date: string;
	total: string;
	rows: OwnerStatsRow[];
}

export type OwnerStatsMap = {
	[code: string]: OwnerStats;
};

// 📌 Başlangıç Durumu
const initialState: OwnerStatsMap = {};

// 🔥 Redux Toolkit Slice Tanımı
const ownerStatsSlice = createSlice({
	name: "ownerStats",
	initialState,
	reducers: {
		update: (
			state,
			action: PayloadAction<{ code: string; stats: OwnerStats }>
		) => {
			const { code, stats } = action.payload;

			// Eğer önceki state boş veya lot değerleri değişmişse, state'i güncelle
			if (
				!state[code] ||
				state[code].rows.length === 0 ||
				stats.rows.length === 0 ||
				state[code].rows[0].lot !== stats.rows[0].lot
			) {
				state[code] = stats;
			}
		},
	},
});

// 🚀 Actions ve Reducer'ı Export Etme
export const { update } = ownerStatsSlice.actions;
export default ownerStatsSlice.reducer;

// 🔎 Selector: Varsayılan boş obje döndürerek hata önleme
export const ownerStatsSelector = createSelector(
	(state: any): OwnerStatsMap => state.ownerStats || {},
	(_, code: string) => code,
	(stats, code) => stats[code] || { date: "", total: "", rows: [] }
);
