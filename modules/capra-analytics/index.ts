import { requireNativeModule } from "expo-modules-core";

// Capra Analytics SDK için TS yüzeyi.
// Native taraf: ios/CapraAnalyticsModule.swift + android/.../CapraAnalyticsModule.kt
// SDK README: https://github.com/capra-solutions/analytics-ios-sdk
//            https://github.com/capra-solutions/analytics-android-sdk
type CapraAnalyticsNative = {
  configure(siteId: string, endpoint: string): void;
  trackScreen(name: string, url: string, title: string): void;
  trackEvent(name: string, properties: Record<string, any>): void;
  trackConversion(id: string, type: string, value: number, currency: string): void;
};

const CapraAnalytics = requireNativeModule<CapraAnalyticsNative>("CapraAnalytics");

export default CapraAnalytics;
