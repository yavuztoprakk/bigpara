import {
  AdsConsent,
  AdsConsentDebugGeography,
} from "react-native-google-mobile-ads";

// Google UMP (User Messaging Platform) — GDPR consent flow.
// EEA/UK/CH kullanıcısı için form gösterir; diğerleri için no-op.
// Dönüş değeri: reklam istekleri yapılabilir mi?

const IS_DEV = __DEV__;

export const requestConsent = async (): Promise<boolean> => {
  try {
    await AdsConsent.requestInfoUpdate(
      IS_DEV
        ? {
            // Dev mode'da Türkiye/AB simülasyonu için override edilebilir.
            debugGeography: AdsConsentDebugGeography.DISABLED,
          }
        : undefined
    );

    const { status: _status } = await AdsConsent.loadAndShowConsentFormIfRequired();

    const { canRequestAds } = await AdsConsent.getConsentInfo();
    return canRequestAds ?? true;
  } catch (error) {
    console.warn("[ADS] UMP consent failed:", error);
    // Consent alınamadıysa default davranış: non-personalized ads gönderilir.
    return true;
  }
};
