import type { AdTargeting } from "./config";

// Route name → AdTargeting eşleştirmesi. Dinamik bilgi gerektiren route'lar
// (örn. MarketsList'in `bist30` / `bist100` ayrımı) için fonksiyon kabul edilir.

type TargetingResolver = AdTargeting | ((params: any) => AdTargeting);

// "BIST 100" → "bist100" — MarketsList ile aynı slugify.
const slugify = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "");

// Sade slug — bigpara_kategori = catlist[0] (Detail, News için).
const target = (slug: string): AdTargeting => ({
  bigpara_kategori: slug,
  catlist: [slug],
});

// Piyasalar ekranları: bigpara_kategori sade slug ("piyasalar" veya alt slug),
// catlist ise hiyerarşik ("c1_piyasalar" + opsiyonel "c2_${sub}").
const piyasalarTarget = (sub?: string): AdTargeting => ({
  bigpara_kategori: sub ?? "piyasalar",
  catlist: sub ? ["c1_piyasalar", `c2_${sub}`] : ["c1_piyasalar"],
});

// Analiz ekranları: bigpara_kategori sade slug ("analiz" veya alt slug),
// catlist ise hiyerarşik ("c1_analiz" + opsiyonel "c2_${sub}").
const analizTarget = (sub?: string): AdTargeting => ({
  bigpara_kategori: sub ?? "analiz",
  catlist: sub ? ["c1_analiz", `c2_${sub}`] : ["c1_analiz"],
});

const ROUTE_TARGETING: Record<string, TargetingResolver> = {
  // Piyasalar
  // NOT: Markets ve MarketsHome route'ları AppNavigator tarafından atlanır;
  // targeting'i MarketsHome komponentinin kendisi (Piyasa Özeti / Piyasalar
  // top tab'ına göre) useFocusEffect üzerinden yönetir.
  MarketsList: (params) => {
    const slug = slugify(params?.title ?? "");
    return slug ? piyasalarTarget(slug) : piyasalarTarget();
  },

  // Piyasa detay — sade slug (kullanıcı talebi: "detail")
  Detail: target("detail"),

  // Haberler — sade slug
  NewsScreen: target("haberler"),
  NewsDetail: target("haberler"),

  // Analiz
  ToolsScreen: analizTarget(),
  Yatirimlarim: analizTarget("yatirimlarim"),
  ParamNeOlurdu: analizTarget("param-ne-olurdu"),
  KademeAnalizi: analizTarget("kademe-analizi"),
  SicaklikHaritasi: analizTarget("sicaklik-haritasi"),
  PivotAnalizi: analizTarget("pivot-analizi"),
  MaliTablolar: analizTarget("mali-tablolar"),
  PerformansAnalizi: analizTarget("performans-analizi"),
  ElliottAnalizi: analizTarget("elliott-analizi"),
  BinTLNeOldu: analizTarget("bintl-ne-oldu"),
  DovizCeviricisi: analizTarget("doviz-ceviricisi"),
  AltinHesaplayici: analizTarget("altin-hesaplayici"),
  YeniYatirim: analizTarget("yeni-yatirim"),
  SembolSecim: analizTarget("sembol-secim"),

  // Takvimler — Analiz altında, withToolAds wraplı
  Calendar: analizTarget("ekonomik-takvim"),
  DividendCalendar: analizTarget("temettu-takvimi"),
};

// Fallback — bilinmeyen route için generic targeting.
const DEFAULT_TARGETING: AdTargeting = target("interstitial");

export const getInterstitialTargeting = (
  routeName: string,
  params?: any
): AdTargeting => {
  const resolver = ROUTE_TARGETING[routeName];
  if (!resolver) return DEFAULT_TARGETING;
  return typeof resolver === "function" ? resolver(params) : resolver;
};
