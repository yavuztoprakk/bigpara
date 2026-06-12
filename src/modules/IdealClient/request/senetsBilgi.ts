import { SEP1 } from "../constants";

export default function (
    username: string,
    password: string,
    sessionId: string,
    prefix: string,
    seri: string
): string {
    return `X${SEP1}REQ_SENETS_BILGI${SEP1}${username}${SEP1}${sessionId}${SEP1}${prefix}${SEP1}${seri}${SEP1}`;
}
