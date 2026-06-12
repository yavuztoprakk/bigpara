import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import priceCenter from "../../../modules/PriceCenter";
import { Symbol } from "./symbols";

export const PRICES_UPDATE = "PRICES_UPDATE";

export interface Price {
	updatedAt?: number;
	lastPrice?: number;
	dayClose?: number;
	ask?: number;
	bid?: number;
	changePercent?: number;
	equilibriumChangePercent?: number;
	K?: number;
}

export type PriceMap = {
	[code: string]: Price;
};

const initialState: PriceMap = {};

const pricesSlice = createSlice({
	name: "prices",
	initialState,
	reducers: {
		update: (state, action: PayloadAction<PriceMap>) => {
			priceCenter.dispatch(action.payload);
			return { ...state, ...action.payload };
		},
	},
});

export const { update } = pricesSlice.actions;

export default pricesSlice.reducer;

export const selectPrices = (state: any) => state.prices;

export const formatPrice = (price: number, symbol: Symbol, selectedList?: string) => {
	if (price === undefined || isNaN(price) || price === 0) {
		return "";
	}
	// Eğer selectedList "yurtdisi" ise fiyatı iki ondalık göster
	if (selectedList === "yurtdisi") {
		if (price < 1) {
			return price;
		} else if (price > 0) {
			return price.toFixed(2);
		} else if (price > 100) {
			return price.toFixed(3);
		} else {
			return price.toFixed(symbol?.decPoint || 2);
		}
	}
	return price.toFixed(symbol?.decPoint || 2);
};

export const calcChangePercent = (price: Price) => {
	const { lastPrice, dayClose } = price;
	if (lastPrice > 0 && dayClose > 0) {
		return (100 * (lastPrice - dayClose)) / dayClose;
	} else {
		return 0;
	}
};

export const calcEquilibriumChangePercent = (price: Price) => {
	const { K, lastPrice } = price;
	if (K > 0 && lastPrice > 0) {
		return (100 * (K - lastPrice)) / lastPrice;
	} else {
		return 0;
	}
};

export const changeColor = (val: number, theme: any): string => {
	return isNaN(val) || val === 0
		? theme.primaryText
		: val > 0
			? theme.green
			: theme.red;
};
export const changeColorStats = (val: number, theme: any): string => {
	return isNaN(val) || val === 0
		? theme.primaryText
		: val > 0
			? theme.green
			: theme.red;
};

export const changeColorSquare = (val: number) => {
	if (isNaN(val) || (val < 0.1 && val > -0.1)) {
		return "gray";
	}
	if (val >= 0.1 && val < 1.5) {
		return "#5aa313";
	}
	if (val >= 1.5 && val < 5) {
		return "#418d11";
	}
	if (val >= 5) {
		return "#085a0d";
	}
	if (val <= -0.1 && val > -1.5) {
		return "#b30001";
	}
	if (val <= -1.5 && val > -5) {
		return "#810100";
	}
	if (val <= -5) {
		return "#4e0001";
	}
};

export const formatLot = (val: string): string =>
	Number(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

