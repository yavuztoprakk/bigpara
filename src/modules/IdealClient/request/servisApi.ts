import { SEP1 } from "../constants";

export default function (
    username: string,
    _password: string,
    sessionId: string,
    query: string
): string {
    return `X${SEP1}REQ_SERVIS_API${SEP1}${username}${SEP1}${sessionId}${SEP1}${query}${SEP1}`;
}
