import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import flashMessage from "../../../modules/flashMessage";
import { loadAlarms } from "../../Alarms/modules/list";
import { close, open as openBottomSheet } from "../../../modules/bottomSheet";
import { saveAlarm } from "../../../modules/FintablesClient";
import { Alert, Linking, Platform } from "react-native";
import store from "../../../store";
import { symbolSelector } from "../../Markets/modules/symbols";
import messaging from "@react-native-firebase/messaging";
import { persistToken, updateToken } from "../../../modules/pushNotifications";

// Async Thunks
export const open = createAsyncThunk(
  "alarmsCreate/open",
  async (payload: any, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as any;
    const symbol = symbolSelector(state, payload.code);
    const isDemo = state.auth.demo;
    const activeUser = state.auth?.user?.username;

    if (isDemo) {
      flashMessage({
        type: "danger",
        message:
          "Alarm kurmak için Müşteri Girişi yapmanız gerekmektedir. Hemen şimdi hesap açmak için tıklayın!",
      });
      return;
    }

    if (payload?.code && !symbol) {
      return rejectWithValue("Geçersiz sembol.");
    }

    // Bildirim izni kontrolu; izin yoksa kullaniciyi ayarlara yonlendir
    const requestPermissionsControl = async () => {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        dispatch(openBottomSheet({ type: "alarmsCreate" }));
        return;
      }

      flashMessage({
        type: "danger",
        message:
          "Bildirimlerinizi almak için lütfen cihaz ayarlarınızdan Bigpara uygulamasına bildirim izni verin.",
        duration: 3000,
      });

      setTimeout(() => {
        Alert.alert(
          "Bildirimler Kapalı",
          "Bildirimleri almak için 'Ayarlar'ı açarak Bigpara uygulamasına bildirim izni verin.",
          [
            { text: "İptal", style: "cancel" },
            {
              text: "Ayarlar",
              onPress: async () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }

                const checkPermissionAfterSettings = async () => {
                  const newAuthStatus = await messaging().hasPermission();
                  const newEnabled =
                    newAuthStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    newAuthStatus === messaging.AuthorizationStatus.PROVISIONAL;

                  if (newEnabled) {
                    const token = await messaging().getToken();
                    if (
                      token &&
                      store.getState()?.pushNotifications?.token?.data !== token
                    ) {
                      store.dispatch(updateToken({ data: token }));
                    }
                    await store.dispatch(
                      persistToken({ clear: false, tokenUsername: activeUser })
                    );
                    flashMessage({
                      type: "success",
                      message: "Bildirim izni başarıyla alındı.",
                    });
                  } else {
                    await store.dispatch(
                      persistToken({ clear: false, tokenUsername: activeUser })
                    );
                    flashMessage({
                      type: "danger",
                      message: "Bildirim izni verilmedi.",
                    });
                  }
                };

                setTimeout(checkPermissionAfterSettings, 3000);
              },
            },
          ]
        );
      }, 3000);
    };

    await requestPermissionsControl();
    return payload;
  }
);

export const save = createAsyncThunk(
  "alarmsCreate/save",
  async (values: any, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as any; // Redux store türünüze göre düzenleyin
    const { auth } = state;

    try {
      console.log("[PUSH-DEBUG] AlarmsCreate saveAlarm => ideal_username:", auth.user.username);
      await saveAlarm({
        ...values,
        ideal_username: auth.user.username,
        wl: "bigpara",
      });

      flashMessage({
        type: "success",
        message: "Alarmınız başarıyla kaydedildi.",
      });

      dispatch(loadAlarms());
      dispatch(close());
      return true;
    } catch (e: any) {
      let message = "Alarm kaydedilirken bir hata oluştu.";
      try {
        const data = e.response.data;
        message = data[Object.keys(data)[0]][0];
      } catch { }

      flashMessage({
        duration: 10000,
        type: "danger",
        message,
      });

      return rejectWithValue(message);
    }
  }
);

// Slice
const alarmsCreateSlice = createSlice({
  name: "create",
  initialState: {
    code: null,
    source: null,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Open
      .addCase(open.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      })
      .addCase(open.rejected, (state: any, action) => {
        state.error = action.payload;
      })
      // Save
      .addCase(save.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(save.fulfilled, (state) => {
        state.saving = false;
        state.error = null;
      })
      .addCase(save.rejected, (state: any, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

// Reducer
export default alarmsCreateSlice.reducer;
