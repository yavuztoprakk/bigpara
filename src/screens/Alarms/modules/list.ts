import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import flashMessage from "../../../modules/flashMessage";
import { alarms, deleteAlarmGet } from "../../../modules/FintablesClient";

export interface Alarm {
	id: string;
	source: string;
	params: any;
}

// Async Thunks
export const loadAlarms = createAsyncThunk(
	"alarms/loadAlarms",
	async (_, { getState, rejectWithValue }) => {
		const {
			auth: { user },
		} = getState() as any; // Redux state türüne uygun olarak ayarlayın
		const { username } = user;

		try {
			const alarms1 = await alarms(username);

			return { alarms: alarms1.data };
		} catch (error: any) {
			flashMessage({
				duration: 10000,
				type: "danger",
				message: "Alarmlar yüklenirken bir hata oluştu.",
			});
			return rejectWithValue(error.message);
		}
	}
);

export const deleteAlarm = createAsyncThunk(
	"alarms/deleteAlarm",
	async (alarmId: string, { getState, dispatch, rejectWithValue }) => {
		const {
			auth: { user },
		} = getState() as any; // Redux state türüne uygun olarak ayarlayın
		const { username } = user;
		try {
			await deleteAlarmGet(alarmId?.id, username);
			// Alarmları yeniden yükle
			dispatch(loadAlarms());
		} catch (error: any) {
			flashMessage({
				type: "danger",
				duration: 10000,
				message: "Alarmlar silinirken bir hata oluştu.",
			});
			return rejectWithValue(error.message);
		}
	}
);

// Slice
const listSlice = createSlice({
	name: "alarms",
	initialState: {
		data: null,
		loading: true,
		error: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			// Alarmları Yükleme
			.addCase(loadAlarms.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loadAlarms.fulfilled, (state, action) => {
				state.loading = false;
				state.data = action.payload.alarms;
			})
			.addCase(loadAlarms.rejected, (state: any, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Alarm Silme
			.addCase(deleteAlarm.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteAlarm.rejected, (state: any, action) => {
				state.loading = false;
				state.error = action.payload;
			})
	},
});

// Reducer
export default listSlice.reducer;
