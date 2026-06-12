import { createSlice, createSelector } from "@reduxjs/toolkit";
const numeral = require("numeral");

// Initial state type definition
export interface Level {
	lot: string;
	price: string;
	count: string;
}

export type OrderBookMap = {
	[code: string]: Level;
};

// Initial state
const initialState: OrderBookMap = {};

// Redux slice for order book
const orderBookSlice = createSlice({
	name: "orderBook",
	initialState,
	reducers: {
		initOrderBook: (state, action) => {
			return { ...state, ...action.payload.levels };
		},
		updateOrderBookLevel: (state, action) => {
			const { code, side, row, price, lot, count } = action.payload;
			state[`${code}${side}${row}`] = { lot, price, count };
		},
	},
});

// Exporting actions
export const { initOrderBook, updateOrderBookLevel } = orderBookSlice.actions;

// Reducer export
export default orderBookSlice.reducer;

// Selector
export const levelSelector = createSelector(
	(state: any): OrderBookMap => state.books,
	(_, symbol) => symbol,
	(_1, _2, side) => side,
	(_1, _2, _3, row) => row,
	(_1, _2, _3, _4, aggregate) => aggregate,
	(books, symbol, side, row, aggregate) => {
		const { original, decPoint } = symbol;

		if (aggregate === true) {
			let totalLot = 0;
			let totalPrice = 0;

			for (let i = 0; i < row; i++) {
				const book = books[`${original}${side}${i}`];
				if (book) {
					const lotValue = parseInt(book.lot.replace(/,/g, ""));
					totalLot += lotValue;
					totalPrice += lotValue * parseFloat(book.price);
				}
			}

			const wavgPrice = totalLot > 0 ? totalPrice / totalLot : 0;

			return {
				lot:
					totalLot > 0
						? numeral(totalLot)
							.format("0,0")
							.toString()
							.replace(".", ",")
						: "",
				price:
					totalLot > 0
						? numeral(wavgPrice)
							.format(
								decPoint === 4
									? "0.0000"
									: decPoint === 3
										? "0.000"
										: "0.00"
							)
							.toString()
							.replace(",", ".")
						: "",
			};
		} else {
			return books[`${original}${side}${row}`];
		}
	}
);

