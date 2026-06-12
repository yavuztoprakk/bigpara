import { Platform } from "react-native";

// Reklam altyapısı yapılandırması.
// Her ortamda GERÇEK ad unit path'leri kullanılır. Dev/Test cihazlar
// init.ts içinde testDeviceIdentifiers ile işaretlenir → Google gerçek
// path'e gelen istekleri "test reklam" ile karşılar (Google'ın önerdiği pattern).

// Base path — GAM Network ID + child network ID
const BASE = Platform.select({
  ios: "/9927946,22420977938/bigpara_ios",
  android: "/9927946,22420977938/bigpara_android",
})!;

// Anasayfa = Ekranım (Account). Diger = diğer tüm ekranlar.
export type AdBucket = "anasayfa" | "diger";

const unit = (bucket: AdBucket, slot: string) => `${BASE}/${bucket}/${slot}`;

// Interstitial slot adı platform farkı: iOS lowercase 'i', Android Capital 'I'
const INTERSTITIAL_SLOT =
  Platform.OS === "ios" ? "interstitial_320x480" : "Interstitial_320x480";

export const AD_UNITS = {
  masthead: (bucket: AdBucket) => unit(bucket, "320x50"),

  // Sayfa sonu 300x250.
  // NOT: Excel'de 'anasayfa/300x250' diye ayrı bir unit yok; brief'te belirtilen
  // bu unit yerine 'anasayfa/feed5_300x250' kullanılıyor ("sayfa sonu" notuyla).
  // Diger için 'diger/300x250' net var.
  medium: (bucket: AdBucket) =>
    bucket === "anasayfa"
      ? unit("anasayfa", "feed5_300x250")
      : unit("diger", "300x250"),

  // Feed reklamı — bir liste içinde sırayla feed1..feed5 kullanılır.
  feed: (bucket: AdBucket, index: 1 | 2 | 3 | 4 | 5) =>
    unit(bucket, `feed${index}_300x250`),

  // Interstitial sadece "diger" bucket'ta tanımlı — Ekranım'da gösterilmez.
  interstitial: () => unit("diger", INTERSTITIAL_SLOT),
};

// Bir sayfada gösterilebilecek maks feed reklam sayısı (brief).
export const MAX_FEED_ADS = 5;

// Custom targeting params — her reklam isteğinde gönderilir.
// Yeni convention (ad ops kararı): bigpara_kategori = sade slug,
// catlist = [bigpara_kategori]. Örn: "haberler", "bist30", "doviz-ceviricisi".
export type AdTargeting = {
  bigpara_kategori: string;
  catlist: string[];
};

export const buildTargeting = (
  t: AdTargeting
): Record<string, string | string[]> => ({
  bigpara_kategori: t.bigpara_kategori,
  catlist: t.catlist,
});

// Interstitial frekansı — 1 dakika.
export const INTERSTITIAL_INTERVAL_MS = 1 * 5 * 1000;

// Interstitial bootstrap için kullanılan default targeting. Gerçek targeting
// route bazında her navigation'da AppNavigator tarafından setNextTargeting ile
// güncellenir (bkz. interstitialTargeting.ts + interstitial.ts).
export const INTERSTITIAL_TARGETING: AdTargeting = {
  bigpara_kategori: "interstitial",
  catlist: ["interstitial"],
};
