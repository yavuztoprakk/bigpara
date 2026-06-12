import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// CustodyChangeRow, CustodyChange ve CustodyChangeMap Tipleri
export interface CustodyChangeRow {
	title: string;
	lot: number;
	percentage: number;
}

export interface CustodyChange {
	rows: CustodyChangeRow[];
}

export type CustodyChangeMap = {
	[code: string]: CustodyChange;
};

// Başlangıç durumu
const initialState: CustodyChangeMap = {};

// Slice oluşturma
const custodyChangeSlice = createSlice({
	name: 'custodyChanges',
	initialState,
	reducers: {
		update: (
			state,
			action: PayloadAction<{ code: string; data: CustodyChange }>
		) => {
			const { code, data } = action.payload;

			// Eğer data boşsa veya rows dizisi yoksa güncelleme yapma
			if (!data || !data.rows || data.rows.length === 0) return;

			// Eğer önceki değer ile aynıysa değişiklik yapma
			if (
				state[code]?.rows?.length &&
				state[code].rows[0]?.lot === data.rows[0]?.lot
			) {
				return;
			}

			state[code] = data; // Yeni veriyi güncelle
		},
	},
});

// Actions ve reducer'ı export etme
export const { update } = custodyChangeSlice.actions;
export default custodyChangeSlice.reducer;

// Selector
export const custodyChangeSelector = createSelector(
	(state: any): CustodyChangeMap => state.custodyChanges || {}, // Hata önleme için boş obje döndür
	(_, code) => code,
	(stats, code) => stats[code] || { rows: [] } // Hata önleme için varsayılan değer döndür
);
