import { SEP1 } from "../constants";

export default function (
    username: string,
    password: string,
    sessionId: string,
    sembol: string
): string {
    return `X${SEP1}REQ_TEMETTU_TAKVIM${SEP1}${username}${SEP1}${sessionId}${SEP1}${sembol}${SEP1}`;
}