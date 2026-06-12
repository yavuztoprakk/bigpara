import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { sheets } from "../FintablesClient";
import flashMessage from "../flashMessage";
import { Column } from "../../components/Table/Table";
const numeral = require("numeral");

const hashPeriod = ({ month, year }) => `${month}${year}`;

const prepareData = (raw: { periods: { year: any; month: any; }[]; rows: { label: any; values: any[]; }[]; }) => {
	let columns: Column[] = [
		{
			title: "Kalem",
			valueKey: "label",
			width: 250,
			textAlign: "left",
		},
	];

	let periodHashes = [];

	// Limiting periods to 7 for performance
	raw.periods.slice(0, 7).forEach((period: { year: any; month: any; }) => {
		const hashedPeriod = hashPeriod(period);

		periodHashes.push(hashedPeriod);
		columns.push({
			title: `${period.year}/${period.month}`,
			valueKey: hashedPeriod,
			width: 120,
			textAlign: "right",
		});
	});

	let data = raw.rows.map((row: { label: any; values: any[]; }) => {
		const rowData = {
			label: row.label,
		};

		periodHashes.forEach((hash, i) => {
			rowData[hash] =
				row.values[i] === null
					? ""
					: numeral(row.values[i]).format("0.00 a").toString();
		});

		return rowData;
	});

	return { data, columns };
};

// Async thunk for loading sheets data
export const fetchSheets = createAsyncThunk(
	"sheets/fetchSheets",
	async (code: string, { rejectWithValue }) => {
		try {
			const res = await sheets(code);
			return {
				code,
				balance: prepareData(res.data.balance),
				income: prepareData(res.data.income),
			};
		} catch (error) {
			flashMessage({
				type: "danger",
				message: "Finansal tablolar yüklenirken bir hata oluştu.",
			});
			return rejectWithValue(error);
		}
	}
);

// Initial state
const initialState = {
	code: null as string | null,
	data: null as { balance: any; income: any } | null,
	loading: false,
	error: null as string | null,
};

// Slice
const sheetsSlice = createSlice({
	name: "sheets",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSheets.pending, (state) => {
				state.loading = true;
				state.error = null;
				state.data = null;
			})
			.addCase(fetchSheets.fulfilled, (state, action: PayloadAction<any>) => {
				state.loading = false;
				state.code = action.payload.code;
				state.data = {
					balance: action.payload.balance,
					income: action.payload.income,
				};
			})
			.addCase(fetchSheets.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const sheetsSelector = createSelector(
	(state: any) => state.fundamentals.sheets,
	(_: any, code: string) => code,
	(_: any, _2: string, type: string) => type,
	(sheets, code, type) =>
		sheets.code === code && sheets.data && sheets.data[type]
);

export default sheetsSlice.reducer;
