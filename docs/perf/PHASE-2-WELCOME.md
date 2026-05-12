# Faz 2 — Welcome Ekranı

**Statü**: Statik analiz tamamlandı. Hiçbir kod değiştirilmedi.
**Üretildiği tarih**: 2026-05-12
**Dosya**: `src/screens/Auth/Welcome/Welcome.tsx` (421 satır)

---

## 1. Kısa Profil

- **Tip**: Static UI screen (veri çekimi yok)
- **State**: Yok (sadece 5 shared value)
- **Side effects**: 1 useEffect (mount animasyonları)
- **Children**: LinearGradient, Animated.View, TouchableOpacity, Image, Ionicons
- **Hooks**: useTheme (1), useSharedValue (5), useAnimatedStyle (5), useEffect (1)

---

## 2. Statik Analiz Bulguları (H/M/L)

| ID | Bulgu | Konum | Etki | Risk | Kategori |
|----|-------|-------|------|------|----------|
| **W1** | `Platform.select({...})` JSX style içinde inline — 3 yerde (primary/secondary/ghost butonlar) her render'da yeni shadow obje üretir | 207-216, 245-253 | **H** | Düşük (Platform.select module-level + StyleSheet'e taşı) | A/D |
| **W2** | LinearGradient `colors={[...]}` inline array — 4 yerde (3'ü statik #renkler, 1'i isDark koşullu) | 136-140, 148-152, 156-160, 202-204 | M | Düşük (module-level const veya useMemo) | A/D |
| **W3** | `onPress={() => navigation.navigate("Login")}` ve `onPress={() => navigation.navigate("Register")}` inline arrow | 198, 236 | M | Düşük (useCallback) | A |
| **W4** | Inline style objeleri (`{color, fontFamily}`, `{marginRight: 8}`, vb.) çok sayıda | 7+ yer | M | Orta (memoize gerekir, çok yer dokunulur) | A/D |
| **W5** | `loginToDemo` içinde **try/catch yok** — `Network.getNetworkStateAsync()` veya `Application.getIosIdForVendorAsync()` reject ederse fonksiyon kırılır (handler yok) | 110-131 | **H** (sağlamlık) | Düşük (try/catch ekle) | E |
| **W6** | `import * as Network`, `import * as Application` — Expo idiomatic, etki yok | 21-22 | L | Yok | G |
| **W7** | 5 ayrı `useAnimatedStyle` — her biri farklı elemana, konsolide edilemez | 72-102 | L | — | F (bilgi) |
| **W8** | `accent`, `subtle`, `btnBorder`, `themeIcon` her render'da yeniden hesaplanıyor — ucuz string operasyonları | 37-41, 108 | L | Yok | (bilgi) |
| **W9** | `loginToDemo`/`cycleTheme` `useCallback` yok ama prop olarak child'lara geçmiyor → re-render etkisi yok | — | L | — | B (bilgi) |
| **W10** | Buton tap'inden WebSocket login success'e kadar **kullanıcıya hiçbir loading göstergesi yok** — kullanıcı tekrar tıklayabilir | 110-131 | M (UX) | Orta (button disabled / loading state ekle) | I (No-Flash) |

---

## 3. No-Flash Trace

**Welcome'a giriş** (cold start, unauthenticated):
- AppNavigator initial route → Welcome mount → animasyonlar başlar → JSX render
- Veri çekimi yok → **No-Flash ✓**

**Welcome'dan çıkış** (buton tap):

### A) Login / Register butonu
- `navigation.navigate("Login")` veya `("Register")`
- Stack push → AppNavigator `onStateChange` → `triggerTransitionOverlay` çalışır (default 320ms)
- Hedef ekran (Login/Register) mount olur, içinde async iş varsa overlay altında saklanır
- **Kural 1 uyumu**: Hedef ekrana göre değişir (Faz 3/4'te incelenecek)

### B) Şimdilik Misafir Olarak Devam Et
- `loginToDemo()` çağrılır
- `Network.getNetworkStateAsync()` → bağlantı yoksa flash + return (✓)
- `IdealClientLogin(usergck_X, "ColendiMenkul1", true, "0", "0")` → WebSocket bağlantısı başlar
- `store.dispatch(initiateLogin(true, true))` → loading=true, demo=true
- **⚠️ Bu noktada Welcome hâlâ görünür, hiçbir loading state yok** (W10)
- WebSocket bağlanır → login msg → "35" cevabı → `handleLoginSuccess` dispatch
- `state.auth.isAuthenticated = true` → AppNavigator Stack switch (Welcome unmount, Main mount)
- AppNavigator overlay tetiklenir (transition)
- TabRoot → Markets mount → **No-Flash ihlali** (Faz 5)

**Welcome içi flash**: Yok ✓
**Welcome'dan sonraki ekran flash'i**: Faz 3/4/5'te.

---

## 4. Double-Render Trace

| Render | Tetikleyici | Kaçınılabilir? |
|--------|-------------|----------------|
| 1 | Mount | Hayır |
| 2 | (yok) | — |

useEffect → shared value updates → UI thread'de animasyonlar → JS thread'de re-render TETİKLEMEZ. ✓

**Tek render** sağlanmış durumda.

Theme toggle:
- `cycleTheme()` → ThemeProvider state update → tüm tree re-render → Welcome 1 kez re-render
- Bu kullanıcı eylemi, kaçınılmaz.

---

## 5. Önerilen Aksiyon Planı

### Grup 1 — Önerilen (yüksek etki / orta etki, düşük risk)

| ✅ | ID | İş |
|---|----|-----|
| [ ] | **W1** | Platform.select shadow'larını module-level const + StyleSheet entegre et |
| [ ] | **W2** | LinearGradient statik `colors` arraylarını module-level const yap; isDark koşullu olanı useMemo'la sarmala |
| [ ] | **W3** | `goToLogin`, `goToRegister` `useCallback`'le sarmala |
| [ ] | **W5** | `loginToDemo` içindeki async çağrıları **try/catch**'e al; hata olursa kullanıcıya flashMessage göster; **mevcut akışı bozma** |
| [ ] | **W10** | Buton'a `loading` state ekle, tap sonrası `disabled={loading}` ve loading ikonu; **(opsiyonel — UX iyileştirme, performans değil)** |

### Grup 2 — İskip (cosmetic / impact yok)

| ✅ | ID | İş |
|---|----|-----|
| [ ] | W4 | Inline {color, fontFamily} memoize — geniş refactor, getiri sınırlı |
| [ ] | W6 | Wildcard import → named (Expo'nun önerdiği yazım) |
| [ ] | W8 | Local computation'ları useMemo (ucuz) |

---

## 6. Fonksiyonelliği Koruma Sözleri

- `loginToDemo` mevcut davranışını **aynen** koruyacak (sadece try/catch sarması eklenecek)
- `flashMessage` çağrısı zaten var, ek hata durumlarında da flashMessage ile bildireceğiz
- `IdealClientLogin` çağrısı ve `store.dispatch` aynen kalacak
- Animasyon timing ve sıralaması değişmeyecek
- Hiçbir UI elementi kaldırılmayacak

---

## 7. W5 — Detaylı çözüm (örnek)

Mevcut:
```ts
const loginToDemo = async () => {
  const net = await Network.getNetworkStateAsync(); // exception fırlatabilir
  if (!net.isConnected) { ... }
  // ...
  if (Platform.OS === "ios" && Application.getIosIdForVendorAsync) {
    const iosId = await Application.getIosIdForVendorAsync(); // exception fırlatabilir
    ...
  }
  IdealClientLogin(...);
  store.dispatch(initiateLogin(true, true));
};
```

Önerilen (try/catch sarması, mevcut akış korunur):
```ts
const loginToDemo = async () => {
  try {
    const net = await Network.getNetworkStateAsync();
    if (!net.isConnected) {
      flashMessage({ type: "danger", message: "Lütfen ağ bağlantınızı kontrol ediniz!" });
      return;
    }

    let deviceId: string | undefined;
    if (Platform.OS === "ios" && Application.getIosIdForVendorAsync) {
      const iosId = await Application.getIosIdForVendorAsync();
      deviceId = iosId?.split("-").pop();
    } else if (Platform.OS === "android") {
      deviceId = Application.getAndroidId();
    }

    const userId = `usergck_${deviceId}`;
    IdealClientLogin(userId, "ColendiMenkul1", true, "0", "0");
    store.dispatch(initiateLogin(true, true));
  } catch (e: any) {
    console.error("loginToDemo failed:", e?.toString?.() ?? e);
    flashMessage({
      type: "danger",
      message: "Bağlantı sırasında bir hata oluştu. Lütfen tekrar deneyin.",
    });
  }
};
```

---

## 8. Soru: Hangileri uygulanacak?

**Grup 1**:
1. W1 — Platform.select shadow → module/StyleSheet
2. W2 — LinearGradient colors → const/useMemo
3. W3 — navigate fonksiyonları → useCallback
4. W5 — loginToDemo try/catch
5. W10 — Buton loading state (opsiyonel UX)

Tek commit: `perf(faz-2): welcome inline ref'leri sabitle + try/catch koruma`.
