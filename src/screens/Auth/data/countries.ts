// Yaygın ülkelerin listesi: dialCode (telefon ülke kodu) ve flag (ISO alpha-2, react-native-flags ile uyumlu).
// TR başta; geri kalanlar Türkçe isme göre alfabetik.

export interface Country {
  code: string;     // ISO alpha-2 (örn. "TR")
  dialCode: string; // telefon ülke kodu (örn. "+90")
  name: string;     // Türkçe isim
  flag: string;     // react-native-flags'in beklediği ISO alpha-2 kodu
}

export const countries: Country[] = [
  { code: "TR", dialCode: "+90", name: "Türkiye", flag: "TR" },
  { code: "DE", dialCode: "+49", name: "Almanya", flag: "DE" },
  { code: "US", dialCode: "+1", name: "Amerika Birleşik Devletleri", flag: "US" },
  { code: "AR", dialCode: "+54", name: "Arjantin", flag: "AR" },
  { code: "AL", dialCode: "+355", name: "Arnavutluk", flag: "AL" },
  { code: "AT", dialCode: "+43", name: "Avusturya", flag: "AT" },
  { code: "AU", dialCode: "+61", name: "Avustralya", flag: "AU" },
  { code: "AZ", dialCode: "+994", name: "Azerbaycan", flag: "AZ" },
  { code: "BE", dialCode: "+32", name: "Belçika", flag: "BE" },
  { code: "BR", dialCode: "+55", name: "Brezilya", flag: "BR" },
  { code: "BG", dialCode: "+359", name: "Bulgaristan", flag: "BG" },
  { code: "CN", dialCode: "+86", name: "Çin", flag: "CN" },
  { code: "DK", dialCode: "+45", name: "Danimarka", flag: "DK" },
  { code: "ID", dialCode: "+62", name: "Endonezya", flag: "ID" },
  { code: "MA", dialCode: "+212", name: "Fas", flag: "MA" },
  { code: "FI", dialCode: "+358", name: "Finlandiya", flag: "FI" },
  { code: "FR", dialCode: "+33", name: "Fransa", flag: "FR" },
  { code: "GE", dialCode: "+995", name: "Gürcistan", flag: "GE" },
  { code: "ZA", dialCode: "+27", name: "Güney Afrika", flag: "ZA" },
  { code: "KR", dialCode: "+82", name: "Güney Kore", flag: "KR" },
  { code: "IN", dialCode: "+91", name: "Hindistan", flag: "IN" },
  { code: "NL", dialCode: "+31", name: "Hollanda", flag: "NL" },
  { code: "IQ", dialCode: "+964", name: "Irak", flag: "IQ" },
  { code: "GB", dialCode: "+44", name: "İngiltere", flag: "GB" },
  { code: "IR", dialCode: "+98", name: "İran", flag: "IR" },
  { code: "IE", dialCode: "+353", name: "İrlanda", flag: "IE" },
  { code: "ES", dialCode: "+34", name: "İspanya", flag: "ES" },
  { code: "IL", dialCode: "+972", name: "İsrail", flag: "IL" },
  { code: "SE", dialCode: "+46", name: "İsveç", flag: "SE" },
  { code: "CH", dialCode: "+41", name: "İsviçre", flag: "CH" },
  { code: "IT", dialCode: "+39", name: "İtalya", flag: "IT" },
  { code: "JP", dialCode: "+81", name: "Japonya", flag: "JP" },
  { code: "CA", dialCode: "+1", name: "Kanada", flag: "CA" },
  { code: "QA", dialCode: "+974", name: "Katar", flag: "QA" },
  { code: "KZ", dialCode: "+7", name: "Kazakistan", flag: "KZ" },
  { code: "CY", dialCode: "+357", name: "Kıbrıs", flag: "CY" },
  { code: "KW", dialCode: "+965", name: "Kuveyt", flag: "KW" },
  { code: "LB", dialCode: "+961", name: "Lübnan", flag: "LB" },
  { code: "HU", dialCode: "+36", name: "Macaristan", flag: "HU" },
  { code: "MY", dialCode: "+60", name: "Malezya", flag: "MY" },
  { code: "MX", dialCode: "+52", name: "Meksika", flag: "MX" },
  { code: "EG", dialCode: "+20", name: "Mısır", flag: "EG" },
  { code: "NO", dialCode: "+47", name: "Norveç", flag: "NO" },
  { code: "UZ", dialCode: "+998", name: "Özbekistan", flag: "UZ" },
  { code: "PK", dialCode: "+92", name: "Pakistan", flag: "PK" },
  { code: "PL", dialCode: "+48", name: "Polonya", flag: "PL" },
  { code: "PT", dialCode: "+351", name: "Portekiz", flag: "PT" },
  { code: "RO", dialCode: "+40", name: "Romanya", flag: "RO" },
  { code: "RU", dialCode: "+7", name: "Rusya", flag: "RU" },
  { code: "RS", dialCode: "+381", name: "Sırbistan", flag: "RS" },
  { code: "SG", dialCode: "+65", name: "Singapur", flag: "SG" },
  { code: "SA", dialCode: "+966", name: "Suudi Arabistan", flag: "SA" },
  { code: "TH", dialCode: "+66", name: "Tayland", flag: "TH" },
  { code: "TW", dialCode: "+886", name: "Tayvan", flag: "TW" },
  { code: "UA", dialCode: "+380", name: "Ukrayna", flag: "UA" },
  { code: "JO", dialCode: "+962", name: "Ürdün", flag: "JO" },
  { code: "VN", dialCode: "+84", name: "Vietnam", flag: "VN" },
  { code: "GR", dialCode: "+30", name: "Yunanistan", flag: "GR" },
];

export const defaultCountry: Country = countries[0];

export const findCountryByCode = (code: string): Country | undefined =>
  countries.find((c) => c.code === code);

export const findCountryByDialCode = (dialCode: string): Country | undefined =>
  countries.find((c) => c.dialCode === dialCode);
