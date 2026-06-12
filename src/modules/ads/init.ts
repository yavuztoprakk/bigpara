import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";
import { requestATT } from "./att";
import { requestConsent } from "./consent";

// Reklam altyapısı tek seferlik kurulum.
// Sıra: ATT (iOS) → UMP consent → MobileAds.initialize()
// FCM permission'ından ÖNCE çağrılmalı (IDFA atanmadan token alınmaması için).
//
// NOT: Burada interstitial bootstrap preload YOK. Splash anında GAM'a
// "interstitial" default targeting'iyle istek atmamak için preload, kullanıcı
// gerçek bir kategoriye navigate ettiğinde AppNavigator.onStateChange içinde
// setNextTargeting → preload zinciri ile başlar.

let initialized = false;

export const initAds = async (): Promise<void> => {
  if (initialized) return;
  initialized = true;

  await requestATT();
  await requestConsent();

  try {
    // Test cihazları işaretle — gerçek ad unit path'lerine giden istekler
    // bu cihazlardan geldiğinde Google "test reklam" döner (gerçek gelir
    // üretmez, ban riski yok). Simulator/emulator otomatik test sayılır.
    if (__DEV__) {
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        testDeviceIdentifiers: ["EMULATOR"],
      });
    }

    await mobileAds().initialize();
  } catch (error) {
    console.warn("[ADS] MobileAds initialize failed:", error);
  }
};
