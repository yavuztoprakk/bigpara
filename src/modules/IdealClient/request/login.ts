import { SEP1 } from "../constants";
import { Platform } from "react-native";

export default function (
    username: string,
    password: string,
    sessionId: string,
    Authorized: string,
    leng: string,
    demo: boolean
): string {
    const platform = Platform.OS === "ios" ? "IOS" : Platform.OS === "android" ? "ANDROID" : Platform.OS;
    if (demo) {
        return `X${SEP1}CON${SEP1}${username}${SEP1}${password}${SEP1}${sessionId}${SEP1}MOBILE${SEP1}${platform}${SEP1}bp${SEP1}${Authorized}${SEP1}${leng}`;
    }
    return `X${SEP1}CON${SEP1}${username}${SEP1}${password}${SEP1}${sessionId}${SEP1}MOBILE${SEP1}${platform}${SEP1}bp${SEP1}${Authorized}${SEP1}${leng}`;

    //return `X${SEP1}REQ_CON${SEP1}${username}${SEP1}${password}${SEP1}${sessionId}${SEP1}WEB${SEP1}ANY${SEP1}1${SEP1}1${SEP1}${leng}${SEP1}`;
}

