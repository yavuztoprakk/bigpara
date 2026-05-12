# Faz 5 — Register Akışı

**Statü**: Statik analiz tamamlandı. Hiçbir kod değiştirilmedi.
**Üretildiği tarih**: 2026-05-12
**Dosyalar**:
- `src/screens/Auth/components/OtpVerify.tsx` (369 satır)
- `src/screens/Auth/components/SetPassword.tsx` (377 satır)
- `src/screens/Auth/components/CompleteProfile.tsx` (571 satır)

> **Önemli düzeltme**: `src/screens/Account/components/Register.tsx` (729 satır) **route olarak mount edilmiş ama hiçbir yerden navigate edilmiyor** (Welcome'daki tek çağrı comment'li). Dead code. Faz 5 kapsamına alınmadı.

---

## 1. Akış Haritası

```
Account.tsx Login form (Faz 3)
  └─ email + checkUserExists → hasUser=false
      └─ navigate("OtpVerify", { email, userToken })

OtpVerify.tsx
  └─ verifyOTP API → success
      └─ navigation.replace("SetPassword", { email, userToken })

SetPassword.tsx
  └─ Lokal validasyon (API YOK)
      └─ navigate("CompleteProfile", { email, userToken, password })

CompleteProfile.tsx
  └─ registerAndLogin API → success
      └─ setVoltranTokens + setAuthLoading dispatch
      └─ 400ms setTimeout → idealClientLogin(usergck_X, ColendiMenkul1, true, "0", "0")
      └─ (Faz 4 B-4 fix: AppNavigator çift login DEĞİL artık)
```

Multi-step navigation: her adım route.params ile bir sonrakine veri taşıyor (prop drilling yok, navigation params doğru kullanım).

---

## 2. OtpVerify.tsx Bulguları

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **O1** | Inline Platform.select shadow (iconWrap + primaryBtn) | 142, 230 | **H** | Düşük |
| **O2** | Inline LinearGradient `colors=[...]` 2 yer (iconWrap, primaryBtn conditional) | 137, 220 | **H** | Düşük |
| **O3** | Inline gradient start/end | 138-139, 225-226 | M | Düşük |
| **O4** | Inline `onPress={() => navigation.goBack()}` | 279 | L | Düşük |
| **O5** | Inline `style={{ marginRight: 6 }}` (icon) | 250 | L | Düşük |
| **O6** | handleVerify global overlay yok | 47-87 | M (UX) | Düşük |
| **O7** | handleVerify try/catch ✓, flashMessage ✓ | 47-87 | — | ✓ |
| **O8** | handleResend try/catch ✓, flashMessage ✓ | 89-117 | — | ✓ |
| **O9** | autoFocus on TextInput — ekran açıldığında keyboard direkt çıkıyor (UX kararı, mevcut) | 208 | — | — |

**No-Flash**: route.params yeterli → ✓
**Double-render**: useState mount + setState input change. Tek render. ✓

---

## 3. SetPassword.tsx Bulguları

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **S1** | Inline Platform.select shadow (iconGradient + primaryBtn) | 126, 263 | **H** | Düşük |
| **S2** | Inline LinearGradient `colors=[...]` 2 yer (iconGradient, primaryBtn conditional) | 121, 257 | **H** | Düşük |
| **S3** | Inline gradient start/end | 122-123, 258-259 | M | Düşük |
| **S4** | `renderRule` fonksiyonu component içinde — her render'da yeni ref (6 kez çağrılıyor) | 87-107 | M | Düşük (memoize veya component out) |
| **S5** | Inline `style={{ marginRight: 8 }}` (renderRule icon) ve `style={{ marginLeft: 6 }}` (arrow icon) | 93, 286 | L | Düşük |
| **S6** | handleSubmit `setTimeout(() => setLoading(false), 250)` — Race-condition koruması mı yoksa miss-feature mi? Davranış değişmesin diye dokunmayacağız | 84 | L | — (koru) |
| **S7** | `evaluate` ve `allPassed` module-level pure functions ✓ | 28-38 | — | ✓ |
| **S8** | `rules` useMemo ile sarılmış ✓ | 66 | — | ✓ |

**No-Flash**: API yok, sadece validasyon → ✓
**Double-render**: useState mount + input changes → kullanıcı tetikli, kabul.

---

## 4. CompleteProfile.tsx Bulguları

| ID | Bulgu | Konum | Etki | Risk |
|----|-------|-------|------|------|
| **C1** | performRegister/handleSubmit try/catch ✓ | birçok | — | ✓ |
| **C2** | 202 mismatch Alert → onPress inline async fonksiyon (her render yeni ref ama Alert tek seferlik açılıyor) | 116-129 | L | — |
| **C3** | handleSubmit global overlay yok | 165-182 | M (UX) | Düşük |
| **C4** | Inline Platform.select shadow (varsa) — kontrol edilecek | birçok | H | Düşük |
| **C5** | Inline LinearGradient `colors=[...]`, start/end | birçok | H | Düşük |
| **C6** | idealClientLogin parametreleri korunmuş (usergck_) ✓ | 161 | — | ✓ |
| **C7** | setVoltranTokens + setAuthLoading dispatch'ler korunmuş ✓ | 146-158 | — | ✓ |
| **C8** | 6 useState input + 3 focus + 2 checkbox + loading + picker — toplam 12+ state → 12+ render her input değişiminde | 44-57 | — | (normal form davranışı) |
| **C9** | `phoneRaw = phone.replace(...)` her render'da yeniden hesaplanıyor — ucuz | 68 | L | — |
| **C10** | `validate` her render'da yeniden tanımlanıyor — useCallback yapılabilir ama gereksiz | 70-83 | L | — |
| **C11** | B-4 (Faz 4'te düzeltildi) — AppNavigator artık ws açıkken login etmiyor → CompleteProfile'dan başlatılan WS güvende ✓ | — | — | ✓ |

---

## 5. No-Flash + Double-render

**OtpVerify mount**: route.params (email, userToken) → render → autoFocus → ✓
**SetPassword mount**: route.params (email, userToken) → render → ✓
**CompleteProfile mount**: route.params (email, userToken, password) → render → ✓

Hiçbir ekranda mount-time veri çekimi yok. ✓ No-Flash kuralına uyumlu.

**Buton tap → API süresi**:
- OtpVerify.handleVerify: API 200-2000ms — global overlay olmadan kullanıcı buton-içi spinner görüyor (O6)
- SetPassword.handleSubmit: API YOK, lokal validasyon → 250ms artificial delay (S6, koru)
- CompleteProfile.handleSubmit: API 200-2000ms — global overlay olmadan buton-içi spinner (C3)

---

## 6. Önerilen Aksiyon Planı

### Grup 1 — Yüksek etki, düşük risk (hepsi yapılacak)

**OtpVerify**:
- [ ] O1 — Platform.select shadow → module-level sabit
- [ ] O2 — LinearGradient colors → module-level `as const` tuples
- [ ] O3 — Gradient coords → module-level sabit
- [ ] O4 — `goBack` useCallback
- [ ] O5 — Inline marginRight → StyleSheet sabit
- [ ] O6 — `handleVerify` global overlay entegrasyonu

**SetPassword**:
- [ ] S1 — Platform.select shadow → module-level sabit (paylaşılan)
- [ ] S2 — LinearGradient colors → module-level tuple
- [ ] S3 — Gradient coords → module-level sabit
- [ ] S4 — `renderRule` `useCallback` ile sarmala (veya useMemo'lu rules array)
- [ ] S5 — Inline marginRight/marginLeft → StyleSheet sabit

**CompleteProfile**:
- [ ] C3 — `handleSubmit` global overlay entegrasyonu
- [ ] C4/C5 — Platform.select shadow + LinearGradient colors module-level

### Grup 2 — Skip

- O7, O8 (zaten ✓)
- O9 (UX kararı)
- S6 (race-condition koruması)
- S7, S8 (zaten ✓)
- C1, C6, C7, C11 (zaten ✓)
- C2 (Alert tek seferlik, etki yok)
- C8, C9, C10 (cosmetic)

---

## 7. Fonksiyonelliği Koruma Sözleri

- Tüm `try/catch` blokları korunacak
- Tüm `flashMessage` çağrıları korunacak
- API parametreleri (`verifyOTP`, `reGenerateOTP`, `registerAndLogin`) **aynen** kalacak
- `navigation.replace("SetPassword", {...})` ve `navigation.navigate("CompleteProfile", {...})` parametreleri korunacak
- 202 mismatch Alert akışı, mismatch=true ile yeniden çağırma korunacak
- `setVoltranTokens` ve `setAuthLoading({remember:false, demo:false})` aynen korunacak
- `idealClientLogin(\`usergck_${email}\`, "ColendiMenkul1", true, "0", "0")` parametreleri aynen korunacak
- 400ms setTimeout race-condition koruması korunacak
- SetPassword `setTimeout(() => setLoading(false), 250)` korunacak
- TextInput `autoFocus` (OtpVerify) korunacak
- `evaluate`, `allPassed` module-level pure functions korunacak

---

## 8. Soru: Hangileri uygulanacak?

Önerim: Grup 1'in tamamı.

Tek commit: `perf(faz-5): otpverify+setpassword+completeprofile re-render azalt + global overlay`.
