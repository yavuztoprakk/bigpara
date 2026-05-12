# Faz 4 — LoginPassword Ekranı

**Statü**: Statik analiz tamamlandı. Hiçbir kod değiştirilmedi.
**Üretildiği tarih**: 2026-05-12
**Dosya**: `src/screens/Auth/components/LoginPassword.tsx` (1090 satır)
**Ek dosya**: `src/routes/AppNavigator.tsx` (B-4 kritik fix için)

---

## 1. B-4 — Çift WebSocket Login Zinciri (CRITICAL)

### Trace

```
1. LoginPassword.handleLogin tap
2. BigPara userLogin API → success → setVoltranTokens dispatch
3. setAuthLoading({ remember: false, demo: false }) dispatch
4. 400ms setTimeout → idealClientLogin(usergck_X, "ColendiMenkul1", true, "0", "0")
5. WS CONNECTING (readyState=0)
6. WS OPEN (readyState=1) → handleOpen → sends login msg
7. Server "35" → handleLoginSuccess({ username, password, licences }) dispatch
8. state.auth.user = { usergck_X, "ColendiMenkul1", [licences] }, isAuthenticated=true
9. AppNavigator useEffect on [isAuthenticated] FIRES
10. symbolArrayLength():
    - AsyncStorage @symbolDefinationlength oku
    - login(auth.user.username, auth.user.password, auth.demo, len, "0")
    - = login("usergck_X", "ColendiMenkul1", false, len, "0")  ← demo=FALSE!
11. IdealClient.login() içinde: ws.readyState <= 1 → ws.close() → setupRealtimeSocket()
12. YENİ WS bağlantısı (isDemo=false bu sefer, ÖNCEKİYLE FARKLI)
13. Yeni WS OPEN → login msg → "35" → handleLoginSuccess (TEKRAR)
```

### Sonuç
- **2 ardışık WebSocket bağlantısı** kuruluyor (ilki kapatılıp ikinci açılıyor)
- **2 ardışık login mesajı**, **2 ardışık `handleLoginSuccess` dispatch**
- **demo modu uyumsuzluğu**: ilk bağlantı `isDemo=true`, ikinci `isDemo=false`
- Boşa CPU, network, server-side oturum açma maliyeti

### Çözüm

`AppNavigator.tsx symbolArrayLength` fonksiyonuna **WS open guard** ekle:
```ts
const symbolArrayLength = async () => {
  // Eğer WS zaten authenticated state'i sağlamış ise (LoginPassword,
  // CompleteProfile veya Welcome misafir akışından), tekrar login deneme.
  if (ws && ws.readyState === 1) return;
  // ... mevcut kod aynen
};
```

**Risk**: Düşük. Cold start senaryosunda (persisted state isAuthenticated=true ama ws henüz yok) `ws` undefined olduğu için guard tetiklenmez, mevcut login() davranışı korunur.

**Etki**: Kritik. Çift login zinciri kesilir; LoginPassword'dan başlatılan tek WS bağlantısı yaşar.

---

## 2. LoginPassword Statik Analiz (H/M/L)

### Re-render / Memoization (A, B)

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **P1** | `Platform.select(...)` inline 5 yerde (changeBtn, primaryBtn, modalIconWrap, modalPrimaryBtn, vb.) | birçok | **H** | Düşük |
| **P2** | LinearGradient `colors={[...]}` inline 7+ yer | birçok | **H** | Düşük |
| **P3** | LinearGradient start/end inline `{x,y}` obje | birçok | M | Düşük |
| **P4** | `onPress={() => navigation.goBack()}` inline | 388 | L | Düşük |
| **P5** | handleLogin `useCallback` yok — prop drilling yok, kritik değil | 93 | L | — |

### Stil (D)

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **P6** | Inline style objeleri (`{color, fontFamily}`, `{marginRight: N}`) çok yer | birçok | M | Orta |

### Network/IO (E)

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **P7** | handleLogin try/catch ile sarılı ✓ | 93-143 | — | ✓ |
| **P8** | handleForgot* tüm 3 fonksiyon try/catch ✓ | 157-261 | — | ✓ |
| **P9** | `flashMessage` tüm hata yollarında ✓ | birçok | — | ✓ |

### No-Flash / Double-render (I, J)

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **P10** | handleLogin global overlay tetiklenmiyor — kullanıcı buton-içi spinner görüyor | 93-143 | M (UX) | Düşük |
| **P11** | Login formu için **veri çekimi yok** (route.params yeterli) → No-Flash ✓ | mount | — | ✓ |
| **P12** | useState(false) initial → mount → 1 render. setLoading(true) → 2. render. API resolved → setLoading(false) (hata case) veya unmount (success) — kontrollü | 93+ | — | ✓ |

### B-4 ile bağlantı

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **P13** | LoginPassword'da setAuthLoading dispatch sonrası AppNavigator'ın **çift login zinciri** tetikleniyor (B-4) | LoginPassword.tsx:132, AppNavigator.tsx:241-257 | **CRITICAL** | Düşük (guard ile) |

---

## 3. No-Flash + Double-render Trace

### Account.Login → LoginPassword geçişi
1. `handleLogin` Account.tsx'te → `transitionOverlayRef.show()` (Faz 3'te ekledik) → API → navigate("LoginPassword")
2. AppNavigator `onStateChange` → mevcut `triggerTransitionOverlay`
3. LoginPassword mount → render 1: route.params okunuyor, useState'ler initial → JSX render
4. Overlay min visible süresi sonra fade-out
5. Kullanıcı şifre girer

**Flash yok ✓** (route.params zaten dolu, veri çekimi yok)

### LoginPassword.handleLogin tap → Main mount
1. handleLogin → userLogin API → setVoltranTokens dispatch → setAuthLoading dispatch
2. (Burada global overlay tetiklenmiyor — P10) → buton-içi `ActivityIndicator` görünür
3. 400ms setTimeout → idealClientLogin
4. WS connects → loginSuccess → isAuthenticated=true
5. **B-4 çift login** (P13) — düzeltilecek
6. Stack switch (Welcome/Login stack → Main stack) → onStateChange → triggerTransitionOverlay
7. Main mount

**Flash riskleri**:
- Adım 1-2: buton-içi loading (UX iyileştirme — P10 ile global overlay)
- Adım 5: B-4 çift login ile bağlantı süreci uzar (zaman kaybı)

---

## 4. Önerilen Aksiyon Planı

### Grup 1 — KRİTİK

| ✅ | ID | İş |
|---|----|------|
| [ ] | **P13** | AppNavigator.symbolArrayLength'e `if (ws && ws.readyState === 1) return;` guard ekle (B-4 fix) |
| [ ] | **P10** | handleLogin'e Welcome/Account paterni: tap → `transitionOverlayRef.show()`, hata → `hide()`, success → açık kalıyor |

### Grup 2 — Yüksek etki

| ✅ | ID | İş |
|---|----|------|
| [ ] | **P1** | Module-level Platform.select shadow sabitleri (CHANGE_BTN_SHADOW, PRIMARY_BTN_SHADOW, MODAL_ICON_SHADOW, MODAL_PRIMARY_SHADOW) |
| [ ] | **P2** | Module-level LinearGradient `as const` tuples (ORB_TOP/BOTTOM/AVATAR/PRIMARY/MODAL colors) + bg gradient useMemo |
| [ ] | **P3** | Module-level gradient start/end sabitleri |
| [ ] | **P4** | `goBack` useCallback'le sarmala |

### Grup 3 — Düşük etki / skip

| ✅ | ID | İş |
|---|----|------|
| [ ] | P5 | handleLogin useCallback — gerek yok |
| [ ] | P6 | Inline style objelerin tamamı — çok yer, sınırlı getiri |

---

## 5. Fonksiyonelliği Koruma Sözleri

- Tüm `try/catch` blokları korunacak
- Tüm `flashMessage` çağrıları korunacak
- `setLoading(false)` reset sıralamaları korunacak
- BigPara API parametreleri (`userLogin`, `initiatePasswordReset`, `verifyPasswordResetOtp`, `completePasswordReset`) aynen kalacak
- `setVoltranTokens` ve `setAuthLoading` dispatch parametreleri aynen kalacak
- `idealClientLogin` parametreleri aynen kalacak (`usergck_${email}`, `"ColendiMenkul1"`, `true`, `"0"`, `"0"`)
- 400ms setTimeout race-condition koruması korunacak
- Forgot Password 3-adımlı modal flow korunacak
- AppNavigator'daki guard sadece **ws açıkken** atlayacak; cold start ws-undefined case'inde mevcut davranış korunacak

---

## 6. Soru: Hangileri uygulanacak?

Önerim: **Grup 1 + Grup 2** (Grup 3 skip).

- Grup 1: P13 (B-4 fix) + P10 (global overlay)
- Grup 2: P1, P2, P3, P4

Tek commit: `perf(faz-4): çift login zincirini kes + loginpassword re-render azalt`.
