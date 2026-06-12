import AsyncStorage from "@react-native-async-storage/async-storage";
import store, { AppDispatch, RootState } from "../../../store";
import {
	PriceMap,
	update,
} from "../../../screens/Markets/modules/prices";
import { SEP1, SEP2 } from "../constants";
import { loadSuccess } from "../../../screens/Markets/modules/lists";
import { SymbolMap, init, Symbol } from "../../../screens/Markets/modules/symbols";

// Predefined code arrays outside of the function for optimization
const yurtdisiPredefinedCodes = new Set([
	"US30", "DJ30-A", "GER30", "GER30-A", "SPX500", "SPX500-A", "NAS100", "NAS100-A",
	"FRA40", "FRA40-A", "GBR100", "GBR100-A", "ESP35", "EUR50", "SUI20"
]);

const kriptoPredefinedCodes = new Set([
	"BTCEUR", "BTCTRY", "BTCUSD", "ETHTRY", "ETHUSD", "LTCEUR", "LTCTRY", "LTCUSD",
	"XRPEUR", "XRPTRY", "XRPUSD"
]);

const lists = [
	{
		key: "doviz",
		filter: (symbol: Symbol) => symbol.prefix === "FX",
	},
	{
		key: "endeksler",
		filter: (symbol: Symbol) => symbol.prefix === "IMKBX",
	},
	{
		key: "dunyabono",
		filter: (symbol: Symbol) => symbol.prefix === "WBOND",
	},
	{
		key: "yurtdisi",
		filter: (symbol: Symbol) =>
			symbol.prefix === "WBOND" ||
			symbol.prefix === "FUTGCK" ||
			yurtdisiPredefinedCodes.has(symbol.code),
	},
	{
		key: "bist30",
		filter: (symbol: Symbol) =>
			symbol.prefix === "IMKBH" && symbol.indexType?.substr(2, 1) === "1",
	},
	{
		key: "bist100",
		filter: (symbol: Symbol) =>
			symbol.prefix === "IMKBH" && symbol.indexType?.substr(0, 1) === "1",
	},
	{
		key: "viopaktif",
		filter: (symbol: Symbol) => symbol.prefix === "VIP" && symbol.code?.startsWith("VIP"),
	},
	{
		key: "viopvadeli",
		filter: (symbol: Symbol) => symbol.prefix === "VIP" && symbol?.code?.startsWith("F_"),
	},
	{
		key: "kripto",
		filter: (symbol: Symbol) => kriptoPredefinedCodes.has(symbol.code),
	},
	{
		key: "yildizpazar",
		filter: (symbol: Symbol) => symbol.seriNo === "E" && symbol.group === "Y",
	},
	{
		key: "anapazar",
		filter: (symbol: Symbol) => symbol.seriNo === "E" && symbol.group === "A",
	},
	{
		key: "altpazar",
		filter: (symbol: Symbol) => symbol.seriNo === "E" && symbol.group === "ALT",
	},
	{
		key: "BYF",
		filter: (symbol: Symbol) => symbol.seriNo === "F",
	},
];

const processSymbols = (local: string, licences: string[], demo: boolean) => {
	let lastPrices: PriceMap = {};
	let symbols: SymbolMap = {};
	const state = store.getState();

	const hasIndicesLicence = licences.includes("IMKBX");
	const hasKarmaLicence = licences.includes("COMEX");
	const hasMKKLicence = licences.indexOf("MKK") > -1;
	const isDemo = demo;

	const symbolParts = local.split(SEP1).slice(0);

	symbolParts.forEach((part) => {
		const [
			prefix,
			code,
			decPoint,
			seriNo,
			indexType,
			subMarket,
			group,
			_lastPrice,
			_dayClose,
			_bidPrice,
			_askPrice,
			originalOrBrutTakas
		] = part.split(SEP2);

		if (
			prefix === "IMKBX" &&
			!isDemo &&
			((!hasKarmaLicence && !hasIndicesLicence) ||
				(hasKarmaLicence &&
					!hasIndicesLicence &&
					!["XU100", "XU030"].includes(code)))
		) {
			return;
		}
		if ((code.includes("TKSYABANCI") || code.includes("TKSYERLI")) && !hasMKKLicence) {
			return;
		}

		symbols[code] = {
			code,
			composite: `${prefix}'${code}`,
			prefix,
			decPoint: parseInt(decPoint),
			seriNo,
			indexType,
			subMarket,
			group,
			original: prefix === "VIP" ? originalOrBrutTakas : code,
			isBrutTakas: prefix === "IMKBH" && originalOrBrutTakas === "1",
			canBeTraded: prefix === "IMKBH" || prefix === "VIP",
		};
		lastPrices[code] = state.prices[code] || {};
			lastPrices[code] = {
				lastPrice: 0,
				dayClose: 0,
				bid: 0,
				ask: 0,
				changePercent: 0,
			};

	});

	return { lastPrices, symbols };
};

const symbolStorageRecord = async (message: string) => {
	const codeList1 = message.split(SEP1).map((part) => part.split(SEP2)[1]);
	try {
		await AsyncStorage.multiSet([
			["@symbolDefination", message],
			["@symbolDefinationlength", codeList1.length.toString()],
		]);
		console.log("Symbol length: ", codeList1.length);
	} catch (error) {
		//console.error("Error saving data:", error);
	}
};

export const symbolDefinitions = async (
	store: { dispatch: AppDispatch; getState: () => RootState },
	message: string
) => {
	let local = message;
	if (message.length > 0) {
		await symbolStorageRecord(message);
	} else {
		local = await AsyncStorage.getItem("@symbolDefination") || "";
	}

	if (local) {
		const isDemo = store.getState().auth.demo;
		const licences = store.getState().auth.user.licences;
		const { lastPrices, symbols } = processSymbols(local, licences, isDemo);

		store.dispatch(update(lastPrices));
		store.dispatch(init(symbols));

		const symbolList = Object.values(symbols);

		//console.log("DMLKTG symbol:", symbolList.find(s => s.code === "DMLKTG"));

		lists.forEach((list) => {
			const filteredAndMappedList = symbolList
				.filter(list.filter)
				.map((symbol) => symbol.code)
				.sort((a, b) => a.localeCompare(b));

			store.dispatch(loadSuccess({ type: list.key, codes: filteredAndMappedList }));
		});
	}
};
