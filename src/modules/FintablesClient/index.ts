import axios from "axios";
import Constants from "expo-constants";
import { WatchLists } from "../../screens/WatchList/modules/watchlists";
import { IDeal_API_KEY } from "@env";

const baseUrl = "https://mobile-api.idealdata.com.tr/";
const token = IDeal_API_KEY;

const getHeaders = () => ({
	Authorization: `Bearer ${token}`,
});

// Şirket özeti alma fonksiyonu
export const summaryTables = async (code: string) => {
	return axios.get(`${baseUrl}companies/${code}/summary/`, {
		headers: getHeaders(),
	});
};

// Şirket meta verisi alma fonksiyonu
export const meta = async (code: string) => {
	return axios.get(`${baseUrl}companies/${code}/meta/`, {
		headers: getHeaders(),
	});
};

// Şirket bilanço verisi alma fonksiyonu
export const sheets = async (code: string) => {
	return axios.get(`${baseUrl}companies/${code}/sheets_formatted/`, {
		headers: getHeaders(),
	});
};

// Takvim verisi alma fonksiyonu
export const calendar = async (params: any) => {
	return axios.get(
		`${baseUrl}macro/calendar/?type=json&params=${encodeURIComponent(
			JSON.stringify(params)
		)}`
	);
};

// Warrants verisini alma fonksiyonu
export const warrants = async () => {
	return axios.get(`${baseUrl}warrants/`);
};

// Alarmları alma fonksiyonu
export const alarms = async (username: string) => {
	console.log("[PUSH-DEBUG] Alarm listesi çekiliyor => ideal_username:", username);
	return axios.get(`${baseUrl}alarms/?ideal_username=${username}&wl=bigpara`);
};

// Alarm silme fonksiyonu
export const deleteAlarmGet = async (id: string, username: string) => {
	console.log("[PUSH-DEBUG] Alarm siliniyor => id:", id, "| ideal_username:", username);
	return axios.delete(
		`${baseUrl}alarms/?id=${id}&ideal_username=${username}`
	);
};

// Alarm kaydetme fonksiyonu
export const saveAlarm = async (params: any) => {
	console.log("[PUSH-DEBUG] Alarm kaydediliyor => ideal_username:", params?.ideal_username, "| params:", JSON.stringify(params));
	return axios.post(`${baseUrl}alarms/`, params);
};

// Cihaz tokenini güncelleme fonksiyonu
export const updateDeviceToken = async (username: string, token: string, licences: string) => {
	console.log("[PUSH-DEBUG] ===== SUNUCUYA TOKEN KAYDI =====");
	console.log("[PUSH-DEBUG] ideal_username:", username);
	console.log("[PUSH-DEBUG] expo_id:", token?.data);
	console.log("[PUSH-DEBUG] licences:", licences);

	if (token && token?.data) {
		const payload = {
			ideal_username: username,
			device: Constants.deviceName,
			expo_id: token?.data,
			wl: "bigpara",
			licences,
		};

		try {
			const res = await axios.post(`${baseUrl}alarms/device-tokens/`, payload);
			console.log("[PUSH-DEBUG] Token kayıt BAŞARILI:", res.data);
			console.log("[PUSH-DEBUG] Gönderilen payload:", JSON.stringify(payload));
		} catch (error: any) {
			console.log("[PUSH-DEBUG] Token kayıt HATA:", error.toString());
		}
	} else {
		console.log("[PUSH-DEBUG] Token boş, sunucuya istek atılmadı");
	}
};

// Cihaz tokenini silme fonksiyonu
export const deleteDeviceToken = async (token: any) => {
	console.log("[PUSH-DEBUG] ===== SUNUCUDAN TOKEN SİLME =====");
	console.log("[PUSH-DEBUG] expo_id:", token?.data);

	if (token && token?.data) {
		const payload = {
			expo_id: token?.data,
		};

		try {
			const res = await axios.put(`${baseUrl}alarms/device-tokens/`, payload);
			console.log("[PUSH-DEBUG] Token silme BAŞARILI:", res.data);
		} catch (error: any) {
			console.log("[PUSH-DEBUG] Token silme HATA:", error.toString());
		}
	} else {
		console.log("[PUSH-DEBUG] Token boş, silme isteği atılmadı");
	}
};

// Logları gönderme fonksiyonu
export const sendLogs = async (username: string, logs: string) => {
	return axios.post(`${baseUrl}logs/`, {
		ideal_username: username,
		logs,
		wl: "bigpara",
	});
};

// Mesajları alma fonksiyonu
export const messages = async (username: string) => {
	return axios.get(`${baseUrl}messages/?ideal_username=${username}&wl=bigpara`);
};

// Sentiment verilerini alma fonksiyonu
export const sentiments = async () => {
	return axios.get(`${baseUrl}sentiments/`);
};

// İzleme listelerini alma fonksiyonu
export const getWatchlists = async ({ username }: { username: string }) => {
	return axios.get<WatchLists>(`${baseUrl}alarm/watchlist`, {
		headers: {
			"X-TOKEN": token,
		},
		params: { wl: "bigpara", ideal_username: username },
	});
};

// İzleme listelerini senkronize etme fonksiyonu
export const syncWatchlists = async ({ username, data }: { username: string; data: WatchLists }) => {
	// Default watchlist
	const defaultWatchlist = [
		{
			codes: [
				"XU100",
				"VIP-X030-T",
				"",
				"GARAN",
				"AKBNK",
				"HALKB",
				"ISCTR",
				"YKBNK",
				"SAHOL",
				"TCELL",
				"THYAO",
				"VAKBN",
				"DOHOL",
				"ZOREN",
			],
		},
	];
	const isOnlyDefaultWatchlist = data.length === 1 && areWatchlistsEqual(defaultWatchlist[0], data[0]);
	if (!isOnlyDefaultWatchlist) {
		return axios.put(
			`${baseUrl}alarm/watchlist`,
			{
				wl: "bigpara",
				ideal_username: username,
				data,
			},
			{
				headers: {
					"X-TOKEN": token,
				},
			}
		);
	} else {
		return Promise.resolve(); // veya isteğe bağlı olarak bir reject yapabilirsin
	}
};

// İki watchlist'in eşit olup olmadığını kontrol eden fonksiyon
const areWatchlistsEqual = (watchlist1: any, watchlist2: any) => {
	// Her iki watchlist'in codes dizilerini kıyasla
	const cleanCodes1 = watchlist1.codes.filter((code: string) => code.trim() !== "");
	const cleanCodes2 = watchlist2.codes.filter((code: string) => code.trim() !== "");
	return JSON.stringify(cleanCodes1) === JSON.stringify(cleanCodes2);
};

// Symbol filtrelerini alma fonksiyonu
export const getSymbolFilters = async (
	username: string,
	category: "warrant" | "future" | "option",
	issuer: "akyatirim" | "isyatirim"
) => {
	return axios.get(`${baseUrl}alarm/symbols/filters`, {
		params: { ideal_username: username, category, issuer },
	});
};

// Symbol arama fonksiyonu
export const searchSymbol = async (
	username: string,
	category: "warrant" | "future" | "option" | "certificate",
	issuer: "akyatirim" | "isyatirim" | "info",
	underlying = undefined,
	expiry = undefined
) => {
	const url = `${baseUrl}alarm/symbols/search`;
	const params = {
		issuer,
		ideal_username: username,
		category,
		underlying,
		expiry,
	};
	
	console.log("=== FINTABLES API - searchSymbol ===");
	console.log("URL:", url);
	console.log("Params:", params);
	console.log("Full URL:", `${url}?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as any).toString()}`);
	console.log("===================================");
	
	return axios.get(url, { params });
};
