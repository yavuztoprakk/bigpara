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

// =====================================================================
// Bireysel para birimleri (Döviz Çeviricisi dropdown'ları için)
// =====================================================================
export interface Currency {
	code: string;        // 3 harfli ISO/IDealdata kodu
	label: string;       // Uzun, kullanıcıya gösterilen isim
	countryCode: string; // 2 harfli ISO ülke kodu (react-native-flags için)
}

export const INDIVIDUAL_CURRENCIES: readonly Currency[] = [
	{ code: "TRY", label: "Türk Lirası", countryCode: "TR" },
	{ code: "USD", label: "Amerikan Doları", countryCode: "US" },
	{ code: "EUR", label: "Euro", countryCode: "EU" },
	{ code: "GBP", label: "İngiliz Sterlini", countryCode: "GB" },
	{ code: "CHF", label: "İsviçre Frangı", countryCode: "CH" },
	{ code: "JPY", label: "Japon Yeni", countryCode: "JP" },
	{ code: "CAD", label: "Kanada Doları", countryCode: "CA" },
	{ code: "AUD", label: "Avustralya Doları", countryCode: "AU" },
	{ code: "AED", label: "BAE Dirhemi", countryCode: "AE" },
	{ code: "ARS", label: "Arjantin Pesosu", countryCode: "AR" },
	{ code: "BRL", label: "Brezilya Reali", countryCode: "BR" },
	{ code: "CNH", label: "Çin Yuanı (Offshore)", countryCode: "CN" },
	{ code: "CNY", label: "Çin Yuanı", countryCode: "CN" },
	{ code: "CZK", label: "Çek Korunası", countryCode: "CZ" },
	{ code: "DKK", label: "Danimarka Kronu", countryCode: "DK" },
	{ code: "HKD", label: "Hong Kong Doları", countryCode: "HK" },
	{ code: "HUF", label: "Macar Forinti", countryCode: "HU" },
	{ code: "IDR", label: "Endonezya Rupisi", countryCode: "ID" },
	{ code: "ILS", label: "İsrail Şekeli", countryCode: "IL" },
	{ code: "INR", label: "Hindistan Rupisi", countryCode: "IN" },
	{ code: "KRW", label: "Güney Kore Wonu", countryCode: "KR" },
	{ code: "MXN", label: "Meksika Pesosu", countryCode: "MX" },
	{ code: "NOK", label: "Norveç Kronu", countryCode: "NO" },
	{ code: "NZD", label: "Yeni Zelanda Doları", countryCode: "NZ" },
	{ code: "PLN", label: "Polonya Zlotisi", countryCode: "PL" },
	{ code: "RON", label: "Romanya Leyi", countryCode: "RO" },
	{ code: "RUB", label: "Rus Rublesi", countryCode: "RU" },
	{ code: "SAR", label: "Suudi Arabistan Riyali", countryCode: "SA" },
	{ code: "SEK", label: "İsveç Kronu", countryCode: "SE" },
	{ code: "SGD", label: "Singapur Doları", countryCode: "SG" },
	{ code: "THB", label: "Tayland Bahtı", countryCode: "TH" },
	{ code: "TWD", label: "Tayvan Doları", countryCode: "TW" },
	{ code: "ZAR", label: "Güney Afrika Randı", countryCode: "ZA" },
] as const;

const PAIR_CODES_SET: ReadonlySet<string> = new Set(
	CURRENCY_PAIRS.map((p) => p.code)
);

// İki bireysel kod arasındaki pariteyi bulur:
//   - Direkt eşleşme varsa (örn. USDTRY) inverted=false
//   - Ters yön varsa (örn. EURUSD için from=USD, to=EUR) inverted=true
//   - Hiçbiri yoksa null
export interface PairLookupResult {
	code: string;       // Sembol kodu (örn. "USDTRY")
	inverted: boolean;  // true ise lastPrice'in 1/rate'i alınır
}

export function findPairCode(
	from: string,
	to: string
): PairLookupResult | null {
	if (!from || !to || from === to) return null;
	const direct = `${from}${to}`;
	if (PAIR_CODES_SET.has(direct)) {
		return { code: direct, inverted: false };
	}
	const reverse = `${to}${from}`;
	if (PAIR_CODES_SET.has(reverse)) {
		return { code: reverse, inverted: true };
	}
	return null;
}
