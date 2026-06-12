import {
  GAMInterstitialAd,
  AdEventType,
} from "react-native-google-mobile-ads";
import {
  AD_UNITS,
  AdTargeting,
  buildTargeting,
  INTERSTITIAL_INTERVAL_MS,
} from "./config";

// Interstitial reklam — singleton akış.
// Akış: preload → maybeShow() çağrıldığında frekans kontrolü → göster → kapanınca preload.
// Sadece "diger" bucket altında tanımlı; Ekranım ekranında gösterilmez.
//
// Route-bazlı targeting: AppNavigator her navigation'da setNextTargeting'i
// çağırır → mevcut preload (varsa) atılıp yeni targeting ile yeni preload
// başlar. GAM request'i her zaman kullanıcının o anki kategorisini taşır.
//
// Deferred show: maybeShow çağrıldığında ad henüz yüklenmemişse pendingShow=true
// işaretlenir; LOADED event'inde aktif ad için otomatik show denenir. Böylece
// kullanıcı gezindiği ekranda 1-3 sn sonra reklamı görür (kill+new mantığı korunarak).
//
// Listener identity guard: setNextTargeting eski ad'ı bırakıp yenisini oluşturduğunda
// eskisinin LOADED/ERROR/CLOSED event'leri geç gelse bile (ad !== currentAd) ile
// yok sayılır — eski targeting'li reklam yeni route'ta yanlışlıkla gösterilmez.

let currentAd: GAMInterstitialAd | null = null;
let isLoaded = false;
let lastShownAt = 0;
let activeTargeting: AdTargeting | null = null;
let pendingShow = false;

const preload = (targeting: AdTargeting) => {
  if (currentAd) {
    console.log("[ADS-DBG] preload skip (already have ad) cat=", targeting.bigpara_kategori);
    return;
  }
  console.log("[ADS-DBG] preload start cat=", targeting.bigpara_kategori);
  const ad = GAMInterstitialAd.createForAdRequest(AD_UNITS.interstitial(), {
    customTargeting: buildTargeting(targeting),
  });

  ad.addAdEventListener(AdEventType.LOADED, () => {
    if (ad !== currentAd) {
      // Zombie: bu ad setNextTargeting tarafından bırakıldı, geç gelen event yok say.
      console.log("[ADS-DBG] LOADED zombie ignored cat=", targeting.bigpara_kategori);
      return;
    }
    isLoaded = true;
    console.log("[ADS-DBG] LOADED activeCat=", activeTargeting?.bigpara_kategori, "pendingShow=", pendingShow);
    if (pendingShow) {
      // Kullanıcı bu kategoriye geldi, reklam istemişti ama hazır değildi — şimdi göster.
      maybeShowInterstitial();
    }
  });
  ad.addAdEventListener(AdEventType.ERROR, (error) => {
    if (ad !== currentAd) {
      console.log("[ADS-DBG] ERROR zombie ignored cat=", targeting.bigpara_kategori);
      return;
    }
    console.warn("[ADS] Interstitial load error:", error);
    console.log("[ADS-DBG] ERROR activeCat=", activeTargeting?.bigpara_kategori);
    currentAd = null;
    isLoaded = false;
  });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    if (ad !== currentAd) {
      console.log("[ADS-DBG] CLOSED zombie ignored cat=", targeting.bigpara_kategori);
      return;
    }
    console.log("[ADS-DBG] CLOSED activeCat=", activeTargeting?.bigpara_kategori);
    currentAd = null;
    isLoaded = false;
    pendingShow = false;
    // CLOSED sonrası otomatik preload YOK. Ad ops gereksinimi: kullanıcı
    // farklı bir sayfaya gitmeden tekrar request atılmamalı. Bir sonraki
    // navigation'da setNextTargeting (veya maybeShow) preload'u başlatacak.
  });

  currentAd = ad;
  ad.load();
};

// Mevcut preload'ı (varsa) atıp verilen targeting ile yeni preload başlatır.
// Route değişiminde AppNavigator tarafından çağrılır.
export const setNextTargeting = (targeting: AdTargeting) => {
  // Targeting gerçekten değişmediyse re-preload etme — gereksiz request.
  if (
    activeTargeting &&
    activeTargeting.bigpara_kategori === targeting.bigpara_kategori
  ) {
    console.log("[ADS-DBG] setNextTargeting SKIP (same cat) cat=", targeting.bigpara_kategori, "hadAd=", !!currentAd, "isLoaded=", isLoaded);
    return;
  }
  console.log("[ADS-DBG] setNextTargeting KILL old=", activeTargeting?.bigpara_kategori, "new=", targeting.bigpara_kategori, "hadAd=", !!currentAd, "wasLoaded=", isLoaded);
  activeTargeting = targeting;
  currentAd = null;
  isLoaded = false;
  // Eski kategori için biriken pending isteği temizle — yeni kategori için
  // maybeShow zaten hemen ardından çağrılacak ve gerekirse yeniden set edecek.
  pendingShow = false;
  preload(targeting);
};

export const initInterstitial = (targeting: AdTargeting) => {
  activeTargeting = targeting;
  preload(targeting);
};

// Excluded ekrana geçildiğinde (Ekranım, Hesabım, auth ekranları) çağrılır.
// Önceki ekrandan kalan "reklam göstermek istemiştim" niyetini iptal eder.
// Yoksa: pendingShow=true ile excluded ekrana geçilir, ad LOADED olduğunda
// deferred-show o ekran için tetiklenir — kural ihlali.
export const cancelPendingShow = () => {
  if (pendingShow) {
    console.log("[ADS-DBG] cancelPendingShow (entered excluded route)");
    pendingShow = false;
  }
};

export const maybeShowInterstitial = (): boolean => {
  const now = Date.now();
  const sinceLast = now - lastShownAt;
  if (sinceLast < INTERSTITIAL_INTERVAL_MS) {
    console.log("[ADS-DBG] maybeShow SKIP (frequency gate) sinceLastMs=", sinceLast, "cat=", activeTargeting?.bigpara_kategori);
    return false;
  }
  if (!currentAd || !isLoaded) {
    console.log("[ADS-DBG] maybeShow PENDING hasAd=", !!currentAd, "isLoaded=", isLoaded, "cat=", activeTargeting?.bigpara_kategori);
    // Hazır ad yok — kullanıcının "göstermek istedim" niyetini hatırla.
    // LOADED event'i tetiklendiğinde otomatik olarak maybeShow tekrar denenir.
    pendingShow = true;
    if (activeTargeting && !currentAd) preload(activeTargeting);
    return false;
  }
  try {
    currentAd.show();
    lastShownAt = now;
    pendingShow = false;
    console.log("[ADS-DBG] maybeShow SHOWN cat=", activeTargeting?.bigpara_kategori);
    return true;
  } catch (error) {
    console.warn("[ADS] Interstitial show error:", error);
    console.log("[ADS-DBG] maybeShow ERROR cat=", activeTargeting?.bigpara_kategori);
    return false;
  }
};
