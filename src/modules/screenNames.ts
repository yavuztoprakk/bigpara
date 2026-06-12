// BI ekibi her ekran için /bigpara/<bolum>/<ekran> formatında screen_name istedi.
// Bu dosya route name -> screen_name mapping'inin tek kaynağıdır.
// Hem manuel screen_view hem bottom_menu event'leri buradan beslenir.

export const SCREEN_NAMES: Record<string, string> = {
  // Auth
  Welcome: "/bigpara/karsilama",
  Login: "/bigpara/giris",
  Register: "/bigpara/uye-ol",
  OtpVerify: "/bigpara/otp-dogrula",
  SetPassword: "/bigpara/sifre-belirle",
  CompleteProfile: "/bigpara/profil-tamamla",
  LoginPassword: "/bigpara/sifre-giris",
  SMSGGO: "/bigpara/sms-onay",

  // Bottom tab kök ekranları
  WatchList: "/bigpara/ekranim",
  WatchListScreen: "/bigpara/ekranim",
  Markets: "/bigpara/piyasalar",
  MarketsHome: "/bigpara/piyasalar",
  MarketsList: "/bigpara/piyasalar/liste",
  News: "/bigpara/haberler",
  NewsScreen: "/bigpara/haberler",
  NewsDetail: "/bigpara/haberler/detay",
  Tools: "/bigpara/analiz",
  ToolsScreen: "/bigpara/analiz",
  Account: "/bigpara/hesabim",
  AccountScreen: "/bigpara/hesabim",

  // Ortak ekranlar
  Detail: "/bigpara/detay",
  DetailOrderBook: "/bigpara/detay/derinlik",
  Calendar: "/bigpara/takvim",
  Alarms: "/bigpara/alarmlar",
  DividendCalendar: "/bigpara/temettu-takvimi",
  ThemeChange: "/bigpara/tema-degistir",

  // WatchList alt ekranları
  WatchListEditor: "/bigpara/ekranim/duzenle",
  WatchListEditorAdd: "/bigpara/ekranim/duzenle/ekle",

  // Tools alt ekranları
  Yatirimlarim: "/bigpara/analiz/yatirimlarim",
  ParamNeOlurdu: "/bigpara/analiz/param-ne-olurdu",
  KademeAnalizi: "/bigpara/analiz/kademe-analizi",
  SicaklikHaritasi: "/bigpara/analiz/sicaklik-haritasi",
  PivotAnalizi: "/bigpara/analiz/pivot-analizi",
  MaliTablolar: "/bigpara/analiz/mali-tablolar",
  PerformansAnalizi: "/bigpara/analiz/performans-analizi",
  ElliottAnalizi: "/bigpara/analiz/elliott-analizi",
  BinTLNeOldu: "/bigpara/analiz/bin-tl-ne-oldu",
  DovizCeviricisi: "/bigpara/analiz/doviz-cevirici",
  AltinHesaplayici: "/bigpara/analiz/altin-hesaplayici",
  YeniYatirim: "/bigpara/analiz/yeni-yatirim",
  SembolSecim: "/bigpara/analiz/sembol-secim",

  // Account alt ekranları
  Hakkimizda: "/bigpara/hesabim/hakkimizda",
  KullaniciSozlesmesi: "/bigpara/hesabim/kullanici-sozlesmesi",
  GizlilikPolitikasi: "/bigpara/hesabim/gizlilik-politikasi",
  BizeYazin: "/bigpara/hesabim/bize-yazin",
};

// Bilinmeyen route geldiğinde sınıf adının raporda görünmemesi için
// /bigpara/<routeName.lowercase> formatında fallback üretiyoruz.
const fallback = (routeName: string): string =>
  `/bigpara/${routeName.replace(/Screen$/i, "").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`;

export const getScreenName = (routeName?: string | null): string => {
  if (!routeName) return "/bigpara/bilinmeyen";
  return SCREEN_NAMES[routeName] ?? fallback(routeName);
};
