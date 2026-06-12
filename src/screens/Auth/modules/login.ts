import { resetLogin, login, loginFail, loginSuccess } from "./auth";
import flashMessage from "../../../modules/flashMessage";
import { User } from "./auth";
import { AppDispatch } from "../../../store";
import { persistToken } from "../../../modules/pushNotifications";

// reset işlevi
export function reset() {
  return (dispatch: AppDispatch) => {
    dispatch(resetLogin());
  };
}


// login işlevi
export function initiateLogin(remember: boolean, demo: boolean = false) {
  return (dispatch: AppDispatch) => {
    dispatch(login({ remember, demo }));
  };
}

// loginFail işlevi
export function handleLoginFail(message: string) {
  return (dispatch: AppDispatch) => {
    flashMessage({
      message,
      type: "danger",
    });
    dispatch(loginFail());
  };
}

// loginSuccess işlevi
export function handleLoginSuccess(user: User) {
  return (dispatch: AppDispatch) => {
    dispatch(loginSuccess(user));
    try {
      // `persistToken` thunk'ını çağır
      // console.log("persistToken=>=>=>=>=>=>=> ", user,persistToken);
      console.log("[PUSH-DEBUG] login.ts handleLoginSuccess => tokenUsername:", user.username);
      dispatch(persistToken({ clear: false, tokenUsername: user.username }));
    } catch (error: any) {
      console.error("Token kaydedilirken hata oluştu:", error.toString());
    }

  };
}
