// Döviz çiftleri kod → tanım haritası.
// Kaynak: iDealGo / Pariteler ekranı (idealdata).
// Mapleme için kullanılır; tanım metinleri ekranda doğrudan gösterilebilir.

export interface CurrencyPair {
	code: string;
	title: string;
}

export const CURRENCY_PAIRS: readonly CurrencyPair[] = [
	{ code: "AEDTRY", title: "FX BAE Dirhemi/Turkish Lira" },
	{ code: "AUDCAD", title: "FX Australlia Dolar/Canada Dollar" },
	{ code: "AUDCHF", title: "FX Australlia Dollar / Swiss Frank" },
	{ code: "AUDJPY", title: "FX Australia Dollar/JPY" },
	{ code: "AUDNZD", title: "FX Australia Dolar/New Zelland Dollar" },
	{ code: "AUDUSD", title: "FX USD/Australia Dollar" },
	{ code: "CADCHF", title: "FX Canada Dollar/Swiss Frank" },
	{ code: "CADJPY", title: "FX Canada Dollar/Japan Yen" },
	{ code: "CADTRY", title: "FX CAD/Turkish Lira" },
	{ code: "CHFJPY", title: "FX CHF / JPY" },
	{ code: "CHFTRY", title: "FX Swiss Frank/Turkish Lira" },
	{ code: "CNHTRY", title: "FX China Yuan / TRY" },
	{ code: "EURAUD", title: "FX EURO/Australia DOLLAR" },
	{ code: "EURCAD", title: "FX EURO/Canada DOLLAR" },
	{ code: "EURCHF", title: "FX EURO/Swiss Franc" },
	{ code: "EURCZK", title: "FX EUR/Çek Kuronası" },
	{ code: "EURDKK", title: "FX EUR/Denmark Krone" },
	{ code: "EURGBP", title: "FX EURO/Sterlin" },
	{ code: "EURHUF", title: "FX EUR/Hungary Forint" },
	{ code: "EURJPY", title: "FX EURO/Japanese Yen" },
	{ code: "EURNOK", title: "FX EUR/Norway Krone" },
	{ code: "EURNZD", title: "FX EURO / Yeni Zellanda Doları" },
	{ code: "EURPLN", title: "FX Euro / Poland Zloty" },
	{ code: "EURSEK", title: "FX EUR/Sweden Krona" },
	{ code: "EURSGD", title: "FX EUR/Singapore Dollar" },
	{ code: "EURTRY", title: "FX EUR/Turkish Lira" },
	{ code: "EURUSD", title: "FX USD/EURO" },
	{ code: "GBPAUD", title: "FX Pound/Australlia Dollar" },
	{ code: "GBPCAD", title: "FX Pound/Canada Dollar" },
	{ code: "GBPCHF", title: "FX GBP/Swiss Frank" },
	{ code: "GBPEUR", title: "FX GBP/Euro" },
	{ code: "GBPJPY", title: "FX GBP/Japan Yen" },
	{ code: "GBPNZD", title: "FX GBP / NZD" },
	{ code: "GBPTRY", title: "FX Pound/Turkish Lira" },
	{ code: "GBPUSD", title: "FX Pound/US Dollar" },
	{ code: "JPYTRY", title: "FX Japan Yen/Turkish Lira" },
	{ code: "NZDCAD", title: "FX NZD/CAD" },
	{ code: "NZDCHF", title: "FX New Zelland Dollar/Swiss Frank" },
	{ code: "NZDJPY", title: "FX NZD/JPY" },
	{ code: "RUBTRY", title: "FX Ruble/Turkish Lira" },
	{ code: "TRYGBP", title: "FX Pound/Turkish Lira" },
	{ code: "TRYJPY", title: "FX Japan Yen/Turkish Lira" },
	{ code: "USDARS", title: "FX USD/U.Argentina Peso" },
	{ code: "USDBRL", title: "FX USD/Brazil Real" },
	{ code: "USDCAD", title: "FX USD/Canada Dollar" },
	{ code: "USDCHF", title: "FX USD/Swiss Franc" },
	{ code: "USDCNY", title: "FX USD/China Yuan" },
	{ code: "USDDKK", title: "FX USD/Denmark Krone" },
	{ code: "USDHKD", title: "FX USD/Hong Kong Doları" },
	{ code: "USDHUF", title: "FX USD/Hungary Forint" },
	{ code: "USDIDR", title: "FX / USD - Endonezya" },
	{ code: "USDILS", title: "FX USD/Israel Shekel" },
	{ code: "USDINR", title: "US DOLLAR / INDIA RUPI" },
	{ code: "USDJPY", title: "FX USD/Japanese Yen" },
	{ code: "USDKRW", title: "FX USD/Republic of Korea Won" },
	{ code: "USDMXN", title: "FX USD/Mexico Peso (New)" },
	{ code: "USDNOK", title: "FX USD/Norway Krone" },
	{ code: "USDNZD", title: "FX USD/New Zealand Dollar" },
	{ code: "USDPLN", title: "FX USD/Poland Zloty" },
	{ code: "USDRON", title: "FX USD/New Romania Leu Spot" },
	{ code: "USDRUB", title: "FX USD/Rus Rublesi" },
	{ code: "USDSAR", title: "FX USD/Saudi Riyali" },
	{ code: "USDSEK", title: "FX USD/Sweden Krona" },
	{ code: "USDTHB", title: "FX USD/Thailand Baht" },
	{ code: "USDTRY", title: "FX USD/Turkish Lira" },
	{ code: "USDTWD", title: "FX USD/Taiwan Doları" },
	{ code: "USDZAR", title: "FX USD/South Africa Rand" },
	{ code: "XZAR", title: "GÜNEY AFRİKA RANDI" },
] as const;

// Hızlı arama haritası: code → title
export const CURRENCY_PAIR_TITLE_BY_CODE: Readonly<Record<string, string>> =
	CURRENCY_PAIRS.reduce<Record<string, string>>((acc, p) => {
		acc[p.code] = p.title;
		return acc;
	}, {});

export function getCurrencyPairTitle(code: string): string | undefined {
	return CURRENCY_PAIR_TITLE_BY_CODE[code];
}
