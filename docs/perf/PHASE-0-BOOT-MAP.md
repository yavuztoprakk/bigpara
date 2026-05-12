# Faz 0 — Boot Akış Haritası

**Statü**: Yalnız okuma. Hiçbir kod değiştirilmedi.
**Üretildiği tarih**: 2026-05-12
**Kapsam**: `App.tsx`, `BaseApp.tsx`, `src/routes/AppNavigator.tsx`, `src/store/**`, `src/modules/IdealClient/index.ts` (giriş), `src/modules/BigParaClient/index.tsx` (giriş), `src/modules/IdealClient/responses/handlers.ts`.

---

## 1. Sağlayıcı/Provider Zinciri

```
GestureHandlerRootView          [App.tsx]
└─ ThemeProvider #1             [App.tsx]              ← üst
   └─ Suspense fallback={null}  [App.tsx]
      └─ BaseApp                [BaseApp.tsx]
         └─ (fontLoaded ? render : null)               ← splash
            └─ SafeAreaProvider
               └─ FlashMessage (kardeş)
               └─ View backgroundColor=theme.darkerBrand
                  └─ ActionSheetProvider
                     └─ Redux Provider (store)
                        └─ PersistGate loading={null}  ← rehydrate beklenir
                           └─ PaperProvider
                              └─ ThemeProvider #2     ← DUPLICATE!
                                 └─ RootNavigation
                                 └─ Reconnect (kardeş)
```

---

## 2. Module-Load Yan Etkileri (import anında)

| Dosya | Etki |
|---|---|
| `App.tsx` | `Notifications.setNotificationHandler({...})` |
| `BaseApp.tsx` | `enableScreens(true)` |
| `BaseApp.tsx` | `numeral.register("locale", "tr", {...})` (try/catch) + `numeral.locale("tr")` |
| `BigParaClient/index.tsx` | `axios.interceptors.request/response.use(...)` — **her istek/cevap console.log** |
| `IdealClient/index.ts` | Module-level singletons: `ws`, `username`, `password`, `demo`, `sessionId`, timer'lar |
| `store/index.tsx` | `persistReducer` + `configureStore` + `persistStore` çağrısı |

---

## 3. Soğuk Açılış Kronolojisi

| # | Olay | Tetikleyici | Bloklayıcı? |
|---|------|-------------|-------------|
| 1 | Module imports + interceptor kurulumu | İlk import zinciri | Hayır |
| 2 | `App` render | RN root mount | — |
| 3 | `handleOrientationLock()` (App useEffect) | Mount | Hayır (async) |
| 4 | Android notification channel set (App useEffect) | Mount | Hayır (Android only) |
| 5 | `BaseApp` render (fontLoaded=false → `null`) | Provider zinciri | **Görsel boş** |
| 6 | `activateKeepAwakeAsync()` (BaseApp useEffect) | Mount | Hayır |
| 7 | `Font.loadAsync({NunitoSansRegular, NunitoSansBold})` | Mount | **EVET** — fontLoaded'ı kontrol ediyor |
| 8 | `setFontLoaded(true)` | Font yüklendi VEYA finally fail-safe | — |
| 9 | `BaseApp` re-render → Provider zinciri inşası | fontLoaded state | — |
| 10 | `PersistGate` AsyncStorage'dan store rehydrate | PersistGate mount | **EVET** — rehydrate bitene `loading={null}` |
| 11 | `RootNavigation` mount | PersistGate ready | — |
| 12 | `useSelector(isAuthenticated)` ilk değer (persisted) | Mount | — |
| 13 | Dot animasyonları başlar (`withRepeat -1`) | Mount useEffect | Hayır (UI thread) |
| 14 | `useEffect([isAuthenticated, dispatch])`: authenticated ise → `symbolArrayLength()` → `idealClientLogin(...)` | Mount + state | Hayır (async) |
| 15 | Stack render: authenticated→`Main`(TabRoot), değilse→`Welcome` | Mount | — |
| 16 | `NavigationContainer.onReady` → `previousRouteRef = initialRoute` | Mount | — |
| 17 | WebSocket bağlanır → login mesajı gönder → "35" cevabı → `handleLoginSuccess` dispatch | Async | Hayır |
| 18 | `isAuthenticated = true` (henüz değilse) | dispatch | — |
| 19 | `bruttakas` request gönderilir (varsayılan veri) | loginSuccess sonrası | Hayır |

**Bloklayıcı zincir** (en geç user-visible content'e kadar):
```
imports → App mount → BaseApp mount(null)
  → Font.loadAsync (paralel 2 dosya)
  → fontLoaded=true → re-render
  → PersistGate rehydrate (AsyncStorage)
  → RootNavigation mount → Stack initial screen render
```

---

## 4. Store Envanteri

**Toplam slice**: 38

**Persisted whitelist**:
- `auth`
- `preferences`
- `logs`
- `watchLists`
- `yatirimlar`

**Store config**:
- `serializableCheck: false` — non-serializable izin
- `immutableCheck: false` — mutation izin
- (Performans için bilinçli kapatılmış)

**Slice grupları (kabaca)**:
- Auth: `auth`, `preferences`, `pushNotifications`
- Markets (real-time): `prices`, `symbols`, `markets`, `chart`, `yieldStats`, `stats`, `brokerageStats`, `custodyChanges`, `ownerStats`, `levelStats`, `bilancoRapor`, `fundamentals`
- Watchlist: `watchLists`
- Araçlar: `senetsBilgi`, `yatirimlar`, `paramNeOldu`, `pivotAnalizi`, `kademeAnalizi`
- Diğer: `form`, `reconnect`, `bottomSheet`, `survey`, `ui`, `symbolBrokerages`, `columnForm`, `books`, `pageLastBrokerages`, `logs`, `calendar`, `alarms`, `dateForm`, `updates`, `tabStatusBrokerages`

---

## 5. WebSocket (IdealClient) Akışı

### Bağlanma
1. `login(user, pass, demo, symLen, authorized)` çağrısı module-level değişkenleri set eder ve `setupRealtimeSocket()`'i tetikler.
2. WebSocket open → `handleOpen()` → `request(loginRequestBuilder, demo)` ile login mesajı yollanır.
3. Heartbeat 15s, connection check 30s, verify connection 5s.

### Login Success (handlers.ts)
WebSocket'ten "35" mesajı geldiğinde:
1. Licences parse edilir
2. `handleLoginSuccess({ username, password, licences })` dispatch
3. Bu da `auth.isAuthenticated = true`, `auth.user` set eder
4. `bruttakas` request (varsayılan veri) gönderilir

### Login Trigger Yerleri (kim `login()` çağırıyor?)
- `Welcome.tsx` → `loginToDemo()` → guest socket
- `Login.tsx` → `onSubmit()` → real socket (eski, kullanılabilir)
- `LoginPassword.tsx` → `handleLogin()` → guest socket (bizim önceki değişiklik)
- `CompleteProfile.tsx` → `performRegister()` → guest socket (bizim önceki değişiklik)
- `SMSGGO/index.tsx` → broker SMS sonrası → real socket
- **`AppNavigator.tsx`** → `useEffect([isAuthenticated])` → `symbolArrayLength()` → `login()` (auth.user.username/password/demo ile)

---

## 6. BigParaClient (HTTP)

**Base**: `https://voltran-bff-test.demirorenmedya.com/api/v1/`
**Tenant**: `hurriyet`
**Endpoint'ler**:
- `checkUserExists`
- `otpSend`, `verifyOTP`, `reGenerateOTP`
- `registerAndLogin`
- `userLogin`
- `initiatePasswordReset`, `verifyPasswordResetOtp`, `completePasswordReset`

**Interceptor**: global request + response logger, koşulsuz `console.log`.

---

## 7. Bulgular (sadece kayıt — Faz 0'da düzeltilmeyecek)

### B-1 — Çift ThemeProvider [High, B-Phase 1]
`App.tsx` ve `BaseApp.tsx` her ikisinde de `<ThemeProvider>` var. İki provider iç içe — alttaki muhtemelen redundant. Context değer aynı bile olsa iki provider her render'da iki kez context çocuklarına yayar.

**Konum**: `App.tsx:59`, `BaseApp.tsx:224`.
**Önerilen aksiyon (Faz 1)**: Birini kaldır. `useTheme` üst Provider'dan değer alabiliyorsa BaseApp'in içindekini çıkar.

### B-2 — Dot animasyonları sonsuza dek çalışıyor [Medium, Faz 12]
Overlay görünür değilken bile `dot1/dot2/dot3` shared value'larında `withRepeat(-1)` aktif. UI thread'de olsa bile gereksiz.

**Konum**: `AppNavigator.tsx:97-113`.
**Önerilen aksiyon (Faz 12)**: `overlayActive=false` iken animasyonu durdur.

### B-3 — Mevcut "fake No-Flash" sistemi [Critical bağlam, Faz 12]
`triggerTransitionOverlay` + `ROUTE_MIN_VISIBLE_MS` (Detail 850ms, MarketsList 600ms vb.) **görsel gizleme** yapıyor — ekran içinde data henüz yokken kullanıcı 850ms boyunca loader görüyor. Bu Kural 1'i (No-Flash) gerçek anlamda sağlamaz, **simüle eder**.

**Önerilen aksiyon**: Gerçek No-Flash (caller-prefetch) sağlandıkça ROUTE_MIN_VISIBLE_MS azaltılır/kaldırılır. Faz 12 bu sistemi yeniden değerlendirir.

### B-4 — Çift WebSocket login zinciri [Critical, Faz 4]
Trace:
1. `LoginPassword.handleLogin` → `idealClientLogin(usergck_X, "ColendiMenkul1", true, "0", "0")` (400ms gecikmeli)
2. WebSocket connects → login msg → "35" cevabı → `handleLoginSuccess` dispatch
3. `auth.isAuthenticated = true`
4. `AppNavigator` useEffect tetikleniyor → `symbolArrayLength()` → `idealClientLogin(auth.user.username, auth.user.password, auth.demo, len, "0")` **TEKRAR**

Sonuç: aynı kullanıcı için 2 ardışık login çağrısı. İkincisi var olan socket'i kapatıp yeniden açabilir.

**Pre-existing**: bu zincir bizim değişikliklerimizden önce de mevcut. Sadece artık `auth.demo=false` (bizim setAuthLoading dispatch'imiz) ile ilk login `isDemo=true`, ikinci login `isDemo=false` parametresiyle gidiyor → **demo modu farkı**!

**Konum**: `AppNavigator.tsx:206-235`, `LoginPassword.tsx:133-135`, `CompleteProfile.tsx:160-162`.
**Önerilen aksiyon (Faz 4)**: AppNavigator effect'i kaldırmak yerine "zaten login deniyorsa ikinci kez deneme" guard'ı koymak. **Fonksiyonelliği bozmamak için dikkatli inceleme şart.**

### B-5 — Axios interceptor production'da log atıyor [Medium, Faz 0 sonu]
Tüm `[AXIOS][REQ]` / `[AXIOS][RES]` koşulsuz `console.log`. Performans + log gürültüsü + güvenlik (response body'sinde token'lar var).

**Konum**: `BigParaClient/index.tsx:22-66`.
**Önerilen aksiyon**: `if (__DEV__) ...` koşullu sarmak. Tek satırlık, bağımsız fix — Faz 0 kapanışında yapılabilir.

### B-6 — `Reconnect` her zaman mount [Low, Faz 12]
Authenticated olmasa bile `<Reconnect />` BaseApp root'unda. `state.reconnect` slice'ına subscribe.

**Konum**: `BaseApp.tsx:230`.
**Önerilen aksiyon (Faz 12)**: Lazy mount veya conditional render değerlendirmesi.

### B-7 — AppNavigator `@symbolDefinationlength` her seferinde okunuyor [Low, Faz 1]
isAuthenticated true olduğunda her seferinde AsyncStorage okuyor. Cache veya store'dan oku.

**Konum**: `AppNavigator.tsx:206-214`.

### B-8 — `serializableCheck: false`, `immutableCheck: false` [Bilgi]
Performans için kapalı. Doğru karar ama bu, RTK'nın "yanlışlıkla mutate ediyorum" uyarısını da kapatıyor. Bilinçli karar olarak kabul.

### B-9 — TabRootNavigator initial tab + No-Flash [Critical, Faz 5]
Authenticated kullanıcı için `Main` (TabRoot) mount olduğunda hangi tab initial? Markets ise WebSocket'ten henüz veri gelmemiş olabilir → kullanıcı boş/skeleton görür → **Kural 1 ihlali**. Faz 5'te trace edilecek.

### B-10 — `BaseApp.tsx` import `import { updateToken, updateLastNotification } from "./src/modules/pushNotifications"` kullanılmıyor [Trivial]
Hot path değil, atıl import.

**Konum**: `BaseApp.tsx:18-22`.

---

## 8. Faz 1 — Cold Start için somut başlangıç soruları

Bunlar Faz 1'in statik analiz raporunda cevaplanacak:

1. **B-1** çift ThemeProvider'ı kaldırmak güvenli mi? (Theme context tek seferden mi okunmalı, ikinci provider override mı yapıyor?)
2. Font load 2 dosya **paralel** yükleniyor — bu doğrulandı, OK.
3. Persist rehydrate süresini etkileyen şey: AsyncStorage I/O + JSON parse. Whitelist (5 slice) yeterince küçük mü?
4. `B-7` `symbolArrayLength`'i AppNavigator'dan çıkarmak güvenli mi? (Yer değiştirme adayı: doğrudan login butonunun olduğu yer, ki orada zaten idealClientLogin çağrısı var.)
5. `__DEV__` koşullu axios log → tek satırlık güvenli fix mi? (B-5)
6. App.tsx'deki orientation lock + Android notification channel sıralı useEffect'ler — paralel olabilir mi? (Tek seferlik etki, etki süresi düşük, optimize etmeye değmez.)

---

## 9. Faz 1 — Cold Start Kapsamı

Bir sonraki faz şunları yapacak:

- `App.tsx` ve `BaseApp.tsx`'i statik analiz checklist'inin 10 başlığı (A-J) için tek tek incelemek.
- Çift Provider hipotezini doğrulamak.
- Persist rehydrate süresine kabaca bakmak (test mümkünse).
- Bulguları H/M/L tablosu olarak sunmak.
- **Onay sonrası** sadece seçilen bulguları düzeltmek. Düzeltilenler:
  - null check, try/catch, flash message hiçbir yerden silinmeyecek.
  - Sadece fix'in hedefi olan satır(lar) değişecek.
- Tek commit: `perf(faz-1): cold start`.

---

## 10. Sonuç

Faz 0 tamamlandı. Boot akışı haritası ve 10 bulgu çıkarıldı. **Hiçbir kod değişmedi.**

**Sonraki adım**: Faz 1 (Cold Start) onayını bekliyorum. Onaylarsan App.tsx + BaseApp.tsx için statik analiz raporu çıkarırım (hala kod değiştirmeden), bulguları H/M/L tablo olarak sunarım, hangilerini fix edeceğimizi sen seçersin, sonra dokunulur.
