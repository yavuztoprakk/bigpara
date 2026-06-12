import { SEP1 } from "../constants";

export default function (
	username: string,
	password: string,
	sessionId: string
): string {

	return `X${SEP1}REQ_INDEX_SYMBOLS${SEP1}${username}${SEP1}${sessionId}${SEP1}XK050${SEP1}`;
}
