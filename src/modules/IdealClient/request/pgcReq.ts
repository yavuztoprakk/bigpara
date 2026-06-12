import { SEP1 } from "../constants";

export default function (
    username: string,
    password: string,
    sessionId: string,
): string {
    return `X${SEP1}REQ_PGC2${SEP1}${username}${SEP1}${sessionId}`;
}
