import { SEP1 } from "../constants";

export default function (
    username: string,
    password: string,
    sessionId: string,
    composite: string,
    interval: string
): string {
    return `X${SEP1}REQ_KDM2${SEP1}${username}${SEP1}${composite}${SEP1}${interval}`;
}
