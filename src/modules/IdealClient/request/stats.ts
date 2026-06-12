import { SEP1 } from "../constants";

export default function (
	username: string,
	password: string,
	sessionId: string,
	composite: string
): string {
	return `X${SEP1}REQ_YUZEYSEL3${SEP1}${username}${SEP1}${sessionId}${SEP1}${composite}`;
}
