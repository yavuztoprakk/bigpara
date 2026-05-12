# Faz 1 — Cold Start (App.tsx + BaseApp.tsx)

**Statü**: Statik analiz tamamlandı. Hiçbir kod değiştirilmedi.
**Üretildiği tarih**: 2026-05-12

---

## 1. Kapsam

- `App.tsx` (entry)
- `BaseApp.tsx` (provider tree + font/rehydrate gate)
- `app.json` splash konfigürasyonu

## 2. Statik Analiz Bulguları (H/M/L)

### App.tsx (~67 satır)

| ID | Bulgu | Konum | Etki | Risk | Kategori |
|----|-------|-------|------|------|----------|
| **A1** | `<GestureHandlerRootView style={{ flex: 1 }}>` inline obje | App.tsx:58 | L | Yok | D (Stil) |
| **A2** | `BackHandler.removeEventListener` polyfill render body'sinde — her render'da reassign | App.tsx:53-55 | L | Yok | A (Re-render) |
| **A3** | 2 ayrı `useEffect([])` (orientation + Android channel) tek olabilir | App.tsx:34-50 | L | Yok | E (I/O) |

### BaseApp.tsx (~240 satır, çoğu yorum)

| ID | Bulgu | Konum | Etki | Risk | Kategori |
|----|-------|-------|------|------|----------|
| **B1** | `paperTheme` **inline obje** her render'da yeni ref → `<PaperProvider>` her render'da yeni context | BaseApp.tsx:64-71 | **H** | Düşük (useMemo) | A/B |
| **B2** | **Çift `<ThemeProvider>`** (App.tsx:59 + BaseApp.tsx:224) — context iki kez sarılı | BaseApp.tsx:224 | **H** | Orta (kaldır) | A |
| **B3** | `<FlashMessage position={...}>` inline koşullu obje (Android) | BaseApp.tsx:208-216 | M | Düşük (useMemo) | A/D |
| **B4** | `<View style={{ height: "100%", backgroundColor: theme.darkerBrand }}>` inline obje | BaseApp.tsx:219 | M | Düşük (useMemo) | A/D |
| **B5** | Atıl import: `updateToken`, `updateLastNotification` | BaseApp.tsx:18-22 | L | Yok | G (Import) |
| **B6** | `import * as numeral`, `import * as Font` — sadece bir-iki fonksiyon kullanılıyor | BaseApp.tsx:11, 16 | L | Yok | G |
| **B7** | `setFontLoaded(prev => prev || true)` finally'de redundant (try zaten true yapıyor) | BaseApp.tsx:108-111 | L | Yok | E |

### Cold start akış bulguları

| ID | Bulgu | Konum | Etki | Risk | Kategori |
|----|-------|-------|------|------|----------|
| **C1** | **`expo-splash-screen` kullanılmıyor**: Native splash JS render olur olmaz gizleniyor, ardından `BaseApp` `null` döndürdüğü için 100-500ms boyunca **beyaz boş ekran flash'i** | App.tsx, BaseApp.tsx + app.json | **H** | Orta | I (No-Flash) |
| **C2** | `PersistGate loading={null}` — rehydrate sırasında boş ekran (theme bg görünür ama içerik yok) | BaseApp.tsx:222 | M | Düşük | I (No-Flash) |
| **C3** | `fontLoaded` state → `setFontLoaded(true)` re-render tetikliyor (1 zorunlu re-render) | BaseApp.tsx | L | — | J (Double-render) |

---

## 3. No-Flash Trace (cold start)

```
T0  Native splash görünür (expo default, splash-icon.png)
T1  JS bundle yüklendi → App render → BaseApp render
T2  BaseApp `fontLoaded=false` → return null
    ⚠️ Native splash JS'in render ettiğini görünce gizleniyor
    → BEYAZ/BOŞ EKRAN (C1)
T3  Font.loadAsync paralel 2 dosya → bitti → setFontLoaded(true)
T4  BaseApp re-render → SafeAreaProvider + View(theme.bg) görünür
    Ama PersistGate `loading={null}` → İÇERİK YOK, sadece theme bg (C2)
T5  Rehydrate tamamlandı → RootNavigation mount → initial screen render
T6  İlk ekran (Welcome veya Main) görünür
```

**İhlal noktaları**:
- **T2 → T3** arası: native splash zaten gitmiş, font yüklenmemiş → **beyaz flash** (C1)
- **T4 → T5** arası: rehydrate beklenir → **theme renkli boş alan** (C2)

**Çözüm yolu**: `expo-splash-screen` + `preventAutoHideAsync()` + tüm hazırlıklar bitince `hideAsync()`. Bu sayede native splash, rehydrate bitene kadar görünür kalır. (T6'ya kadar native splash.)

---

## 4. Double-Render Trace (cold start)

```
Render 1: App mount
Render 2: BaseApp mount (fontLoaded=false → null)
Render 3: useEffect → Font.loadAsync.then → setFontLoaded(true)
          → BaseApp re-render (provider tree inşa)
Render 4: PersistGate ready → RootNavigation mount
Render 5: useSelector(isAuthenticated) → initial screen render
```

**Zorunlu çift render**:
- BaseApp 2→3: font load gate gereği. **Kaçınılmaz.**
- RootNavigation re-renders if `isAuthenticated` değişirse (login sonrası). Cold start'ta tek sefer.

**Kaçınılabilir çift render**:
- **B1** (paperTheme): theme değişmedikçe her parent render'da Paper'a yeni `theme` prop geliyor → Paper internals re-render. Memoize ile kesilir.
- **B2** (Çift ThemeProvider): Theme değişiminde **iki kez** context yayılımı.

---

## 5. Önerilen Aksiyon Planı (onay bekler)

Aşağıdaki gruplara ayrılmış. Sen hangilerini onaylarsan ona göre fix uygulanır.

### Grup 1 — Kesin yapılması önerilen (yüksek etki, düşük risk)

| ✅ | ID | İş |
|---|----|------|
| [ ] | **B1** | `paperTheme`'ı `useMemo(() => ({...DefaultTheme, ...}), [theme.darkerBrand])` ile sarmala |
| [ ] | **B2** | BaseApp'in içindeki ikinci `<ThemeProvider>`'ı kaldır (App.tsx'teki üstte kalır) |
| [ ] | **B3** | `FlashMessage position` prop'unu `useMemo` ile sarmala |
| [ ] | **B4** | `<View style={...}>` stilini `useMemo` ile sarmala |
| [ ] | **C1** | `expo-splash-screen` kurulumu + `preventAutoHideAsync` + tüm hazırlıklar bitince `hideAsync` |
| [ ] | **B5** | Kullanılmayan importları temizle (`updateToken`, `updateLastNotification`) |

### Grup 2 — Düşük etki, opsiyonel (skipping önerilir)

| ✅ | ID | İş |
|---|----|------|
| [ ] | **A1** | `style={{ flex: 1 }}` → `styles.root` (cosmetic) |
| [ ] | **A2** | `BackHandler` polyfill module-level'a taşı (cosmetic) |
| [ ] | **A3** | 2 useEffect → 1 useEffect (cosmetic) |
| [ ] | **B6** | `import { loadAsync } from "expo-font"` (cosmetic) |
| [ ] | **B7** | Redundant `setFontLoaded(prev => prev || true)` finally kaldır (cosmetic) |
| [ ] | **C2** | `PersistGate loading={...}` → bigpara loader inject — **C1 yapılırsa ihtiyaç kalmaz** |

---

## 6. Fonksiyonelliği Koruma Sözleri (her fix için)

Aşağıdaki garanti'ler tüm fix'lerde sağlanacak:

1. `try/catch` blokları silinmeyecek.
2. `flashMessage` çağrıları silinmeyecek.
3. Null check'ler (örn. `auth?.user?.username`) silinmeyecek.
4. `console.error` loglar silinmeyecek (kullanıcı kararı yoksa).
5. Native splash → JS splash geçişinde **görsel kesinti olmayacak**.
6. **C1** uygulanırken: `SplashScreen.preventAutoHideAsync()` `try/catch` ile sarılacak (Expo Go gibi ortamlarda hata verebilir, sessizce yutmayacağız).
7. Font load `catch` block'u korunacak.

---

## 7. C1 — Detaylı çözüm planı (sadece onay verirsen)

```ts
// App.tsx (en üstte, import'lardan sonra)
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync().catch((e) => {
  console.warn('SplashScreen.preventAutoHideAsync failed:', e);
});

// BaseApp.tsx (loadAppResources'ın FINALLY block'unda)
finally {
  setFontLoaded((prev) => prev || true);
  try {
    await SplashScreen.hideAsync();
  } catch (e) {
    console.warn('SplashScreen.hideAsync failed:', e);
  }
}
```

**Risk**:
- Expo Go dev modunda `expo-splash-screen` zaten built-in. `hideAsync` çağrısı no-op olabilir. Test gerekir.
- Hide etmediği takdirde uygulama kilitlenmiş hisseder — bu yüzden `finally`'de garanti hide.
- Yüklenecek paket: `expo-splash-screen` (Expo SDK uyumlu sürüm).

---

## 8. Soru: Hangileri uygulanacak?

Lütfen aşağıdakileri seç (örn. "1, 2, 3, 5, 6 yap" veya "Grup 1 hepsi"):

**Grup 1 (önerilen)**:
1. B1 — paperTheme useMemo
2. B2 — Çift ThemeProvider'ı kaldır
3. B3 — FlashMessage position useMemo
4. B4 — View style useMemo
5. C1 — `expo-splash-screen` ile gerçek No-Flash cold start
6. B5 — Atıl import temizle

**Grup 2 (skip önerilir, ama istersen)**:
7-12. Cosmetic fix'ler (A1, A2, A3, B6, B7, C2)

Onay verir vermez fix'lere geçerim. Hepsi tek commit (`perf(faz-1): cold start`).
