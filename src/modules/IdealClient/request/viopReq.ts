import { SEP1 } from "../constants";

export default function (
	username: string,
	password: string,
	sessionId: string,
	kurumKodu: string
): string {
	return `X${SEP1}REQ_VIOP_SYMBOLS${SEP1}${username}${SEP1}${sessionId}${SEP1}${kurumKodu}`;
}