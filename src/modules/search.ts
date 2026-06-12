import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
	query: string;
}

const initialState: SearchState = {
	query: "",
};

const searchSlice = createSlice({
	name: 'search',
	initialState,
	reducers: {
		changeQuery: (state, action: PayloadAction<string>) => {
			state.query = action.payload;
		},
	},
});

export const { changeQuery } = searchSlice.actions;
export default searchSlice.reducer;
