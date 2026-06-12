import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteDeviceToken, updateDeviceToken } from "./FintablesClient";

// Async Thunks
export const persistToken = createAsyncThunk(
	"pushNotifications/persistToken",
	async ({ clear = false, tokenUsername }: { clear?: boolean; tokenUsername: string }, { getState, rejectWithValue }) => {
		const TOKEN_STORAGE_KEY = "last-stored-token";
		const { pushNotifications, auth, preferences } = getState() as any;
		const { token } = pushNotifications;
		const { user } = auth;

		console.log("[PUSH-DEBUG] persistToken çağrıldı => tokenUsername:", tokenUsername, "| clear:", clear, "| auth.user.username:", user?.username);

		try {
			if (clear) {
				// Tokenı temizleme işlemi
				console.log("[PUSH-DEBUG] Token temizleniyor => tokenUsername:", tokenUsername);
				await deleteDeviceToken(token);
				await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
				console.log("token temizlendi", TOKEN_STORAGE_KEY);
			} else if (token && token?.data) {
				const licences = JSON.stringify([
					...user.licences,
					...(preferences.executionPush !== false ? ["EXPUSH"] : []),
				]);
				const lastStoredToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
				const cacheValue = token.data + licences?.length + tokenUsername;

				if (lastStoredToken === cacheValue) {
					return; // Token aynı, işlem yapma
				}
				console.log("[PUSH-DEBUG] updateDeviceToken'a gönderilen tokenUsername:", tokenUsername);
			await updateDeviceToken(tokenUsername, token, licences);
				await AsyncStorage.setItem(TOKEN_STORAGE_KEY, cacheValue);
			}
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Slice
const pushNotificationsSlice = createSlice({
	name: "pushNotifications",
	initialState: {
		token: null,
		lastNotification: null,
		status: "idle", // loading, succeeded, failed
		error: null,
	},
	reducers: {
		updateToken: (state, action) => {
			state.token = action.payload;
		},
		updateLastNotification: (state, action) => {
			state.lastNotification = action.payload;
		},
		updateLastShownMessageId: (state, action) => {
			state.lastMessageIdShown = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(persistToken.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(persistToken.fulfilled, (state) => {
				state.status = "succeeded";
			})
			.addCase(persistToken.rejected, (state: any, action) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

// Actions
export const { updateToken, updateLastNotification, updateLastShownMessageId } =
	pushNotificationsSlice.actions;

// Reducer
export default pushNotificationsSlice.reducer;