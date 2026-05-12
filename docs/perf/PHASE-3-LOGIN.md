# Faz 3 — Login Ekranı

**Statü**: Statik analiz tamamlandı. Hiçbir kod değiştirilmedi.
**Üretildiği tarih**: 2026-05-12
**Dosya**: `src/screens/Account/components/Account.tsx` (**2058 satır**)

> **Önemli düzeltme**: PLAN.md'de Faz 3 kapsamı `Auth/Login/...` altındaki dosyalardı ama orası **ölü kod** (LoginContainer hiçbir yerde import edilmiyor). Gerçek Login ekranı `Account.tsx` — auth'lu değilse Login formu, auth'lu ise profil görüntüleyen **dual-role component**. Bu raporda sadece **login (auth'lu olmayan) yolu** ele alınıyor; profil bölümü Faz 11'e kalıyor.

---

## 1. Yapı Özeti

**Ana component**: `Account` (line 214-...)
- 6 `useSelector` (auth.isAuthenticated, auth.loading, auth.user, auth.demo, yatirimlar)
- 15+ `useState` (login form + forgot password 3-step modal)
- `useLayoutEffect`: header right'a tema toggle butonu set ediyor
- `useEffect`: AsyncStorage `@startScreen` okuyor
- `handleLogin` async (checkUserExists API → hasUser ? LoginPassword : OtpVerify)
- 3-adımlı Forgot Password modal (initiate → verifyOtp → completeReset)
- Render: `if (isAuthenticated) return <Profil>` veya `return <LoginForm>`

**Yardımcı componentler (aynı dosyada)**:
- `ThemeToggleHeaderButton` — header'a inject ediliyor
- `StaggerIn` — fade-slide animasyon wrapper
- `AvatarBounce` — scale-bounce animasyon wrapper
- `ProfileMenuItem` — auth'lu profile rotası (Faz 11 konusu)

---

## 2. Statik Analiz Bulguları (H/M/L)

### Re-render tetikleyicileri (A)

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **L1** | `useSelector(s => s.yatirimlar?.list \|\| [])` — `list` undefined ise her dispatch'te yeni `[]` referansı → her action'da re-render | 222 | **H** | Düşük |
| **L2** | `useLayoutEffect(...)`'in deps array'inde `toggleTheme` var — context'ten gelen fonksiyon; ThemeProvider'da `useMemo` ile stabil (`value = useMemo(() => ({ theme, toggleTheme }), [theme])`), ama `toggleTheme` aslında her render'da yeni — sonuçta header her render'da set ediliyor | 244-253 | M | Düşük |
| **L3** | `Platform.select({...})` inline JSX içinde 8+ yer (avatar shadow, badge shadow, bordered cards) | 569-578, 1077-1086, 1114-1123, vb. | **H** | Düşük |
| **L4** | LinearGradient `colors={[...]}` inline array 10+ yer (hero, orb'lar, avatar, badge) | 517-527, 530-534, 538-542, 583, 1018-1028, 1090-1094, vb. | **H** | Düşük |
| **L5** | LinearGradient `start={{x,y}}` `end={{x,y}}` inline obje çok yer | birçok | M | Düşük |
| **L6** | Inline style `{...}` objeleri çok yer (input border conditional, card bg, vb.) | birçok | M | Orta (refactor) |
| **L7** | `useSelector(s => s.auth.user)` her dispatch'te referans aynı kaldığı sürece OK; `user` direkt slice → güvenli | 220 | L | — |

### Memoization (B)

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **L8** | `handleLogin`, `handleLogout`, `handleDeleteAccount`, `handleForgot*` `useCallback` yok — Account içinde tek seviye prop drilling olmadığı için kritik değil | birçok | L | — |
| **L9** | `ThemeToggleHeaderButton`, `StaggerIn`, `AvatarBounce`, `ProfileMenuItem` `React.memo` ile sarılmamış — header re-render'larında gereksiz re-render | 47-211 | M | Düşük |
| **L10** | `startScreenOptions = [...]` her render'da yeni array | 472-477 | L | Yok |

### Liste (C) — N/A (login formu liste içermiyor)

### Stil (D)

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **L11** | StyleSheet.create module-level ✓ | dosya sonu | — | — |
| **L12** | `accent`, `readable`, `subtle`, `text`, `cardBorder`, `inputBg`, `inputBorder`, `placeholder`, `strong` her render hesaplanıyor — ucuz string ops | 261-264, 981-985 | L | Yok |

### Network / I/O (E)

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **L13** | `handleLogin` try/catch ile sarılı ✓ | 283-355 | — | ✓ |
| **L14** | `handleForgotSubmitEmail/Otp/NewPassword` try/catch ile sarılı ✓ | 370-459 | — | ✓ |
| **L15** | `useEffect` AsyncStorage `@startScreen` okuma — **`.then` zincirinde catch yok** | 255-259 | M | Düşük |
| **L16** | Login akışında 3 farklı API'ye git: `checkUserExists`, `initiatePasswordReset`, `verifyPasswordResetOtp`, `completePasswordReset` — paralel değil sıralı (zaten kullanıcı etkileşimine bağlı, doğru) | 305+ | — | — |

### Reanimated / Animation (F)

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **L17** | `StaggerIn`'in `useEffect` deps array `[]` ama `index` prop'u kullanıyor — React hook deps eksik. `index` değişirse animasyon tekrar başlatılmaz; pratikte mount'ta sabit, kabul edilebilir | 118-123 | L | — |
| **L18** | `AvatarBounce` aynı eksik dep pattern | 144-147 | L | — |
| **L19** | `ThemeToggleHeaderButton`'da `rotation` shared value rotation.value+360 ile sürekli artıyor — kullanıcı 100 kez tıklarsa 36000° olur, taşma yok ama logical drift | 56-62 | L | (bilgi) |

### Import bloat (G)

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **L20** | `import * as Network`, `import * as numeral`-benzeri yok burada. İmportlar mostly named ✓ | 1-44 | — | — |
| **L21** | `getConnectedServer` import ediliyor ama dosyada kullanılıp kullanılmadığı netleşmedi — kontrol edilecek | 32 | L | — |

### RTK selectors (H)

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **L22** | Tüm useSelector'lar inline arrow — `createSelector` yok. Her dispatch'te selector yeniden çalışıyor (her biri ucuz primitif okuma, OK) | 218-222 | L | — |
| **L23** | **L1 ile bağlantılı**: `s.yatirimlar?.list \|\| []` referans patlatıyor; `createSelector` veya stabil fallback gerekiyor | 222 | **H** | Düşük |

---

## 3. No-Flash Trace

**Welcome → Login navigasyonu**:
1. Welcome'da "Giriş Yap" tap → `navigation.navigate("Login")`
2. AppNavigator `onStateChange` → `triggerTransitionOverlay("Login")` → overlay açılır
3. `Account` mount → `useSelector` çağrıları (auth slice'ı zaten dolu, persisted) → first render
4. `useEffect(loadStartScreen)` mount sonrası tetiklenir (auth'lu değilken bile çalışıyor — gereksiz)
5. Form alanları boş (`useState("")`), kullanıcı email girer
6. Render tamamlanır → overlay min visible 320ms sonra fade-out

**No-Flash kontrolü**: Login formu için **veri çekimi yok** → No-Flash ✓

**handleLogin (Email "Devam" tap)**:
- API çağrısı `checkUserExists` → hasUser ? navigate LoginPassword : navigate OtpVerify
- Sırasında `setContinueLoading(true)` → buton üzeri "Yükleniyor" hissi (kontrol etmem lazım, kod genelinde butonda spinner var olabilir)
- Network başarısız ise flashMessage ✓
- **Global overlay tetiklenmiyor** — buton-içi loading mı, yoksa Welcome'daki gibi global overlay'e mi geçirilmesi gerekir? Karar konusu (W10 paralel'i).

### Önemli: Login form'a girişin No-Flash uyumu

Welcome → Login geçişinde "verisi gelmeden ekran açma" kuralı şu an `triggerTransitionOverlay`'in min-visible süresi (320ms) tarafından dolaylı sağlanıyor. Login formu zaten veri beklemiyor — direkt form. Bu yüzden **uyumlu** ✓.

---

## 4. Double-Render Trace

**Login formu mount sırası**:
1. Mount → Render 1: useState initial values, useSelector ilk değerler (persisted store'dan)
2. useLayoutEffect → header set → JS thread, mount içinde batch'lenir, ekstra render TETİKLEMEZ ✓
3. useEffect → AsyncStorage.getItem("@startScreen") promise → çözüldüğünde `setSelectedStartScreen(val)` → **Render 2** (sadece auth'lu rotada görünür değer, ama state Login render'ında da bağlıdır)
4. Her input değişiminde useState → Render N (zorunlu, kullanıcı eylemi)
5. `s.yatirimlar?.list || []` (L1) — her unrelated action dispatch'inde re-render

**Kaçınılabilir**:
- L1 — `yatirimlar` selector'unu Login form yolunda kullanmamak (sadece authenticated render'da gerekli) veya stabil ref
- L15 — `selectedStartScreen` state'i sadece auth'lu render'da kullanılıyor; Login formu için gereksiz mount-time AsyncStorage

**Kaçınılmaz**:
- User input → state → re-render (normal davranış)

---

## 5. Önerilen Aksiyon Planı

### Grup 1 — Yüksek etki, düşük risk

| ✅ | ID | İş |
|---|----|-----|
| [ ] | **L1** | `yatirimlar` selector: stabil empty array fallback (module-level `const EMPTY_LIST = []`) veya conditional skip (auth'lu olmadığında atla) |
| [ ] | **L3** | Sık tekrar eden Platform.select shadow'larını module-level const'lara çıkar (en az 5 farklı varyant: avatarBig, brandBadge, vb.) |
| [ ] | **L4** | LinearGradient `colors` arraylarını module-level `as const` tuple olarak çıkar — sadece tema-bağımsız olanlar |
| [ ] | **L5** | LinearGradient start/end koordinat objelerini module-level sabit |
| [ ] | **L15** | useEffect AsyncStorage `@startScreen` okumasına try/catch + sadece authenticated iken çalıştır |

### Grup 2 — Orta etki

| ✅ | ID | İş |
|---|----|-----|
| [ ] | **L2** | `toggleTheme` deps'inden kaldır veya useCallback'le sarmala (ThemeProvider'da değişiklik gerekebilir — RISK) |
| [ ] | **L9** | `ThemeToggleHeaderButton`, `StaggerIn`, `AvatarBounce` `React.memo` ile sar |
| [ ] | **L10** | `startScreenOptions` module-level const |
| [ ] | **L17/L18** | `StaggerIn` ve `AvatarBounce` `useEffect` deps düzelt (`[index]` ekle) — animasyon mantığını DEĞİŞTİRİR, dikkat |

### Grup 3 — Skip önerilir

| ✅ | ID | İş |
|---|----|-----|
| [ ] | L6 | Inline `{color, fontFamily}` memoize — çok yer, sınırlı getiri |
| [ ] | L8 | `handleLogin` `useCallback` — prop drilling yok, gereksiz |
| [ ] | L12 | Local color computations memoize — ucuz |
| [ ] | L19 | rotation drift — pratik etki yok |
| [ ] | L21 | `getConnectedServer` import kullanılmıyor olabilir (skip) |

### Grup 4 — UX iyileştirme

| ✅ | ID | İş |
|---|----|-----|
| [ ] | **L24** | `handleLogin`'i Welcome'daki gibi `transitionOverlayRef.show()` ile sarmala — API beklerken kullanıcı global loader görsün, sadece buton-içi değil |

---

## 6. Fonksiyonelliği Koruma Sözleri

- Tüm `try/catch` blokları korunacak
- Tüm `flashMessage` çağrıları korunacak (kullanıcıya tüm hata bildirimleri yerinde)
- `setContinueLoading(false)` çağrı sıralaması korunacak
- `navigation.navigate("LoginPassword"/"OtpVerify")` parametreleri (`email, firstName, lastName, profileImageUrl, isFirstLogin, userToken`) **aynen** kalacak
- Forgot Password 3-adımlı flow korunacak (modal step machine değiştirilmez)
- Header tema toggle çalışmaya devam edecek
- isAuthenticated profil görüntüsü dokunulmayacak (Faz 11'de)
- L15'te AsyncStorage okumayı authenticated'a koşullarken `selectedStartScreen`'in default değeri "Ekranım" korunacak

---

## 7. Soru: Hangileri uygulanacak?

**Önerim**: Grup 1 + Grup 2 + L24.

- **Grup 1**: L1, L3, L4, L5, L15 (5 fix)
- **Grup 2**: L9, L10 (L2 ve L17/L18 davranış riski — opsiyonel)
- **Grup 4**: L24 (global overlay entegrasyonu — Welcome paterninin Login'e taşınması)

Tek commit: `perf(faz-3): account login yolu re-render azalt + global overlay entegrasyonu`.
