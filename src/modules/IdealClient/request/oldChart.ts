import { SEP1 } from "../constants";

export default function (
    username: string,
    password: string,
    sessionId: string,
    composite: string,
    period: string,
    count: number
): string {
    return `X${SEP1}REQ_CHART${SEP1}${username}${SEP1}${composite}${SEP1}${period}${SEP1}${count}`;
}
