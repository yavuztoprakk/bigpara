import { SEP1 } from "../constants";

export default function (
    username: string,
    password: string,
    sessionId: string,
    sayfabilgi: string,
    sembolbilgileri: string,
): string {
    return `X${SEP1}REQ_SEMBOL_LIST${SEP1}${username}${SEP1}${sessionId}${SEP1}${sayfabilgi}${SEP1}${sembolbilgileri}`;
}
