import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import flashMessage from "./flashMessage";
import { sendLogs } from "./FintablesClient";

const XDate = require("xdate");

export const todayKey = () => new XDate().toString("yyyyMMdd");

// Async thunk for submitting the survey
export const submitSurvey = createAsyncThunk(
	"survey/submitSurvey",
	async (emoji: string, { getState, rejectWithValue }) => {
		try {
			const username = (getState() as any).auth.user.username;
			await sendLogs(username, JSON.stringify({ type: "survey", value: emoji }));
			flashMessage({
				type: "success",
				message: "Katıldığınız için teşekkür ederiz.",
			});
		} catch (error) {
			console.error(error);
			return rejectWithValue(error);
		}
	}
);

interface SurveyState {
	lastSubmitted: string | null;
}

const initialState: SurveyState = {
	lastSubmitted: null,
};

const surveySlice = createSlice({
	name: "survey",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(submitSurvey.fulfilled, (state) => {
			state.lastSubmitted = todayKey();
		});
	},
});

export default surveySlice.reducer;
