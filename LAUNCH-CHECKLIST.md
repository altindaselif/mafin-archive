# Mafin Archive — Yayın Öncesi Kontrol Listesi

Kod incelemesi: 20 Ağustos 2026 · Branch: `main` · Son commit: `5ed4772`

Her madde `- [ ]` ile işaretlenebilir. Sıra önem sırasıdır: Faz 1 bitmeden Faz 2'ye geçme.

---

## 📊 Başlangıç ölçümleri (baseline)

İyileştirmelerden sonra bu tabloyu tekrar doldur, farkı gör.

| Metrik | Şu an | Hedef |
|---|---|---|
| ~~JS bundle (tek chunk)~~ | ~~998.84 KB~~ (gzip 305 KB) | ✅ **181.6 KB** (gzip 59.8 KB) |
| ~~CSS bundle~~ | ~~47.00 KB~~ | ✅ **13.2 KB** (sayfa başına bölündü) |
| ~~`dist/` toplam~~ | ~~54 MB~~ | ✅ **5.6 MB** |
| ~~`public/videos/`~~ | ~~46 MB~~ | ✅ **silindi** |
| ~~`.git` deposu~~ | ~~91 MB~~ | ✅ **8.8 MB** |
| ~~Ana route'taki ham veri~~ | ~~504 KB~~ | ✅ **87 KB** (paralel fetch) |
| ~~Timeline scroll'da inen video~~ | ~~46 MB~~ | ✅ **1 klip** |

Ölçüm komutu:

```bash
npx vite build && du -sh dist
```

---

## 🔴 FAZ 1 — Yayını bloke edenler

> **Durum (20 Ağu):** Kodla çözülebilen her madde bitti ✅
> Dış karara bağlı olanlar (1.4–1.8) belgenin **en altına**, "⏸ Beklemede" bölümüne taşındı.

### 1.1 Route bazlı code splitting + veri ayrıştırma ✅ ÇÖZÜLDÜ (20 Ağu)
> **Resimlerin geç yüklenmesinin ASIL sebebiydi.** Sitedeki hiçbir resim HTML'de yok; hepsi React render'ından sonra DOM'a giriyor. Tarayıcı sırayla: HTML → CSS + font → **1 MB JS indir → parse et → render et** → ancak o zaman ilk `<img>` isteği.

- [x] `src/App.jsx` — 9 sayfa `React.lazy()` + `<Suspense>` ile ayrıldı (Home hariç: açılış rotası, ayırmak fazladan gidiş-geliş demek)
- [x] `scripts/build-home-index.mjs` — Home + Stats için hafif indeks üretiyor. `package.json`'daki `prebuild` / `predev` kancalarıyla otomatik çalışıyor; çıktı `.gitignore`'da (kaynaktan türüyor, bayatlamıyor)
- [x] `src/data/homeIndex.js` — ortak okuyucu, tek fetch + önbellek
- [x] `Stats.jsx` — 616 bölüm import'u yerine tarih listesinden sayım
- [x] `Home.jsx` — `episodes.js` + `quotes.js` import'ları kaldırıldı
- [x] Yan fayda: `DAILY_POOL` boş kalırsa ana sayfayı çökerten hata ve `Stats`'taki duplicate key uyarısı kapandı
- [x] Tarayıcıda doğrulandı
- [x] **Sonradan çıkan hata (aynı gün düzeltildi):** hızlı scroll'da bazı videolar başlamıyordu. Yeniden yazarken eski koddaki açık `play()` çağrısı kaldırılıp yalnızca `autoPlay` özniteliğine güvenilmişti; tarayıcılar bunu garanti etmiyor — element oluşurken görüş alanından bir an çıkarsa oynatmayı atlıyor ve geri gelince kendiliğinden başlatmıyor. Mount sonrası açık `play()` + `readyState` kontrolü (önbellekten gelen videolarda `canplay` olayı dinleyici bağlanmadan tetikleniyordu) eklendi — "tüm sayfalardaki resimler şak diye açılıyor"

**İndeks nasıl küçüldü (504 KB → 87 KB):**

| ne | önce | sonra | nasıl |
|---|---|---|---|
| Stats sayacı | 408 KB | 7.8 KB | sadece yayın tarihleri listesi |
| "Tal día como hoy" | 408 KB | 36.7 KB | yılda 366 gün var → kazanan bölüm build'de hesaplandı |
| "Günün sözü" | 96 KB | 42.6 KB | süzme build'de, sadece uygun 206 alıntı |

**Ölçülen sonuç:**

| | önce | sonra |
|---|---|---|
| Ana sayfa toplam | 1045.8 KB (gzip 314.4) | **282.4 KB** (gzip 88.1) |
| **Resimlerden önce parse edilen JS** | **998.8 KB** | **181.6 KB** (−82%) |
| CSS | 47 KB tek dosya | sayfa başına 1–6 KB |

> `home.json` (87 KB) bundle'a gömülmedi, paralel fetch ediliyor — hero ve bölüm kartları veriyi beklemiyor.

**Sayfa chunk'ları (sadece gidilince iner):** `episodes` 541 KB · `Quotes` 158 KB · `timeline` 24 KB · kalanlar < 20 KB

**Ek: `episodeMeta` indeksi (aynı gün yapıldı)**

`episodes` chunk'ı 541 KB'tı ve Guía / Vídeos / Galería paylaşıyordu. Ama bölüm açıklamaları tek başına **308 KB — verinin %75'i** ve onlara sadece Guía'nın ihtiyacı var; Vídeos ile Galería yalnızca başlık + mood kullanıyor.

- [x] `scripts/build-indexes.mjs` ikinci bir indeks üretiyor: `src/data/generated/episodeMeta.json` (62 KB, numara → başlık + mood)
- [x] `Videos.jsx` + `Gallery.jsx` bu indeksi kullanıyor, `episodes.js` import'u kalktı
- [x] Sezon indekste saklanmıyor — `seasonOf(number)` ile türüyor, `seasonInfo.js` tek kaynak olarak kalıyor

> `home.json`'un aksine bu dosya fetch edilmiyor, **import** ediliyor: Vídeos ve Galería zaten lazy chunk, 62 KB ana sayfaya dokunmuyor — ve yükleniyor durumu / iskelet yönetmeye gerek kalmıyor.

| sayfa | önce | sonra | |
|---|---|---|---|
| Vídeos | 548 KB | **87.9 KB** | −84% |
| Galería | 547 KB | **63.0 KB** | −88% |
| Guía | 546 KB | 546 KB | değişmedi (açıklamalar gerçekten lazım) |

### 1.2 `public/videos/` klasörünü R2'ye taşı ✅ ÇÖZÜLDÜ (20 Ağu)
> Klipler doğru hazırlanmıştı (ses yok, faststart var, süreler kasıtlı) — dosyalarda yapılacak iş yoktu. Tek sorun 46 MB'ın repoda durup her deploy'a gitmesiydi.

- [x] 54 klip R2'ye yüklendi → `mafin-videos/timeline/` (`scripts/r2-upload-timeline.sh`)
- [x] `Milestone.jsx` artık `VIDEO_BASE_URL` + `TIMELINE_PATH` kullanıyor, yerel yol değil
- [x] `public/videos/` repodan silindi
- [x] Git geçmişi sıfırlandı — repo **91 MB → 8.8 MB** (geçmiş silinip tek commit ile yeniden başlatıldı, GitHub'a force push edildi). Yedek: `../mafin-git-yedek`

**Ölçülen sonuç:**

| | önce | sonra |
|---|---|---|
| `dist/` | 54 MB | **5.6 MB** |
| `public/videos/` | 46 MB | silindi |
| `.git` | 91 MB | **8.8 MB** |

### 1.3 Timeline: 54 otomatik oynayan video ✅ ÇÖZÜLDÜ (20 Ağu)
> **Sorun:** `Milestone.jsx` her kart için IntersectionObserver kurup görünür olunca `play()` çağırıyordu. Oynamaya başlayınca tam dosya akıyordu — Timeline'ı baştan sona scroll eden kullanıcı **46 MB'ın tamamını** indiriyordu.

**Uygulanan çözüm — poster-önce:** Kart varsayılan olarak poster gösterir. Video ancak kart ekranda görünür olunca (200 ms bekleme sonrası) DOM'a girip yüklenir; kart ekrandan çıkınca video sökülür, indirme iptal olur, poster geri gelir.

- [x] 54 klipten poster üretildi → `public/img/timeline-posters/` (1.36 MB, ort. 25 KB, `scripts/make-posters.sh`)
- [x] `Milestone.jsx` yeniden yazıldı — poster `<img>` + koşullu `<video>`
- [x] `Milestone.module.css` — `.cardFrame` / `.cardMedia` / `.cardVideo` eklendi; video hazır olana kadar saydam durur, siyah kare parlamaz
- [x] `prefers-reduced-motion` açıksa video hiç mount edilmiyor
- [x] Tarayıcıda doğrulandı
- [x] **Sonradan çıkan hata (aynı gün düzeltildi):** hızlı scroll'da bazı videolar başlamıyordu. Yeniden yazarken eski koddaki açık `play()` çağrısı kaldırılıp yalnızca `autoPlay` özniteliğine güvenilmişti; tarayıcılar bunu garanti etmiyor — element oluşurken görüş alanından bir an çıkarsa oynatmayı atlıyor ve geri gelince kendiliğinden başlatmıyor. Mount sonrası açık `play()` + `readyState` kontrolü (önbellekten gelen videolarda `canplay` olayı dinleyici bağlanmadan tetikleniyordu) eklendi

**Ölçülen sonuç:**

| | önce | sonra |
|---|---|---|
| sayfa açılışı | ekrana giren tüm kartlar oynardı | **1 video** |
| baştan sona hızlı scroll | 46 MB (54 klip) | **1 video** |

> Not: poster'lar deploy'a 1.4 MB ekliyor — ama karşılığında 46 MB'lık indirme gitti.

**Açık kalan tercih:** aynı anda kaç video oynayacağına sınır yok, ekranda kaç kart varsa hepsi oynuyor (pratikte 2-3). Sınır istenirse modül seviyesinde bir koordinatör gerekir.

### 1.3b Dosya isimlendirme ve klasör düzeni ✅ ÇÖZÜLDÜ (20 Ağu)
> Md'de yoktu, iş sırasında ortaya çıktı. `web-ep5.mp4` öneki hiçbir şey anlatmıyordu ve tire kullanımı tutarsızdı (`ep-5` vs `web-ep5`) — birinden diğerini türeten bir yardımcı yazıldığında sessizce patlayacak cinsten.

**Kural: `<tür>-ep<numara>`**

| | eski | yeni |
|---|---|---|
| Videos tam sahne | `ep-5.mp4` | `scene-ep5.mp4` |
| Videos poster | `ep-5.jpg` | `scene-ep5.jpg` |
| Timeline klip | `web-ep5.mp4` | `timeline-ep5.mp4` |
| Timeline poster | `web-ep5.jpg` | `timeline-ep5.jpg` |

**Klasörler**

```
R2 mafin-videos/            public/img/
├── scenes/    54           ├── videos-posters/    54
└── timeline/  54           ├── timeline-posters/  54
                            ├── actors/
                            └── silhouettes/
```

- [x] 54 timeline JSON `video` alanı, `videos.json` 54 `file` alanı güncellendi
- [x] 108 poster + 54 klip yeniden adlandırıldı
- [x] `public/admin/config.yml:131` — CMS şablonu `timeline-ep{{episode}}.mp4` üretiyor (atlanırsa her yeni milestone eski adla gelirdi)
- [x] R2'de sahneler `scenes/`, timeline `timeline/` altına taşındı
- [x] `config.js` — `SCENE_PATH` / `TIMELINE_PATH` sabitleri; klasör adı değişirse tek yerden döner
- [x] Kod ↔ bucket birebir eşleşme doğrulandı (eksik 0, fazla 0)

> Dosya adındaki ön ek klasörle birlikte tekrar gibi duruyor ama kasıtlı: dosya indirilince klasör bilgisi kaybolur, ön ek dosyayla seyahat eder — yeni klip hazırlarken karışmasın diye.

### 1.3c `scene-ep377` aykırı dosyası ✅ ÇÖZÜLDÜ (20 Ağu)
> Md'de yoktu. R2 panelinde bucket boyutu kontrol edilirken çıktı: `scenes/` klasörü 5.53 GB'tı ve tek bir dosya bunun altıda birini yiyordu.

`scene-ep377.mp4` sıkıştırılmadan yüklenmiş bir export'tu — süresi normaldi (6.5 dk), sorun bitrate'ti:

| | önce | sonra |
|---|---|---|
| boyut | **939.7 MB** | 135.5 MB |
| video bitrate | **19.95 Mbps** | 2.72 Mbps |
| profil | High | Main |
| ses | 126 kbps | 165 kbps |
| süre / çözünürlük | 392.6 sn · 1080p | değişmedi |

Diğer sahnelerin bitrate'i 2.6–5.5 Mbps arasında değişiyordu — yani sabit bitrate değil, CRF ile encode edilmişlerdi. Aynı mantık korunarak CRF 22 kullanıldı; sonuç 2.72 Mbps ile referans aralığın tam ortasına oturdu.

- [x] Yeniden encode edildi (CRF 22, Main@4.0, aac 165k, +faststart)
- [x] Kalite doğrulandı — **SSIM 0.9915** (0.98 üstü gözle ayırt edilemez)
- [x] R2'ye yüklendi, geri okunarak doğrulandı

**Bucket:** 5.94 GB → **4.79 GB**

> **KARAR (20 Ağu): sahne videoları 1080p kalacak, dokunulmayacak.** Ortalama 105 MB (~2.8 Mbps, 2–6 dk). Kalite bilinçli tercih; R2'de egress ücretsiz olduğu için maliyet sorunu da yok. 720p'ye indirme önerisi değerlendirildi ve reddedildi — bir daha gündeme getirilmesin.

### 1.9 Hata dayanıklılığı ✅ ÇÖZÜLDÜ (20 Ağu)
- [x] `src/pages/NotFound/` — 404 sayfası, `<Route path="*">` ile bağlandı. Arşivin dilinde künye + inicio/guía bağlantıları
- [x] `src/components/ErrorBoundary/` — render hatasını yakalayıp beyaz ekran yerine künye gösteriyor. Rotaların İÇİNDE duruyor, yani Header/Footer ayakta kalıyor ve kullanıcı menüden çıkabiliyor
- [x] Rota değişince hata otomatik temizleniyor (`routeKey`) — kullanıcı kırık ekranda kilitli kalmıyor
- [x] Hata ekranı iki dilli sabit metin kullanıyor: kırılan şey i18n context'inin kendisi olabilir, ona güvenilemez
- [x] `Home.jsx` — `DAILY_POOL` boşsa ana sayfayı çökerten hata kapandı (1.1 sırasında; havuz boşsa kart hiç çizilmiyor)

### 1.10 Erişilebilirlik: Modal focus trap ✅ ÇÖZÜLDÜ (20 Ağu)
> Focus trap yoktu: modal açıkken Tab'a basan biri arkadaki listede geziniyordu — ekran okuyucu kullanan biri için modal hiç açılmamış gibiydi.

- [x] Açılınca odak modalın ilk gezilebilir elemanına geçiyor
- [x] Tab / Shift+Tab modalın içinde dönüyor, dışarı çıkmıyor
- [x] Kapanınca odak modalı açan düğmeye iade ediliyor — kullanıcı listede yerini kaybetmiyor
- [x] Panel `tabIndex={-1}` aldı: içinde gezilebilir eleman yoksa odak yine de panele düşüyor
- [x] Üç kullanım yerinde de geçerli: Vídeos oynatıcı, Galería lightbox, Fandom bağış formu

---

## 🟠 FAZ 2 — Resim/performans ince ayarı

### 2.1 `content-visibility` + `loading="lazy"` çakışması ✅ ÇÖZÜLDÜ (20 Ağu)
> `VideoCard.module.css:19` kartın içeriğini ekran dışındayken hiç render etmiyor; içerideki `Thumb.jsx:19` `loading="lazy"` resmi de dolayısıyla **istek bile atmıyor**. İkisi birleşince o karakteristik "scroll ediyorum, kutular boş, sonra tek tek doluyor" hissi oluşuyor.

- [x] `content-visibility` korundu (uzun listelerde şart), lazy ise ilk ekrandaki kartlar için kapatıldı — `Thumb`'a `priority` prop'u eklendi

### 2.2 İlk ekrandaki resimler `eager` olmalı ✅ ÇÖZÜLDÜ (20 Ağu)
- [x] `Thumb.jsx` — `priority` prop'u: `loading="eager" fetchPriority="high" decoding="sync"`
- [x] `Videos.jsx` — `EAGER_CARDS = 6`, grid'in ilk 6 kartı öncelikli
- [x] `Actors.jsx` — portre `lazy`'den çıkarıldı, `fetchPriority="high"` verildi

### 2.3 Boyama (paint) maliyeti ✅ ÇÖZÜLDÜ (20 Ağu)

- [x] `Header.module.css` — fixed header'daki `backdrop-filter: blur(12px)` kaldırıldı

> Arka plan zaten `rgba(249,248,246,0.92)` — %92 opak, yani arkasındaki içeriğin %8'i görünüyordu. Blur'ün görsel karşılığı yok denecek kadar azdı ama header `position: fixed` olduğu için arkasındaki içerik scroll'da sürekli değişiyor ve blur her karede yeniden hesaplanıyordu.
>
> Diğer 6 `backdrop-filter` bırakıldı: Modal ve Home'unki yalnızca açıkken, VideoCard'ınki yalnızca hover'da hesaplanıyor — sürekli maliyet değil.

### 2.4 Scroll davranışı çakışması ✅ ÇÖZÜLDÜ (20 Ağu)
> `global.css:29` `html { scroll-behavior: smooth }` açıkken `App.jsx:21`'deki `window.scrollTo(0, 0)` **animasyonlu** çalışıyor. Her sayfa geçişinde yukarı doğru kayma animasyonu görüyorsun.

- [x] `src/App.jsx` → `window.scrollTo({ top: 0, behavior: "instant" })` (1.1 sırasında yapıldı)

---

## 🟡 FAZ 3 — DRY temizliği (yayından sonra da olur)

### 3.1 Filtreleme mantığı Episodes ↔ Videos kopyası ✅ ÇÖZÜLDÜ (20 Ağu)
> `Episodes.jsx:105-122` ile `Videos.jsx:188-205` neredeyse karakter karakter aynı — sezon kontrolü, haystack araması, ters-mood exclusion mantığı, **aynı yorum satırları bile**.

Kopyalanan sabitler:

| kopyalanan | Episodes | Videos |
|---|---|---|
| `EXCLUDED_MOODS = ["baby","cloe"]` | `:45` | `:79` |
| `EXCLUSIONS = new Set(...)` | `:46` | `:80` |
| `toggleMood` | `:98` | `:178` |
| mood sıralaması (exclusion'lar sona) | `:47` | `:155` |

- [x] `src/lib/collection.js` — `filterCollection`, `orderMoods`, `toggleMood`, `EXCLUDED_MOODS`
- [x] Yeni bir dışlayıcı tema eklerken tek dosya değişiyor
- [x] **243 kombinasyon** (sezon × tema seti × arama) eski mantıkla karşılaştırıldı — **0 fark**, davranış birebir korundu

### 3.2 Filtre içinde gereksiz array allocation ✅ ÇÖZÜLDÜ (20 Ağu)
> `Episodes.jsx:114-116` — `[...activeMoods]` ve `.filter()` **filter callback'inin içinde**, yani 616 bölümün her biri için iki yeni dizi. Her tuş vuruşunda 1232 gereksiz array.

- [x] Dahil edici / dışlayıcı temalar döngü dışında bir kez ayrılıyor (`filterCollection` içinde)
- [x] Arama metni yalnızca sorgu boş değilse kuruluyor — 616 bölümde her tuş vuruşunda gereksiz string üretimi de kalktı

### 3.3 CSS tekrarı: `seasonSlot` / `count` / `loadMore` ✅ ÇÖZÜLDÜ (20 Ağu)
> Aynı 7 satırlık flex bloğu 4 dosyada birebir duruyor. 47 KB CSS'in ciddi kısmı bu.

- [x] Dört CSS dosyasından ölü kurallar silindi (~1.9 KB kaynak)
- [x] `components/ListToolbar/` — solda filtre, sağda sayaç, altta ayraç çizgisi. Guía, Vídeos, Galería, Citas kullanıyor

### 3.4 "Load more" bloğu iki kez ✅ ÇÖZÜLDÜ (20 Ağu)
- [x] `components/LoadMore/` — düğme, sayaç ve iki çeviri (`Cargar más` / `restantes`) artık tek yerde. Gösterilecek bir şey kalmadıysa kendini çizmiyor, sayfaların ayrıca koşul yazmasına gerek yok

### 3.5 `DATE_LOCALE` + tarih formatlama 4 yerde ✅ ÇÖZÜLDÜ (20 Ağu, Fandom 24 Ağu'da eklendi)
- [x] `Episodes.jsx`, `Actors.jsx`, `Press.jsx` ortak `formatDate()` kullanıyor
- [x] `Fandom.jsx` — ortak `formatDate(iso, lang, MONTH_YEAR)`'a geçti (24 Ağu)
- [x] `i18n.js`'e `formatDate(iso, lang, opts)` eklendi

### 3.6 Sezon listesi türetme 3 yerde ✅ ÇÖZÜLDÜ (20 Ağu)
- [x] `Episodes.jsx`, `Gallery.jsx`, `Videos.jsx` üçü de `seasonsIn()` kullanıyor
- [x] `seasonInfo.js`'e `seasonsIn(items, of?)` eklendi

### 3.7 Timeline sezon etiketleri `seasonInfo.js`'i bypass ediyor ✅ ÇÖZÜLDÜ (20 Ağu)
> `Timeline.jsx:22-27` — `SEASON_LABEL` ve `SEASON_YEAR` elle 1/2/3 yazılmış. 4. sezon geldiğinde `SEASON_LABEL[4]` undefined olacak ve `Timeline.jsx:49`'daki guard yüzünden **başlık sessizce kaybolacak**.

- [x] `SEASON_RANGES`'e `year` eklendi + `yearOfSeason()`. Timeline etiketi `COMMON.season`'dan türüyor — 4. sezonda başlık artık kaybolmuyor

### 3.8 `videos.json` için gereksiz runtime fetch ✅ ÇÖZÜLDÜ (20 Ağu)
> **Düzeltme:** İlk incelemede "videos.json ile timeline aynı içeriği indeksliyor, silinebilir" demiştim — **yanlıştı.** İki farklı klip seti var: R2'deki `ep-*.mp4` tam sahneler (Videos modal'ı), `web-ep*.mp4` ise Timeline için ayrı kesilmiş kısa klipler. Bölüm numaraları şu an örtüşüyor ama içerik farklı ve ileride ayrışabilir. `videos.json` kalmalı.
>
> Kalan gerçek sorun: `Videos.jsx:58` yorumu *"with ~1000 records"* diyor ve dosyayı bundle'dan kaçırmak için runtime'da `fetch` ediyor. Gerçek sayı **54**, dosya **4 KB**. Bu kurulumun maliyeti (ekstra round-trip + loading state + error state + skeleton + AbortController = ~40 satır) kazancından büyük.

- [x] Yanıltıcı "~1000 records" yorumu düzeltildi
- [x] `public/data/videos.json` → `src/data/videos.json`, statik import. Fetch, AbortController, yükleniyor durumu, hata durumu ve iskelet kodu silindi — **Videos.jsx 344 → 268 satır**

---

## 📱 Mobil geçişi ✅ TAMAMLANDI (25 Ağu)

> 10 sayfa 320–1280px arasında tarandı. İki gerçek taşma vardı, ikisi de düzeltildi.

- [x] **Galeri telefonda sayfayı yana kaydırıyordu** — 375px ekranda sayfa 438px'ti. Izgara öğeleri varsayılan `min-width: auto` taşır, yani içindeki resmin genişliğinin altına inemez; sütun 200px'te kilitleniyordu. `.grid > li { min-width: 0 }` ile çözüldü
- [x] **Timeline'da 4px taşma** — kartlar girerken 28px yana kayıyor. Mobilde tek sütun olduğu için kayma dikeye çevrildi; masaüstünde `overflow-x: clip` ile kabın içinde tutuldu (kesilenin boş dolgu olduğu, görünen içeriğin kalmadığı ölçülerek doğrulandı)
- [x] **Kırılımlar 7 → 5**: `420, 560, 720, 900, 1080`. `520→560` ve `640→720` yukarı birleştirildi. Bu, 520-560 ve 640-720 bantlarında görünümü değiştirir (mobil düzene 30-80px erken geçilir); iki bant da ayrıca ölçüldü, taşma yok
- [x] **Dil seçimi mobilde "Más"ın içinden çıkarıldı**, menünün en altına alındı. İşaretleme tek yerde; her genişlikte yalnızca bir kopya görünür
- [x] Mobil menüde etiketler sola hizalandı — sabit yuvada ortalandıkları için "Guía" ve "Más" içeri kaçmış görünüyordu
- [x] Diyaloglarda çizgiler ve replikler hizalandı (kitap dizgisi); alt satıra taşan metin artık adın altına değil kendi sütununa oturuyor
- [x] Worker düz isteklere `206` dönüyordu (R2 aralık istenmese de `range` alanını dolduruyor). Artık istemci gerçekten `Range` gönderdiyse 206; video sarmanın bozulmadığı ayrıca doğrulandı

> **Doğrulanamayan:** timeline kartlarının giriş animasyonu. Tarayıcı paneli arka planda çalıştığı için (`document.hidden`) onu tetikleyen gözlemci hiç çalışmıyor. Gerçek telefonda bir bakılmalı.

## 🔵 FAZ 4 — Sonraki adım (yayından sonra)

### 4.0 Veri büyümesi — ölçüldü (24 Ağu), şimdilik iş yok
> Veri yapay olarak çoğaltılıp gerçekten derlendi. Büyüme doğrusal: bölüm başına ~0,26 KB gzip.

| bölüm | Episodes paketi (gzip) |
|---|---|
| 616 (bugün) | 161 KB |
| 1232 | 319 KB |
| 2464 | 634 KB |

- Fotoğraf/video pakete girmiyor (R2'den geliyor) — galeri büyümesi JS'i etkilemiyor
- Ana sayfa etkilenmiyor: bölüm verisi ayrı parçada, sadece rehbere girilince iniyor
- `home.json` kendini sınırlıyor (takvimde günde bir bölüm): 4x veride 88 KB → 116 KB
- **Eşik: ~1200 bölüm / ~300 KB gzip.** Rehber sayfası yavaşlarsa yapılacak:
  `description` alanı ağırlığın %82'si, ama sadece detayda lazım. Künyeyi (numara, başlık, tarih, mood — toplam %18) pakette bırakıp açıklamaları ayrı dosyaya al. Rehber ~30 KB'ye iner ve bölüm sayısından bağımsızlaşır
- Şimdi yapmanın anlamı yok: çalışan şeyi karmaşıklaştırır, kazanç bugünkü boyutta hissedilmez


### 4.1 Prerendering / SSG
> Sitenin tamamı statik veri, hiçbir sayfa runtime'a bağımlı değil. Build sırasında HTML üretmek mümkün ve doğru hamle — SEO ve ilk yükleme için 1.1 + 1.8'in üzerine ciddi kazanç.
> **Ama:** yayına kısa süre kala Next.js/Astro'ya migrasyon yapma. Aynı kazancı çok daha ucuza al: `vite-react-ssg` gibi bir prerender adımı, ya da 10 route için build sonrası statik HTML üreten küçük bir script. Mevcut yapı (route listesi tek yerde, veri statik) buna zaten uygun.

- [ ] Prerender adımını değerlendir

---

## ☁️ Cloudflare'e taşınma ✅ TAMAMLANDI (23 Ağu)

> Listede yoktu; Netlify'ın build kredisi (ayda 300 dakika) CMS'ten yapılan her düzenleme bir deploy tetiklediği için hızla tükendiği ortaya çıkınca yapıldı.

- [x] Site **Cloudflare Workers**'a taşındı → `archivo.universomafin.workers.dev`
- [x] `wrangler.jsonc` — statik varlık yapılandırması, SPA yönlendirmesi `not_found_handling` ile
- [x] `.nvmrc` + `package.json` `engines` — build platformu Node sürümünü buradan okuyor
- [x] `public/_redirects` kaldırıldı → Cloudflare `/* /index.html 200` kuralını sonsuz döngü sayıp deploy'u reddediyordu. Netlify için `netlify.toml`'a taşındı
- [x] `_headers` olduğu gibi çalışıyor — önbellek kuralları korundu
- [x] **CMS girişi onarıldı:** Sveltia varsayılan olarak Netlify'ın OAuth servisini kullanıyor, taşınınca kırıldı. Kendi hesabımızda `sveltia-cms-auth` Worker'ı kuruldu, GitHub OAuth uygulaması tanımlandı, `config.yml`'a `base_url` eklendi

**Ölçülen sonuç:**

| | Netlify | Cloudflare |
|---|---|---|
| HTML ilk byte | 0.17–0.90 sn (dalgalı) | **~0.20 sn** (tutarlı) |
| Ana bundle toplam | 0.76 sn | **0.22 sn** |
| Build limiti | 300 dk/ay | 500 build/ay |
| Bant genişliği | 100 GB/ay | sınırsız |

> **Tuzak, ileride lazım olur:** Cloudflare panelinde Worker değişkeni eklemek yeni bir *sürüm* oluşturuyor ama onu yayına almıyor. Çalışan Worker eski sürümde kaldığı için değişkenler görünmüyor. Çözüm: `npx wrangler versions deploy <sürüm-id> --name <worker>`.

- [x] Netlify projesi silindi, `netlify.toml` da kaldırıldı — site tek yerden yayınlanıyor

## 🌐 ALAN ADI GÜNÜ — sırayla yap

> `universomafin.com` bağlandığı gün yapılacaklar. İlk üçü **ayar**: yapılmazsa çalışan şeyler sessizce bozulur, hata mesajı da yanıltıcı olur. Sonrakiler ekleme.

**Önce bunlar — yoksa bozulur:**

- [ ] **R2 CORS**: `mafin-photos` → Settings → CORS Policy → `AllowedOrigins`'e `https://universomafin.com` ekle.
      Yapılmazsa: CMS resim seçici *"error while searching assets"* verir. Dikkat — bu mesaj yanıltıcı; R2 yetki/CORS hatalarında başlık eklemediği için tarayıcı gerçek sebebi göstermez
- [ ] **Turnstile**: widget'ın alan adı listesine **ve** Worker'daki `TURNSTILE_HOSTNAMES` değişkenine `universomafin.com` ekle (ikisi ayrı yer).
      Yapılmazsa: Fandom formu sessizce ölür — ziyaretçi kutuyu çözer, sunucu "tanımadığım adres" deyip reddeder
- [ ] **Sveltia CMS auth**: GitHub OAuth uygulamasının callback adresi ve `base_url` yeni alan adına göre kontrol edilsin

**Sonra bunlar — yeni kazanımlar:**

- [ ] `src/config.js` → `PHOTO_RESIZE = true`. `/cdn-cgi/image` yalnızca kendi bölgende çalışır, `workers.dev`'de yok. Ölçüm: galeri ızgarasındaki kareler şu an orijinali indiriyor (tek gerçek fotoğraf 7,7 MB)
- [ ] `index.html` — `<meta name="description">`
- [ ] `index.html` — Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) + Twitter card
- [ ] Sayfa başına `<title>` — şu an her route'ta "Archivo Mafin"
- [ ] `public/robots.txt` ve `public/sitemap.xml`

**Gizlenen görseller — yayın günü GERİ AÇ:**

> Site duyurulana kadar ana sayfanın kapak fotoğrafı kapalı: siteye giren
> biri ilk ekranda diziden kare görmesin. Tek satır, kod silinmedi.
> **Bu madde kapatılmazsa site kapak fotoğrafsız yayına çıkar.**

- [ ] `src/pages/Home/Home.module.css` → `.heroImage` içindeki `url("/hero.webp")` satırının yorumunu kaldır (ana sayfa kapak fotoğrafı)

> Köşe çizimleri (silüetler) geri açıldı — soyut, bordo tonlu kesitler
> oldukları için ilk bakışta bir şey ele vermiyorlar. Sıraları gezinme
> sırasıyla birlikte artıyor: 29 · 34 · 61 · 145 · 159 · 269 · (Actrices
> köşeyi kendi kullanıyor) · 363 · 561. Yeni bir sayfa eklenirse silüeti de
> bu artan sıraya oturmalı. Yedekte duran iki kesit: ep566, ep574.

> Not: iç sayfalardaki karakter/oyuncu fotoğrafları ve zaman çizelgesi
> posterleri **kapatılmadı** — kapsam "ilk ekran"dı. Daha geniş bir gizleme
> istenirse ayrı iş.

**Taşındıktan sonra doğrula:**

- [ ] Fandom formundan gerçek bir gönderim yap, CMS'te "onay bekliyor" olarak gör
- [ ] CMS'te bir galeri kaydı açıp resim seçiciyi aç, önizlemeler geliyor mu
- [ ] Bir alıntı ve bir bölüm sayfası aç, resim/video akıyor mu
- [ ] Ana sayfanın kapak fotoğrafı geri geldi mi

> Not: veri içindeki fotoğraf adresleri alan adından **bağımsız** — kod hangi adres yazılı olursa olsun kendi yolundan sunuyor, dört biçim de test edildi. Yani veri düzeltmesi gerekmiyor.

## ⏸ BEKLEMEDE — dış karara bağlı (yayın öncesi yapılacak)

> Bu maddeler koda değil, senin kararlarına bağlı: alan adı bütçesi, Fandom formunun akıbeti, sitenin kesin adresi. Yayına ~1 ay olduğu için sona bırakıldı. **Yayından önce hepsi kapanmalı.**

### 1.4 R2 erişimi ✅ ÇÖZÜLDÜ (23 Ağu)
> Eskiden tarayıcı medyayı doğrudan `pub-*.r2.dev` adresinden çekiyordu — Cloudflare'in geliştirme adresi: hız sınırlı, önbeleksiz, Türkiye'den kararsız. Aynı fotoğraf bazen açılıyor bazen açılmıyordu.
>
> **Alan adı gerekmedi.** Site Cloudflare'e taşınınca R2 kovaları doğrudan Worker'a bağlandı.

- [x] `wrangler.jsonc` — `mafin-videos` ve `mafin-photos` binding olarak bağlandı
- [x] `worker/index.js` — `/media/videos/*` ve `/media/photos/*` isteklerini R2'den karşılıyor
- [x] Parça istekleri (`Range`) destekleniyor — video ileri sarma bunsuz çalışmaz
- [x] Koşullu istekler (`If-None-Match`) → 304, tekrar indirme yok
- [x] Bir haftalık önbellek + Cloudflare CDN devrede
- [x] `config.js` göreli yola geçti (`/media/videos`, `/media/photos`) — alan adı gelince değiştirmeye gerek yok
- [x] `Gallery.jsx` — CMS kayda tam R2 adresi yazıyor, dosya adı alınıp kendi yolumuza çevriliyor; örnek verilerdeki dış adresler bozulmuyor

**Canlıda doğrulandı:** video 206 + `content-range`, fotoğraf 206 `image/png`, tekrar istekte 304 (0 byte).

### 1.5 Galeri thumbnail'leri ⏸ ERTELENDİ (1.4'e bağlı)
> **CMS akışı doğrulandı (20 Ağu):** `media_libraries.default: false` ve `stock_assets: false` ile depo ve stok servisleri seçenek olmaktan çıkarıldı; yükleme artık yalnızca R2'ye gidiyor ve kayda tam R2 adresi yazılıyor. Alan bazında `media_library: cloudflare_r2` yazmak işe yaramamıştı — kapatılması gereken varsayılanın kendisiymiş.
>
> **`r2.dev` kararsızlığı doğrulandı:** VPN'siz fotoğraflar bazen açılıyor bazen açılmıyor, VPN'le sorunsuz. Kod, ayar ve bucket erişimi doğru — sorun Cloudflare'in geliştirme adresinin kendisi. Galeri gerçek fotoğraflarla yayına çıkmadan **1.4 mutlaka çözülmeli**, yoksa ziyaretçiler resimlerin bir kısmını göremeyecek.
> `PHOTO_RESIZE = false` iken `Gallery.jsx:167`'deki `photoUrl(p, 640)` width'i **yok sayıyor**, tam boy orijinali veriyor. Grid hücresi 210px. CMS fotoğrafları "tam 4K, hiç küçültülmeden" yüklüyor. 12 albüm × 3-4 foto × ~4 MB = **~150 MB**.
> Şu an fark edilmiyor çünkü galeri hâlâ `picsum.photos` sample datasıyla dolu.

- [ ] Alan adı bağlanınca `PHOTO_RESIZE = true` — `/cdn-cgi/image` yalnızca kendi bölgende var, `workers.dev`'de yok. Ölçüm: galerideki tek gerçek fotoğraf 7,7 MB ve ızgarada küçük kare olarak gösteriliyor

### 1.5b CMS'in R2 resim seçicisi ✅ ÇÖZÜLDÜ (25 Ağu)
> Resim seçme ekranı *"There was an error while searching assets"* veriyordu. Tarayıcı "CORS" diyordu ama sebep o değildi: `mafin-cms-photos` token'ı silinmişti, `config.yml`'deki Access Key ID ona aitti. R2 yetki hatalarında CORS başlığı eklemiyor, tarayıcı da gerçek hatayı göremeyince CORS diye raporluyor.

- [x] Yeni **Account API token** (`Object Read & Write`, yalnızca `mafin-photos`), yeni Access Key ID `config.yml`'de
- [x] R2 kovasında CORS ayarlandı: `GET, PUT, POST, HEAD, DELETE` + origin `archivo.universomafin.workers.dev`
- [x] Eski secret tarayıcıda takılı kalıyordu — Sveltia kayıtlı anahtar varsa giriş kutusunu göstermiyor. `localStorage`'daki `sveltia-cms.prefs → apiKeys.cloudflare_r2` silinerek çözüldü

> **Alan adı taşınırken bunu unutma:** R2 CORS'una `https://universomafin.com` eklenmeli, yoksa resim seçici yine aynı hatayı verir. Turnstile'la aynı durum.

- [x] Önizleme adresi (`public_url`) `r2.dev`'den kendi Worker'ımıza çevrildi — o adres hiç açılmıyor (bağlantı bile kurulmuyor), küçük resimler bu yüzden boştu
- [x] Worker düz isteklere `206` dönüyordu; artık yalnızca gerçek `Range` isteğine (video sarma bozulmadı, ayrıca doğrulandı)

> **Galeri verisindeki fotoğraf adreslerini KISALTMA.** Tam adres olarak durmalı. Site düz dosya adını da çözer ama CMS çözemez — onu depoda arar, bulamaz, önizlemede boş kutu gösterir. Bir kez "veriyi temizleyelim" diye kısaltıldı ve önizlemeler bozuldu. Kod hangi adresi görürse görsün kendi yolundan sunuyor, yani tam adres bırakmanın sitede bir bedeli yok.

- [ ] `src/data/gallery/*.json` — `_sample: true` işaretli üç sahte kayıt (`g069`, `g093`, `g363`, fotoğrafları picsum.photos'tan). **Bilinçli olarak bırakıldı** — gerçek fotoğraflar eklenirken yerlerini alacaklar. Yayından önce mutlaka gitmeli, yoksa ziyaretçi rastgele stok resimleri bölüm fotoğrafı sanır

### 1.6 Fandom formu hiçbir yere veri göndermiyor ✅ ÇÖZÜLDÜ (24 Ağu)
> Artık gerçekten çalışıyor: form → `/api/fandom` (Worker) → doğrulama → depoya `approved: false` olarak JSON yazılıyor → CMS'te onay bekliyor görünüyor. Onaylanana kadar sitede çıkmıyor.

- [x] `worker/fandom.js` — arka uç: doğrulama, GitHub Contents API ile yazma, numara çakışmasında yeniden deneme
- [x] Honeypot (`website` alanı) — dolduran bot sessizce yutuluyor
- [x] Turnstile — jeton Cloudflare'e doğrulatılıyor: geçerli mi, `fandom-donation` eylemi mi, izinli sayfadan mı
- [x] Ağ hatasında reddet (fail closed) — doğrulanamayan istek geçmiyor
- [x] `TURNSTILE_HOSTNAMES` canlıda `localhost` içermiyor — yoksa yerelden alınan jeton canlıda geçerdi
- [x] Sunucu tarafı sınırlar: başlık/yazar zorunlu, uzunluk sınırları, sadece `http(s)` bağlantı (`javascript:` reddediliyor)
- [x] Secret'lar Worker'da (`GITHUB_TOKEN`, `TURNSTILE_SECRET`) — istemci paketinde izi yok, `dist/` tarandı
- [x] Betik yüklemesi Cloudflare'in `onload=` geri çağırmasını kullanıyor — betiğin kendi `onload`'u API'nin hazır olduğunu garanti etmiyor
- [x] Canlıda doğrulandı: GET→405, jetonsuz→403, sahte jeton→403, honeypot→sessiz; hiçbirinde depoya yazılmadı
- [x] Canlıda doğrulandı: `localhost`'ta üretilmiş **geçerli** jeton canlı sunucuda 403 — alan adı sabitlemesi çalışıyor
- [x] Uçtan uca doğrulandı (24 Ağu): gerçek gönderim → Worker `approved: false` yazdı → CMS'te göründü → onaylandı → sitede çıktı
- [x] Otomatik deploy çalışıyor — Cloudflare Workers Builds depoya bağlı (ayar panelde, depoda değil). Onay verince site kendini güncelliyor
- [ ] **Yayın öncesi sil:** `f06` (test kaydı, `elif.com`) + `_sample` işaretli f01–f05 + galeri g069/g093/g363
- [x] Worker tarihi Madrid saatine göre yazıyor (`Intl`, yaz/kış geçişi dahil) — gönderim nereden gelirse gelsin aynı saate göre damgalanıyor

### 1.6b Modal'da her tuş vuruşunda odak kapatma düğmesine kaçıyordu ✅ ÇÖZÜLDÜ (24 Ağu)
> `Modal`'ın odak efekti `onClose`'a bağlıydı. `Fandom` ve `Vídeos` bu prop'u her render'da yeniden oluşturuyordu, yani her harfte efekt yeniden çalışıp odağı ilk elemana — kapatma düğmesine — atıyordu. Form pratikte doldurulamıyordu.

- [x] `Modal.jsx` — `onClose` ref'te tutuluyor, efekt yalnızca `open`e bağlı
- [x] Tarayıcıda doğrulandı: eski kodda 5 alanın hepsinde odak `BUTTON[Cerrar]`'a atlıyor, yenisinde alanda kalıyor
- [x] Escape, kaydırma kilidi, açılışta odağın modala girmesi — üçü de bozulmadı

### 1.9 CMS'te elle numara yazma kaldırıldı ✅ ÇÖZÜLDÜ (25 Ağu)
> `number` alanı iki çelişen iş yapıyordu: dosya adını benzersiz kılmak (→ "en sondan devam et") ve sıralamayı belirlemek (→ "araya girebilmek"). Bu yüzden bir bölüme sonradan eklenen alıntı listenin en sonuna düşüyordu. İkisi ayrıldı.

| koleksiyon | sıralama | dosya adı |
|---|---|---|
| quotes | `episode` | `q559-a1b2c3d4.json` (CMS üretiyor) |
| timeline | `episode` | `m131-582d7dd4.json` |
| press | `date`, en yeni üstte | `p03-11-2025-df902417.json` |
| fandom | `date`, en yeni üstte | `f08-02-2026-…` (worker üretiyor) |
| **episodes** | `number` **kaldı** | dizinin gerçek bölüm numarası, veri |
| **characters** | `number` **kaldı** | editoryal sıra; başka hiçbir alan veremez |

- [x] 298 alıntı + 54 timeline + 4 press + 5 fandom yeni biçime geçti; içerik ve sıra birebir korundu (karşılaştırarak doğrulandı)
- [x] Kimlik artık dosya adından türüyor, veride tutulmuyor — tek kaynak
- [x] Worker numara saymayı bıraktı: GitHub'a fazladan istek ve çakışma denemesi ortadan kalktı
- [x] Timeline'da araya bölüm eklemek test edildi: 140. bölüm 132 ile 147 arasına kendiliğinden oturuyor
- [x] CMS arayüzü tamamen İngilizce; 13 alana örnekli ipucu eklendi (en çok işe yarayanı: "Only the number — 559, not 'Episode 559'")
- [x] Diyalog kuralı yazıya döküldü: konuşan "Mafin" ise metin `Marta: … Fina: …` biçiminde (50/50 kayıt böyleydi ama hiçbir yerde yazmıyordu)
- [x] İnsanın gördüğü her tarih gün/ay/yıl. Depolanan değer ISO kalıyor — sıralama metin karşılaştırmasıyla yapıldığı için yıl-ay-gün şart (`format` ile `date_format` ayrıldı)

### 1.7 Fandom sayfası tamamen İspanyolca hardcoded ✅ ÇÖZÜLDÜ (24 Ağu)
> `L` sözlüğü sadece başlık/altbaşlık için vardı. Artık sayfadaki her arayüz metni çevrili.

- [x] Tüm stringler `L` sözlüğünde: sekmeler, sayaç (tekil/çoğul), "por/by", eylem kelimeleri, boş liste, davet, formun tamamı, teşekkür ekranı, 5 hata mesajı
- [x] Tür etiketleri çevrili ama **değerler İspanyolca sabit** — veri, CMS ve worker'ın doğruladığı küme bunlar. Seçim kutusu "Song" gösterip `Canción` gönderiyor
- [x] `SectionTabs` artık `{value, label}` alabiliyor (eskiden etiket = değer sayılıyordu); `aria-label` de çevrilebilir
- [x] Hata durumu metni değil sözlük girdisini tutuyor — hata ekrandayken dil değişirse mesaj da çevriliyor
- [x] `TYPES.map((t) => …)` çeviri fonksiyonu `t`'yi gölgeliyordu; `value` olarak yeniden adlandırıldı
- [x] Tarayıcıda doğrulandı: iki dilde metinler, filtre değerleri, tekil/çoğul, seçim kutusu değerleri, canlı dil değişimi

### 1.8 SEO / paylaşım meta etiketleri ⏸ ERTELENDİ (alan adı belli değil)
> `og:url`, `og:image` ve `sitemap.xml` sitenin kesin adresini gerektiriyor. Sayfa başlıkları ve `robots.txt` adres olmadan da yapılabilir ama bölmeye değmez — alan adı netleşince hepsi birden.
> Site X'te paylaşıldığında önizleme çıkmıyor. Fandom sitesi için kritik.

- [ ] `index.html` — `<meta name="description">` ekle
- [ ] `index.html` — Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) + Twitter card ekle
- [ ] Sayfa başına `<title>` — şu an her route'ta "Archivo Mafin". `useEffect` ile set et
- [ ] `public/robots.txt` ve `public/sitemap.xml` ekle

## 🛠 Depodaki script'ler

| script | ne yapar | ne zaman |
|---|---|---|
| `scripts/build-indexes.mjs` | `public/data/home.json` + `src/data/generated/episodeMeta.json` üretir | Her derlemede **otomatik** (`prebuild`/`predev`) |
| `scripts/make-posters.sh` | Kliplerden poster karesi çıkarır | Yeni klip eklendiğinde, elle |
| `scripts/r2-upload-timeline.sh` | Timeline kliplerini R2'de `timeline/` altına yükler | Yeni klip eklendiğinde, elle |

Elle çalıştırılan ikisi `--go` verilmeden **kuru çalışır**, hiçbir şeyi değiştirmez.

> Hepsi hedef listeyi `videos.json` / timeline JSON'larından okur — elle liste tutulmaz, kod neye bakıyorsa bucket ona dönüşür.

## 🩹 Ufak tefek (fırsat buldukça)

- [x] `Characters.jsx` — `monogram()` boş, tek kelimelik, `null` ve `undefined` adlarda güvenli. Eskiden boş adda `"NAN"` yazıyordu
- [x] `Stats.jsx` — `key={stat.value}` yerine `key={stat.label.en}` (1.1 sırasında)
- [x] `Home.jsx` — `q.text` yoksa patlama riski kalktı; havuz artık build script'inde `q.text?.es ?? ""` ile süzülüyor (1.1 sırasında)
- [x] `vite.config.js` — `usePolling` kaldırıldı, işletim sisteminin kendi dosya bildirimleri kullanılıyor. Ağ sürücüsü/Docker'da çalışırken gerekirse geri eklemek için not bırakıldı
- [x] **R2 anahtarı dar kapsama alındı (20 Ağu).** `config.yml`'daki anahtar `R2 Account Token`'a aitti ve **tüm bucket'lara yazma** yetkisi taşıyordu — secret sızsaydı video bucket'ı da gidiyordu. Yerine yalnızca `mafin-photos`'a yazabilen `mafin-cms-photos` token'ı üretildi, `config.yml` güncellendi ve deploy edildi
- [x] Kullanılmayan `Cloudflare Agent Token` (tüm bucket'larda okuma) silindi
- [x] CMS'ten foto yüklendi, yeni dar kapsamlı anahtar çalışıyor (`g126` kaydı R2 adresiyle oluştu)
- [x] Eski `R2 Account Token` (tüm bucket'lara yazma) silindi. Geriye yalnızca dar kapsamlı ikisi kaldı: `mafin-cms-photos` → `mafin-photos`, `rclone-upload` → `mafin-videos`
- [x] **CMS Fandom:** (26 Eyl) `summary` alanındaki desteklenmeyen `{{#if fields.approved}}` mantığı kaldırılarak "summary option refers to #if..." hatası çözüldü

> Not: `access_key_id` herkese açık olmaya devam ediyor ve bu sorun değil — secret olmadan kullanılamaz, secret da editörün tarayıcısında duruyor. Yapılan şey katmanlı savunma: anahtar bir gün sızarsa hasar foto bucket'ıyla sınırlı kalsın.

---

## ✅ Doğru yapılmış olanlar (bozma)

- `src/i18n.js` — Context API ile ağır kütüphane olmadan çözülmüş çoklu dil. Hafif ve işlevsel
- `src/data/seasonInfo.js` — sezon aralıkları tek kaynak, `seasonOf()` ile türetiliyor. Editörler sezon alanına hiç dokunmuyor
- `import.meta.glob` ile veri dosyalarının build-time toplanması — CMS ile birlikte temiz çalışıyor
- `VideoCard`'ın `React.memo` + `useCallback` ile stabil referans alması — doğru uygulanmış
- `useDeferredValue` ile arama kutusunun responsive kalması
- Fandom formundaki honeypot alanı (`Fandom.jsx:51`)
- Veri/bileşen ayrımı, component klasör yapısı, yorumların açıklayıcılığı

---

## Notlar

**Revizyon geçmişi (20 Ağu):** 1.2, 1.3 ve 3.8 düzeltildi.
- Timeline klipleri R2'deki tam sahnelerin kopyası **değil** — ayrı kesilmiş klipler. "İçerik tekrarı" tespiti geçersizdi.
- Kliplerin encoding'iyle ilgili tüm bulgular **geçersiz**: ses zaten yoktu (54/54), faststart zaten vardı (moov @ byte 36), bitrate yayılımı içerikten geliyor, süreler kasıtlı. Yeniden encode önerisi tamamen kaldırıldı.
- Geçerli kalan: dosyaların repoda durması (deploy boyutu) ve Timeline'da 54'ünün birden oynaması. **İkisi de çözüldü.**
- 1.3b (isimlendirme + klasör düzeni) ilk listede yoktu, iş sırasında ortaya çıkıp tamamlandı.
- 1.3c (`scene-ep377` aykırı dosyası) ilk listede yoktu, R2 boyutu kontrol edilirken bulunup düzeltildi.
- 1.1 tamamlandı: ana sayfa 1045 KB → 282 KB, parse edilen JS 999 KB → 182 KB. Resim gecikmesi şikayeti kapandı.
- Git geçmişi sıfırlandı: repo 91 MB → 8.8 MB (node_modules 41 MB + eski videolar 46 MB + eski hero.png 5.7 MB geçmişten çıktı). Yedek: `../mafin-git-yedek`.

**Resim yavaşlığının teşhisi:** `config.js`'i düzeltmek (Faz 1.4/1.5) galeri gerçek fotoğraflara geçtiğinde *o sayfayı* kurtarır, ama **bugünkü yavaşlığı çözmez.** Bugün gördüğün resimler yerel: Videos poster'ları `/img/posters/*.jpg` (en büyüğü 56 KB), hero 240 KB, siluetler, portreler. Galeri hâlâ `picsum.photos` sample datasıyla dolu, R2'ye hiç gitmiyor. Yani bugünkü sebep **Faz 1.1 (bundle) + Faz 2.1 (content-visibility/lazy çakışması)**.

**Beklenen kazanç:** Faz 1.1–1.3 tek başına ilk yükleme süresini 5–10 kat iyileştirir.
