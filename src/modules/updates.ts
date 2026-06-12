import { createSlice } from "@reduxjs/toolkit";
import * as Updates from "expo-updates";
import flashMessage from "./flashMessage";
import store from "../store";

type TriggeredBy = "user" | "auto";

// Async function to check for a new version
export const checkNewVersion = async (
	triggeredBy: TriggeredBy,
	dispatch: Function
) => {
	store.dispatch(setCheckingAvailableUpdates({ value: true, triggeredBy }));
	const update = await Updates.checkForUpdateAsync();
	store.dispatch(setCheckingAvailableUpdates({ value: false, triggeredBy }));
	return update;
};

// Async function to update the app version
export const updateVersion = async (dispatch: Function) => {
	store.dispatch(setUpdateProcessing(true));
	try {
		await Updates.fetchUpdateAsync();
		store.dispatch(setUpdateProcessing(false));
		flashMessage({
			duration: 3000,
			type: "success",
			message:
				"Versiyon güncelleme tamamlandı. Uygulama birkaç saniye içerisinde yeniden başlatılacaktır.",
		});

		setTimeout(() => {
			Updates.reloadAsync();
		}, 3000);
	} catch (error: any) {
		store.dispatch(setUpdateProcessing(false));
		flashMessage({
			duration: 10000,
			type: "danger",
			message: `Versiyon güncelleme sırasında hata oluştu. ${__DEV__ ? "(DEV modda versiyon güncellenemez)" : error.message
				}`,
		});
	}
};

// Update version if a new one is available
export const updateVersionIfAvailable = async (
	triggeredBy: TriggeredBy,
	dispatch: Function
) => {
	const update = await checkNewVersion(triggeredBy, dispatch);

	if (update.isAvailable) {
		await updateVersion(dispatch);
	} else {
		flashMessage({
			type: "info",
			message: "Son sürümü kullanmaktasınız.",
		});
	}
};

// Slice
const initialState = {
	checkingAvailableUpdates: false,
	checkingAvailableUpdatesTriggeredBy: "user" as "user" | "auto",
	updateProcessing: false,
};

const updatesSlice = createSlice({
	name: "updates",
	initialState,
	reducers: {
		setCheckingAvailableUpdates: (state, action) => {
			state.checkingAvailableUpdates = action.payload.value;
			state.checkingAvailableUpdatesTriggeredBy = action.payload.triggeredBy;
		},
		setUpdateProcessing: (state, action) => {
			state.updateProcessing = action.payload;
		},
	},
});

export const { setCheckingAvailableUpdates, setUpdateProcessing } =
	updatesSlice.actions;

export default updatesSlice.reducer;

// Selector
export const selectUpdateState = (state: any) => state.updates;

