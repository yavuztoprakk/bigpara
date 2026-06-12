import { SEP1 } from "../constants";

export default function (
	username: string,
	password: string,
	sessionId: string
): string {
	return `X${SEP1}REQ_BRUT_TAKAS${SEP1}${username}${SEP1}${sessionId}${SEP1}`;
}