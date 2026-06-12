import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistToken } from "../../../modules/pushNotifications";

// Async Thunk: logout işlemi
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState, dispatch }) => {
    const state = getState() as any;
    const activeUser = state.auth?.user?.username;
    /* try {
    const state: any = getState();
    const lists = state.watchLists.lists;
    const username = state.auth.user?.username;


    if (username && lists) {
      //await syncWatchlists({ username, data: lists });
    }
  } catch (e) {
    console.error(e);
  } */
    try {
      // `persistToken` thunk'ını çağır
      console.log("[PUSH-DEBUG] auth.ts logout => tokenUsername:", activeUser);
      dispatch(persistToken({ clear: true, tokenUsername: activeUser }));
    } catch (error: any) {
      console.error("Token kaydedilirken hata oluştu:", error.toString());
    }
  }
);

// AuthState türünü tanımlama
export interface User {
  username: string;
  password: string;
  licences: string[];
  voltranUserId?: string;
  accessToken?: string;
  refreshToken?: string;
  refreshTokenExpireDate?: string;
  firstName?: string;
  lastName?: string;
  voltranEmail?: string;
}

export type BrokerageCredentialMap = {
  [key: string]: {
    brokerageKey: string;
    credentials: any;
    byPassSMS: boolean;
  };
};

interface AuthState {
  isAuthenticated: boolean;
  user: User;
  brokerageCredentialKeys: string[];
  brokerageCredentials: BrokerageCredentialMap;
  loading: boolean;
  remember: boolean;
  demo: boolean;
}

// İlk durum tanımlama (AuthState türüyle)
const initialState: AuthState = {
  isAuthenticated: false,
  user: {
    username: "",
    password: "",
    licences: [],
  },
  brokerageCredentialKeys: [],
  brokerageCredentials: {},
  loading: false,
  remember: false,
  demo: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetLogin: (state) => {
      state.loading = false;
    },
    login: (state, action: PayloadAction<{ remember: boolean; demo: boolean }>) => {
      state.loading = true;
      state.remember = action.payload.remember;
      state.demo = action.payload.demo;
      console.log("action payload nedşr=> ", action.payload)
    },
    loginFail: () => initialState,
    loginSuccess: (state, action: PayloadAction<User>) => {
      // Merge: WebSocket handler Voltran tokenlarini override etmesin
      state.user = { ...state.user, ...action.payload };
      state.isAuthenticated = true;
    },
    setVoltranTokens: (
      state,
      action: PayloadAction<{
        voltranUserId: string;
        accessToken: string;
        refreshToken: string;
        refreshTokenExpireDate: string;
        firstName: string;
        lastName: string;
        voltranEmail: string;
      }>
    ) => {
      state.user = { ...state.user, ...action.payload };
    },
    addAccount: (
      state,
      action: PayloadAction<{
        account: any;
        credentials: any;
        remember: boolean;
        byPassSMS: boolean;
      }>
    ) => {
      state.demo = false; // Eski kodda base demo=false

      if (!action.payload.remember) {
        return; // `remember` false ise diğer işlemleri yapmadan çıkıyoruz
      }

      const accountId = action.payload.account.id;

      // `brokerageCredentialKeys` içinde `accountId` yoksa ekliyoruz
      if (!state.brokerageCredentialKeys.includes(accountId)) {
        state.brokerageCredentialKeys.push(accountId);
      }

      // `brokerageCredentials` içinde yeni `accountId` bilgilerini ekliyoruz
      state.brokerageCredentials[accountId] = {
        brokerageKey: action.payload.account.brokerage.key,
        credentials: action.payload.credentials,
        byPassSMS: action.payload.byPassSMS,
      };
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      state.brokerageCredentialKeys = state.brokerageCredentialKeys.filter(
        (k) => k !== action.payload
      );
      delete state.brokerageCredentials[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state) => {
      // Logout sonrası tüm state sıfırlanır
      return initialState;
    });
  },
});

// Aksiyonları export etme
export const {
  resetLogin,
  login,
  loginFail,
  loginSuccess,
  setVoltranTokens,
  addAccount,
  removeAccount,
} = authSlice.actions;

// Reducer'ı export etme
export default authSlice.reducer;
