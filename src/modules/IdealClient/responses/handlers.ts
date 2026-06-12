import { AppDispatch, RootState } from "../../../store";
import { SEP1 } from "../constants";
import { handleLoginFail, handleLoginSuccess } from "../../../screens/Auth/modules/login";
import { logout, request } from "..";
import bruttakas from "../request/bruttakas";

export const handleConnectionError = (
    store: { dispatch: AppDispatch; getState: () => RootState },
    message: string,
    ws: any,
) => {
    const [error] = message.split(SEP1);
    logout();
    store.dispatch(handleLoginFail(error));
};

export const loginSuccess = (
    store: { dispatch: AppDispatch; getState: () => RootState },
    message: string,
    username: string,
    password: string,
) => {
    const [_, strLicences] = message.split(SEP1);
    const licences = strLicences.split("|"); //["IMKBX", "IMKBL1P", "PITE", "PIT", "COMEX"];
    const mlResults = licences
        .filter((item) => item.startsWith("ML"))
        .flatMap((item) => {
            if (item.includes(";")) {
                const withoutML = item.replace(/^ML/, "");
                return withoutML.split(";");
            }
            return item === "ML" ? [] : [item.replace(/^ML/, "")];
        });
    const updatedLicences = licences.filter((item) => !item.startsWith("ML"));
    const finalLicences = [...updatedLicences, ...mlResults];

    store.dispatch(
        handleLoginSuccess({ username, password, licences: finalLicences })
    );
    const brutLength = store.getState().markets?.lists?.lists?.bruttakas?.length;
    if (brutLength <= 0 || brutLength === undefined) {
        request(bruttakas);
 
    }};
