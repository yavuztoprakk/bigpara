# Performans İyileştirme Planı

**Amaç**: Soğuk açılıştan itibaren her ekran için statik kod analizi ile performans iyileştirmesi. Tüm uygulama, faz faz.

**Bağlayıcılık**: Bu döküman serttir. Faz atlanmaz, sıra değiştirilmez. Yeni bulgu ortaya çıkarsa yeni faz olarak eklenir, mevcut fazın içine sıkıştırılmaz.

---

## 0. Değişmez Kurallar (her ekranda, istisnasız)

### Kural 1 — No-Flash
**Veri gelmeden ekran AÇILMAZ.**
- Skeleton, spinner, "yükleniyor" placeholder yok.
- Veri çekimi **caller'da** (önceki ekranda / dispatch eden tarafta) yapılır.
- Hedef ekran **mount olduğunda store'dan hazır veriyi okur**.
- Sadece veri ready ise `navigation.navigate(...)` çağrılır.
- Real-time veri için: WebSocket bağlı + ilk dump alınmış olmalı.
- Tamamen statik UI ekranı (örn. form-only Settings) bu kuraldan muaftır — açıkça not düşülür.

### Kural 2 — Single-Render
**Mount + ilk veri için TOPLAM 1 render.**
- 2. render olursa kaynağı işaretlenir ve fix edilir.
- Kaynaklar: `useEffect(()=>dispatch(fetch()),[])` (Kural 1 ile zaten yasak), `useSelector` yeni ref döndürme, conditional Provider, remount.
- StrictMode dev tarafındaki iki render developer-only, sayılmaz. Production-equivalent davranış ölçülür.

### Kural 3 — Surgical
- Refactor değil, hedefe yönelik müdahale.
- "Mademki açtım" yok. Yalnız checklist bulgularına dokun.

### Kural 4 — Per-Phase Commit
- Her faz tek commit. İçi karışmasın.
- Commit mesajı: `perf({faz}): {kısa özet}`.

### Kural 5 — Onaysız Fix Yok
- Önce: statik analiz raporu (tablo).
- Sonra: kullanıcı hangi bulguların fix'leneceğini seçer.
- Sonra: diff göster, uygula.
- Sıra atlanmaz.

---

## 1. Genel Desenler

### Desen — No-Flash (caller-prefetch)
```ts
// YANLIŞ — hedef ekran kendi içinde fetch + skeleton
function MarketsScreen() {
  const data = useSelector(s => s.markets.list);
  useEffect(() => { dispatch(fetchMarkets()); }, []); // double-render kaynağı
  if (!data) return <Skeleton />; // flash kaynağı
  return <List data={data} />;
}

// DOĞRU — caller fetch'i tamamlar, hedef store'dan okur
async function goToMarkets() {
  await store.dispatch(fetchMarkets()).unwrap(); // veri ready
  navigation.navigate("Markets"); // sadece şimdi
}
function MarketsScreen() {
  const data = useSelector(s => s.markets.list); // halihazırda dolu
  return <List data={data} />; // tek render
}
```

### Desen — Single-Render (selector memoization)
```ts
// YANLIŞ — her dispatch'te yeni array referansı
const items = useSelector(s => s.markets.list.filter(x => x.fav));

// DOĞRU
const selectFavorites = createSelector(
  (s: RootState) => s.markets.list,
  list => list.filter(x => x.fav)
);
const items = useSelector(selectFavorites);
```

### Desen — Inline prop yasağı
```tsx
// YANLIŞ
<Child onPress={() => doX()} style={{ padding: 8 }} data={[1,2,3]} />

// DOĞRU
const handlePress = useCallback(() => doX(), []);
const styles = useMemo(() => ({ padding: 8 }), []);
const data = useMemo(() => [1,2,3], []);
<Child onPress={handlePress} style={styles} data={data} />
```

---

## 2. Statik Analiz Checklist

Her ekranda aşağıdaki 10 başlık geçilir:

- **A. Re-render tetikleyicileri** — inline obj/array/fn, useSelector ref, context split
- **B. Memoization** — `React.memo`, `useCallback`, `useMemo` (eksik VE fazla)
- **C. Liste optimizasyonları** — `FlatList` opts, `FlashList` adayları
- **D. Stil** — render içinde `StyleSheet.create`, dinamik tema factory
- **E. Network / I/O** — render içi async, cleanup'sız `useEffect`
- **F. Reanimated / Animasyon** — worklet sınırı, UI thread doğruluğu
- **G. Import bloat** — `import *`, `lodash`, lottie eager-load
- **H. RTK selectors** — `createSelector` eksikliği, slice büyüklüğü
- **I. No-Flash kontrolü** — Kural 1 ihlali var mı (her ekran için ayrıca cevaplanır)
- **J. Double-render kontrolü** — Kural 2 ihlali var mı (her ekran için ayrıca cevaplanır)

---

## 3. Faz Sırası

| # | Faz | Kapsam (üst seviye) |
|---|-----|---------------------|
| 0 | **Hazırlık** | App.tsx, BaseApp.tsx, AppNavigator, store yapısı, başlangıç akışı keşfi |
| 1 | **Cold Start** | App entry → splash → initial route. Font/theme/store hydration zinciri |
| 2 | **Welcome** | Reanimated animasyonları, initial route logic, AsyncStorage reads |
| 3 | **Login** | LoginContainer, Login, Form, BigParaClient userLogin akışı |
| 4 | **LoginPassword** | Bigpara user-exists yolundaki şifre ekranı |
| 5 | **Register Akışı** | Register → OtpVerify → SetPassword → CompleteProfile zinciri |
| 6 | **Markets** | WebSocket real-time update zinciri, list, filter/sort |
| 7 | **Watchlist** | List performansı, realtime sync, AsyncStorage |
| 8 | **Detail** | Sembol detay + grafik (Chart), sembol bazlı realtime |
| 9 | **News (Haberler)** | Liste + görsel, lazy load, NewsDetail |
| 10 | **Analysis (Analiz)** | Bu kapsama giren ekran(lar) |
| 11 | **Account / Settings / Alarms / Calendar / Diğer** | İkincil ekranlar |
| 12 | **Navigation Katmanı** | AppNavigator transitions, animation config, stack/tab geçişleri |
| 13 | **Final Regresyon** | Tüm fix'lerin birlikte çalışma testi |

Sıra **bağlayıcıdır**. 6'ya 5 tamamlanmadan geçilmez.

---

## 4. Faz Yürütme Şablonu

Her faz, istisnasız bu 8 adımla:

1. **Kapsam belirle** — Hangi dosyalar, hangi bağımlı modüller
2. **Statik analiz raporu** — Checklist'in 10 başlığını uygula, dosya:satır + sorun + etki (H/M/L) tablosu çıkar. **Kod değiştirilmez.**
3. **No-Flash trace** — Hedef ekran açılışına kadar veri akışı: caller hangi dispatch'i ne zaman yapıyor, navigate noktasında store dolu mu? Bulguları rapora ekle.
4. **Double-render trace** — Hangi `useEffect`/`useSelector`/conditional 2. render'a sebep oluyor? Bulguları rapora ekle.
5. **Onay bekle** — Kullanıcı raporu okur, hangi bulguların fix'leneceğini seçer.
6. **Düzelt** — Sadece seçilenleri. Diff'i göster, dokunulmayan yerlere dokunma.
7. **Doğrula** — Manuel akış testi: caller → navigate → mount. Flash var mı? Render sayısı 1 mi? (Geçici `console.count` ile.)
8. **Commit** — `perf(faz-X): ...` Sonraki faza geçiş onayı al.

---

## 5. Faz Detayları

### Faz 0 — Hazırlık
**Kapsam**: `App.tsx`, `BaseApp.tsx`, `src/routes/AppNavigator.tsx`, `src/store/**`, `src/modules/IdealClient/index.ts` (giriş noktası), `src/modules/BigParaClient/**` (interceptor + base config).

**Çıktı**: Boot akışının haritası (markdown notu), tüm slice/selector envanteri, ilk route belirleme logic'i.

**Faz çıkışı**: Sonraki fazlara güvenli zemin.

### Faz 1 — Cold Start
**Kapsam**: App entry → splash kalkışı → ilk ekran mount'una kadar.

**Özel sorular**:
- Font yüklemesi ne kadar bloklu, paralel mi?
- AsyncStorage hydrate'i splash kapanmadan biter mi?
- Token check (login state) splash sırasında mı sonra mı?
- IdealClient WebSocket ne zaman bağlanıyor — login öncesi mi sonrası mı?
- Initial route hesabı 1 kez mi, birden fazla mı?

### Faz 2 — Welcome
**Kapsam**: `src/screens/Auth/Welcome/Welcome.tsx`.

**Özel sorular**:
- 5 Reanimated shared value'su mount'ta tek seferde mi başlatılıyor?
- Animasyon worklet'leri UI thread'de mi?
- Misafir login akışı (`loginToDemo`) `Network.getNetworkStateAsync` ve `Application.getIosIdForVendorAsync` — bunlar başlangıçta lazım mı yoksa lazy mı?

### Faz 3 — Login
**Kapsam**: `src/screens/Auth/Login/containers/LoginContainer.tsx`, `Login.tsx`, `Form.tsx`, `SubmitButton`, `TextField`, `Banner`'lar.

**Özel sorular**:
- `getUserInfo` AsyncStorage çağrısı render'ı kaç kez tetikliyor?
- `Loading` component'i No-Flash kuralını ihlal ediyor mu — buradan başlamamız gerekecek.

### Faz 4 — LoginPassword
**Kapsam**: `src/screens/Auth/components/LoginPassword.tsx`.

**Özel sorular**:
- Login press → BigPara userLogin → setVoltranTokens → setAuthLoading → navigate.
- Bu sıralama No-Flash uyumlu mu? (Şu an evet gibi — sonraki ekran data ready'ye kadar `Loading` görüyor mu?)

### Faz 5 — Register Akışı
**Kapsam**: `Register.tsx`, `OtpVerify.tsx`, `SetPassword.tsx`, `CompleteProfile.tsx`.

**Özel sorular**:
- Multi-step navigation params arası prop drilling.
- 202 mismatch popup'ı remount yapıyor mu?

### Faz 6 — Markets
**Kapsam**: `src/screens/Markets/**`, ilgili `store/slices/markets*` (varsa), `IdealClient/responses/realTimeUpdate.ts` ve ilgili parser'lar.

**Özel sorular**:
- WebSocket update geldiğinde re-render zinciri: parser → dispatch → selector → component.
- Hangi parser her tick'te tüm liste'yi yeniliyor? (Granular update gerekiyor.)
- Filter/sort selectors `createSelector` mı?
- FlatList parametreleri tam mı (`getItemLayout`, `keyExtractor`, `removeClippedSubviews`, `windowSize`, `maxToRenderPerBatch`, `initialNumToRender`)?
- 100+ sembol için `FlashList` öneri sayılır.

### Faz 7 — Watchlist
**Kapsam**: `src/screens/WatchList/**`.

**Özel sorular**:
- AsyncStorage'dan watchlist okuma kim, ne zaman?
- Realtime ile watchlist sync olurken çift dispatch var mı?
- Reorder/edit ekranları için pure component memoization.

### Faz 8 — Detail
**Kapsam**: `src/screens/Detail/**`, grafik component'i (`react-native-chart-kit` veya benzeri — proje keşfinde belirlenecek).

**Özel sorular**:
- Sembol değiştiğinde tüm Detail mi yoksa sadece veri kısımları mı re-mount?
- Chart prop'ları her tick'te yeni mi?
- Tab navigation (alt sekme) varsa lazy mount mı?

### Faz 9 — News (Haberler)
**Kapsam**: `src/screens/News/**` (veya equivalent).

**Özel sorular**:
- Görsel boyutlandırma (`Image` width/height/resizeMode) tam mı?
- Lazy load var mı?
- NewsDetail navigation No-Flash uyumlu mu? (İçerik prop olarak mı, fetch olarak mı?)

### Faz 10 — Analysis (Analiz)
**Kapsam**: Proje keşfinde tespit edilecek ekran(lar).

### Faz 11 — Account / Settings / Alarms / Calendar / Diğer
**Kapsam**: Geriye kalan ikincil ekranlar.

**Özel sorular**:
- Statik form ekranları No-Flash kuralından muaf, açıkça not düşülür.
- Alarms, Calendar gibi veri tabanlı ekranlar Kural 1'e tabi.

### Faz 12 — Navigation Katmanı
**Kapsam**: `src/routes/AppNavigator.tsx`, transition animasyon konfigürasyonları, `ROUTE_MIN_VISIBLE_MS` overlay sistemi.

**Özel sorular**:
- Transition overlay sistemi şu an No-Flash'ı simüle ediyor — gerçek No-Flash sağlandıktan sonra bu overlay gereksiz mi?
- Stack screen `animation` ayarları (none/slide/fade) ekran bazlı doğru mu?
- `headerShown` toggling remount tetikliyor mu?

### Faz 13 — Final Regresyon
**Kapsam**: Tüm uygulama soğuk açılış → 3-4 ana akış (login → markets → watchlist → detail → news → geri).

**Sorular**:
- Hiçbir noktada flash yaşandı mı? (Manuel test.)
- Console.count ile her ekran mount'ta tek render mı?
- Reanimated dropped frame uyarısı var mı?

---

## 6. Sapma Politikası

- Faz içinde yeni alt bulgu çıkarsa: faz raporuna eklenir, fix edilir.
- Faz içinde **yeni ekran/modül** keşfedilirse: yeni faz olarak listenin sonuna eklenir, mevcut faza karıştırılmaz.
- Bir faz 1 commit'i aşıyorsa: ön-faz/ardıl-faz olarak bölünür.

---

## 7. Şu anki durum

**Aktif faz**: Henüz başlamadık. Faz 0 (Hazırlık) onayı bekleniyor.

**Tamamlananlar**: Yok.

**Notlar**:
- LoginPassword.tsx ve CompleteProfile.tsx üzerinde önceden başka değişiklikler yapıldı (misafir IdealClient bağlantısı + UI). Bu fix'ler performans planına dahil değildir; sadece o ekranların mevcut hâli üzerinden faz 4/5'te analiz yapılır.

---

## 8. Bir sonraki adım

**Faz 0 — Hazırlık**'ı başlatmak için onay ver. Aşağıdaki dosyaları okuyup boot akışı haritasını çıkaracağım, hiçbir kod değiştirmeden raporu sunacağım:

- `App.tsx`, `BaseApp.tsx`
- `src/routes/AppNavigator.tsx` (tamamı)
- `src/store/**` (slice envanteri)
- `src/modules/IdealClient/index.ts` (giriş noktası)
- `src/modules/BigParaClient/**` (yapılandırma)
- Splash + initial route belirleme logic'i

Onayla, başlayayım.
