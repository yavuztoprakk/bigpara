import { SEP1 } from "../constants";

export default function (
	username: string,
	password: string,
	sessionId: string
): string {
	return `X${SEP1}REQ_BIST_DEVRE${SEP1}${username}${SEP1}${sessionId}`;
}
