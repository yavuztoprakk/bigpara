import { SEP1 } from "../constants";

export default function (
    username: string,
    password: string,
    sessionId: string,
    sembol: string,
    dataType: string,
    periyot: string
): string {
    return `X${SEP1}REQ_PIVOT_ANALIZI${SEP1}${username}${SEP1}${sessionId}${SEP1}${sembol}${SEP1}${dataType}${SEP1}${periyot}${SEP1}`;
}
