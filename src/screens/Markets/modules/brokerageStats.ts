import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// Tip tanımları
export interface BrokerageStatsRow {
	title: string;
	lot: number;
	percentage: number;
	price: number;
}

export interface BrokerageStats {
	date: string;
	rows: BrokerageStatsRow[];
}

export type BrokerageStatsMap = {
	[code: string]: {
		[type: string]: BrokerageStats;
	};
};

// Başlangıç durumu
const initialState: BrokerageStatsMap = {};

// createSlice ile slice oluşturma
const brokerageStatsSlice = createSlice({
	name: 'brokerageStats',
	initialState,
	reducers: {
		update: (
			state,
			action: PayloadAction<{ code: string; type: string; stats: BrokerageStats }>
		) => {
			const { code, type, stats } = action.payload;

			// Önceki ve yeni lot değerlerini karşılaştırma
			if (
				state[code]?.[type]?.rows[0]?.lot === stats.rows[0]?.lot
			) {
				return; // Değişiklik yoksa state'i aynı bırak
			}

			// Yeni veriyi ekle veya güncelle
			if (!state[code]) {
				state[code] = {};
			}
			state[code][type] = stats;
		},
	},
});

// Actions ve reducer'ı export etme
export const { update } = brokerageStatsSlice.actions;
export default brokerageStatsSlice.reducer;

// Selector
export const brokerageStatsSelector = createSelector(
	(state: any): BrokerageStatsMap => state.brokerageStats,
	(_, code) => code,
	(stats, code) => stats[code]
);
