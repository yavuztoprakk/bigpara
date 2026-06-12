# BigPara — Durum Raporu

**Son güncelleme**: 2026-06-12

---

## Yeni: Analytics + Capra SDK Entegrasyonu (commit bekliyor)

BI ekibi `screen_view`, `bottom_menu`, `Purchases` event'lerini GA4'te (manuel) ve **Capra Analytics** (Demirören kendi BI altyapısı, `analytics-ingestion.demirorenmedya.com`) backend'inde paralel istiyor.

### Eklenenler
- `src/modules/screenNames.ts` — route → `/bigpara/xxx` mapping (tek kaynak)
- `src/modules/analytics.ts` — `trackScreenView`, `trackBottomMenu`, `trackPurchase` helper'ları + dedup ref. Hem Firebase Analytics hem Capra'ya paralel push
- `modules/capra-analytics/` — Expo local module:
  - iOS Swift bridge (`pod 'CapraAnalytics', '~> 3.0'`)
  - Android Kotlin bridge (`com.github.capra-solutions:analytics-android-sdk:2.5.3`)
  - TS interface `requireNativeModule<…>("CapraAnalytics")`
- `src/routes/TabNavigator.tsx` → CustomTabBar `onPress` → `trackBottomMenu(getScreenName(route.name))`
- `BaseApp.tsx` → app açılışında `CapraAnalytics.configure(siteId, endpoint)` (extra'dan okur, boşsa no-op)
- `ios/Bigpara/Info.plist` + `app.json` infoPlist → `FirebaseAutomaticScreenReportingEnabled = false` (çift sayım engeli)
- `android/app/src/main/AndroidManifest.xml` → `google_analytics_automatic_screen_reporting_enabled = false`

### Bekleyen
- BI'dan `capraSiteIdIos` / `capraSiteIdAndroid` değerleri → `app.json` extra'ya yazılacak
- `expo prebuild --clean` + `pod install` → Capra native modülünün autolink olması için
- Lisans satın alma ekranı bağlandığında `trackPurchase(...)` çağrısı

### Doğrulama (siteId geldikten sonra)
1. GA4 DebugView'da `screen_view` tek sayımla görünmeli (otomatik kapalı + dedup)
2. Tab tıklamalarında `bottom_menu` event'i `bottom_name=/bigpara/...`
3. Capra dashboard / network sniff → `POST /e` istekleri
4. Rapor "Page title and screen name" boyutunda `/bigpara/xxx` formatı (sınıf adı yok)

---

> Yeni session başlattığında bu dosya + `git log --oneline -20` + `docs/perf/PLAN.md` ile durumu hızlıca toparlayabilirsin.

---

## Aktif Çalışma — Performans Yol Haritası

`docs/perf/PLAN.md` — 14 fazlı plan. Bağlayıcı kurallar:
- **No-Flash**: veri gelmeden ekran açılmaz (skeleton bile yok)
- **Single-Render**: mount + ilk veri için toplam 1 render
- **Surgical**: refactor değil, hedefe yönelik müdahale
- **Per-Phase Commit**: her faz tek commit, onaysız fix yok

### Tamamlanan fazlar

| Faz | Konu | Commit |
|-----|------|--------|
| 0+1 | Hazırlık + Cold Start | `d3fcd64` |
| 2 | Welcome | `cd5e5f5`, `40f340b` |
| 3 | Account/Login | `3d11a57` |
| 4 | LoginPassword + **B-4 fix** (çift WS login zinciri kesildi) | `6fd9a5c` |
| 5 | Register akışı (OtpVerify+SetPassword+CompleteProfile) | `955aabf` |
| 6 (konservatif A şıkkı) | Markets: keyExtractor, parser snapshot, memo'lar | `7f8be37` |

### Faz 6'da BİLİNÇLİ atlanılanlar (yapısal davranış değişimi gerektiriyor)

- **M1** `prices.ts` Redux update durdur → ❌ `realTimeUpdate.ts` delta merge'i bozar
- **M2** `List.useSelector(state.prices)` kaldır → kanıt gerekli
- **M3** `List.tsx` 5sn polling → initial fallback olabilir, test gerek
- **M5** `updatedPrices`/`animatingCodes` dual state → TickerRow analiz gerek

### Bekleyen fazlar

7. Watchlist | 8. Detail | 9. News | 10. Analysis | 11. Account profile (auth'lu yarı) | 12. Navigation katmanı | 13. Final regression

### Pre-existing sorunlar (`docs/perf/PHASE-0-BOOT-MAP.md`)

- **B-1** Çift `<ThemeProvider>` (App.tsx + BaseApp.tsx) — toggle propagation eksik
- **B-2** AppNavigator dot animasyonu overlay yokken bile sonsuz
- **B-3** `triggerTransitionOverlay` + `ROUTE_MIN_VISIBLE_MS` fake-no-flash
- **B-5** Axios interceptor production'da koşulsuz console.log
- **B-6** `<Reconnect />` her zaman mount
- **B-7** AppNavigator `@symbolDefinationlength` her isAuthenticated true'da AsyncStorage

---

## Performans Dışı Tamamlananlar

### Ekran taşıma (iDeal Pro → BigPara)
- `screens/Calendar/` (Ekonomik Takvim) — HTTP: FintablesClient.calendar()
- `screens/DividendCalendar/` (Temettü Takvimi) — WS: SRV_TEMETTU_TAKVIM
- IdealClient `request/dividendCalendar.ts` + `responses/dividendCalendar.ts`
- AppNavigator authenticated stack'e route'lar
- Header: AuthHeaderLogo (bigpara) + `headerBackTitle:""` ("Main" gizlendi)
- Calendar Row tarih formatı: ham ISO → `13 May 2026 · 05:00 · Güney Kore`
- Analiz tab'ı: Elliott Analizi → Ekonomik Takvim, Sıcaklık Haritası → Temettü Takvimi
- Commits: `b4dc1bb`, `3411914`, `fb9eadd`

### ListDelayedBadge (gecikmeli veri uyarısı)
- Sadece Detail.tsx'teydi → Markets/MarketsList + WatchList'e eklendi
- Floating banner (tab bar üstüne, flex column trick)
- Opak arka plan (`#FFF3E6`/`#2A1A0F`), ortalanmış metin, ikon kaldırıldı
- `pointerEvents="none"` (altındaki satır tetiklenmesin)
- Sadece `state.auth.demo === true`
- Commits: `50363e4`, `ab6b764`, `c2b1361`, `5639303`, `500751c`, `a2631c9`

### Döviz Çeviricisi (`src/screens/Tools/screens/DovizCeviricisiScreen.tsx`)
- `src/screens/Tools/data/currencyPairs.ts` oluşturuldu:
  - `CURRENCY_PAIRS` (67 parite, kod + tanım — iDealGo Pariteler ekranından)
  - `INDIVIDUAL_CURRENCIES` (33 bireysel para birimi, label + countryCode)
  - `findPairCode(from, to)` helper (direkt + inverted + USD pivot)
- Statik liste ile yeniden yazıldı (eski senetsBilgi dinamiğinden kurtuldu)
- Modal dropdown: uzun isim üstte, kısa kod altta, `react-native-flags` bayraklı
- **Tuzak**: `react-native-flags` `flags[type]['icons${size}']` lookup yapıyor;
  desteklenmeyen size (16, 32) → "Cannot convert undefined value to object" crash.
  `size={24}` kullan (Calendar/Row.tsx ve CompleteProfile'da denenmiş).
- Commits: `7386b23`, `972de9c`, `9a5d5e4`

---

## Voltran Auth (önceki çalışma, tamamlandı)

Detaylar için bu dosyanın git geçmişine bak. Özet: login + register + OTP + password reset + TOTP entegrasyonu. Tüm API çağrıları TOTP token ile (`tokenType: 2`, secret `JBSWY3DPEHPK3PXP`).

---

## Sıradaki Adım

**Faz 7 — Watchlist** için onay bekliyor.
