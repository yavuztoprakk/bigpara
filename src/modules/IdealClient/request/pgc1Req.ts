import { SEP1 } from "../constants";

export default function (
    username: string,
    password: string,
    sessionId: string,
    sembolValue: string,
): string {
    return `X${SEP1}REQ_PGC1${SEP1}${username}${SEP1}${sessionId}${SEP1}${sembolValue}`;
}
