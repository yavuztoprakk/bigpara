import { SEP1 } from "../constants";

export default function (
    username: string,
    password: string,
    sessionId: string,
    sembol: string,
    periyot: string,
    p1: string
): string {
    return `X${SEP1}REQ_PARAM_NE_OLDU${SEP1}${username}${SEP1}${sessionId}${SEP1}${sembol}${SEP1}${periyot}${SEP1}${p1}`;
}
