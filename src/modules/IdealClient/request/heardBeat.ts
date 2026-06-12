import { SEP1 } from "../constants";

export default function (
    username: string,
    password: string,
    sessionId: string,
    versionApp: string,
): string {
    return `X${SEP1}HB${SEP1}${username}${SEP1}${sessionId}${SEP1}${versionApp}`;
}
