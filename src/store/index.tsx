import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer";
import { persistReducer, persistStore } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Persist config - auth verisi reducer seviyesinde SecureStore ile şifreleniyor (bkz. reducer.ts)
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: [
    "auth",
    "preferences",
    "logs",
    "watchLists",
    "yatirimlar",
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
