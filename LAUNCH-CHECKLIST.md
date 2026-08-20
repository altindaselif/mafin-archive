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

### 1.1 Route bazlı code splitting + veri ayrıştırma ✅ ÇÖZÜLDÜ (20 Ağu)
> **Resimlerin geç yüklenmesinin ASIL sebebiydi.** Sitedeki hiçbir resim HTML'de yok; hepsi React render'ından sonra DOM'a giriyor. Tarayıcı sırayla: HTML → CSS + font → **1 MB JS indir → parse et → render et** → ancak o zaman ilk `<img>` isteği.

- [x] `src/App.jsx` — 9 sayfa `React.lazy()` + `<Suspense>` ile ayrıldı (Home hariç: açılış rotası, ayırmak fazladan gidiş-geliş demek)
- [x] `scripts/build-home-index.mjs` — Home + Stats için hafif indeks üretiyor. `package.json`'daki `prebuild` / `predev` kancalarıyla otomatik çalışıyor; çıktı `.gitignore`'da (kaynaktan türüyor, bayatlamıyor)
- [x] `src/data/homeIndex.js` — ortak okuyucu, tek fetch + önbellek
- [x] `Stats.jsx` — 616 bölüm import'u yerine tarih listesinden sayım
- [x] `Home.jsx` — `episodes.js` + `quotes.js` import'ları kaldırıldı
- [x] Yan fayda: `DAILY_POOL` boş kalırsa ana sayfayı çökerten hata ve `Stats`'taki duplicate key uyarısı kapandı
- [x] Tarayıcıda doğrulandı — "tüm sayfalardaki resimler şak diye açılıyor"

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

### 1.4 R2 custom domain
> `src/config.js:11` ve `:20` — kendi yorumunda da yazıyor: `pub-*.r2.dev` URL'i Cloudflare tarafından rate-limit'li ve bazı TR ISP'lerinde bloklu.

- [ ] `videos.mafinarchive.com` (veya benzeri) custom domain'i bucket'a bağla
- [ ] `src/config.js:11` → `VIDEO_BASE_URL` güncelle
- [ ] `src/config.js:20` → `PHOTO_BASE_URL` güncelle
- [ ] `src/config.js:29` → `PHOTO_RESIZE = true` yap

### 1.5 Galeri thumbnail'leri
> `PHOTO_RESIZE = false` iken `Gallery.jsx:167`'deki `photoUrl(p, 640)` width'i **yok sayıyor**, tam boy orijinali veriyor. Grid hücresi 210px. CMS fotoğrafları "tam 4K, hiç küçültülmeden" yüklüyor. 12 albüm × 3-4 foto × ~4 MB = **~150 MB**.
> Şu an fark edilmiyor çünkü galeri hâlâ `picsum.photos` sample datasıyla dolu.

- [ ] 1.4 tamamlandıktan sonra `PHOTO_RESIZE = true` ile gerçek bir albümde test et
- [ ] `src/data/gallery/*.json` — `_sample: true` işaretli sahte kayıtları temizle

### 1.6 Fandom formu hiçbir yere veri göndermiyor
> `src/pages/Fandom/Fandom.jsx:68` TODO. Kullanıcıya *"Recibido — Tu aportación espera la revisión del archivero"* diyor ama veri hiçbir yere gitmiyor. Yayına böyle çıkarsa insanlara yalan söylemiş oluyorsun.

- [ ] Ya Supabase'i bağla, ya butonu "yakında" yap, ya da bir e-posta/form servisine (Formspree vb.) yönlendir

### 1.7 Fandom sayfası tamamen İspanyolca hardcoded
> `L` sözlüğü sadece başlık/altbaşlık için var. "Todas las obras", "obra/obras", "Donar al archivo", tüm form etiketleri, hata mesajı (`:63`), teşekkür metni — hepsi düz string. İngilizce'ye geçen kullanıcı bu sayfada tamamen İspanyolca içerik görüyor.

- [ ] `src/pages/Fandom/Fandom.jsx` — tüm stringleri `L` sözlüğüne taşı
- [ ] `Fandom.jsx:19` `formatDate` — `lang` parametresi almıyor, hep `es-ES`

### 1.8 SEO / paylaşım meta etiketleri
> Site X'te paylaşıldığında önizleme çıkmıyor. Fandom sitesi için kritik.

- [ ] `index.html` — `<meta name="description">` ekle
- [ ] `index.html` — Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) + Twitter card ekle
- [ ] Sayfa başına `<title>` — şu an her route'ta "Archivo Mafin". `useEffect` ile set et
- [ ] `public/robots.txt` ve `public/sitemap.xml` ekle

### 1.9 Hata dayanıklılığı
- [ ] `src/App.jsx` — `<Route path="*">` ile 404 sayfası ekle (şu an bilinmeyen URL'de header+footer görünüp `<main>` boş kalıyor)
- [ ] Error boundary ekle (aşağıdaki crash risklerinden biri olursa kullanıcı beyaz ekran görüyor)
- [ ] `src/pages/Home/Home.jsx:89` — `DAILY_POOL` boşsa `dailyQuote` undefined olur, `:136`'daki `t(dailyQuote.text)` **ana sayfayı komple çökertir**. Guard koy

### 1.10 Erişilebilirlik: Modal focus trap
> `src/components/Modal/Modal.jsx` — focus trap yok, açılınca focus modal'a taşınmıyor, kapanınca tetikleyen elemana dönmüyor. Klavye kullanıcısı modal açıkken arkadaki listede geziniyor.

- [ ] Focus trap + focus restore ekle

---

## 🟠 FAZ 2 — Resim/performans ince ayarı

### 2.1 `content-visibility` + `loading="lazy"` çakışması
> `VideoCard.module.css:19` kartın içeriğini ekran dışındayken hiç render etmiyor; içerideki `Thumb.jsx:19` `loading="lazy"` resmi de dolayısıyla **istek bile atmıyor**. İkisi birleşince o karakteristik "scroll ediyorum, kutular boş, sonra tek tek doluyor" hissi oluşuyor.

- [ ] İkisinden birini kaldır — `content-visibility`'yi bırakıp lazy'yi ilk satır için kapatmak daha iyi

### 2.2 İlk ekrandaki resimler `eager` olmalı
- [ ] `src/components/Thumb/Thumb.jsx` — `priority` prop'u ekle, ilk N kart için `loading="eager" fetchpriority="high"`
- [ ] `src/pages/Videos/Videos.jsx:275` — grid'in ilk 4-6 kartına bu prop'u geç
- [ ] `src/pages/Actors/Actors.jsx:45` — portre zaten görünür alanda, `lazy` kaldır

### 2.3 `width`/`height` eksik → layout shift (CLS)
- [ ] `src/pages/Gallery/Gallery.jsx:165`
- [ ] `src/pages/Actors/Actors.jsx:45`

### 2.4 Hero preload
> `hero.webp` (240 KB) CSS background olarak tanımlı (`Home.module.css:16`), CSS parse edilene kadar keşfedilmiyor. Ana sayfanın LCP elemanı bu.

- [ ] `index.html` — `<link rel="preload" as="image" href="/hero.webp">`

### 2.5 Boyama (paint) maliyeti
> "Yükleme" değil ama kullanıcı "hantal" diye algılıyor.

- [ ] `src/styles/global.css:98` — `filter: url(#mafin-duo)` SVG referans filtresi bazı tarayıcılarda GPU hızlandırmasını kapatıp yazılımsal rasterizasyona düşürüyor. Aynı duotone'u CSS filtre zinciriyle (`grayscale` + `sepia` + `hue-rotate` + `saturate`) veya `background-blend-mode` ile yap
- [ ] `src/components/Header/Header.module.css:20` — fixed header'da `backdrop-filter: blur(12px)` her scroll frame'inde yeniden boyanıyor. Toplam 7 yerde `backdrop-filter` var, gözden geçir
- [ ] `src/styles/global.css:9` — `--transition-smooth: all 0.3s` 47 yerde kullanılıyor. `transition: all` layout property'lerini de animasyona sokar. Açık liste yaz: `transform, box-shadow, border-color, opacity, color`

### 2.6 Fontlar
> Google Fonts `<link>` senkron ve render-blocking. `display=swap` var (iyi) ama iki aile × 6 ağırlık indiriliyor.

- [ ] Kullanılmayan ağırlıkları çıkar, ya da fontları self-host et

### 2.7 Scroll davranışı çakışması
> `global.css:29` `html { scroll-behavior: smooth }` açıkken `App.jsx:21`'deki `window.scrollTo(0, 0)` **animasyonlu** çalışıyor. Her sayfa geçişinde yukarı doğru kayma animasyonu görüyorsun.

- [ ] `src/App.jsx:21` → `window.scrollTo({ top: 0, behavior: "instant" })`

---

## 🟡 FAZ 3 — DRY temizliği (yayından sonra da olur)

### 3.1 Filtreleme mantığı Episodes ↔ Videos kopyası ⭐ en büyük DRY ihlali
> `Episodes.jsx:105-122` ile `Videos.jsx:188-205` neredeyse karakter karakter aynı — sezon kontrolü, haystack araması, ters-mood exclusion mantığı, **aynı yorum satırları bile**.

Kopyalanan sabitler:

| kopyalanan | Episodes | Videos |
|---|---|---|
| `EXCLUDED_MOODS = ["baby","cloe"]` | `:45` | `:79` |
| `EXCLUSIONS = new Set(...)` | `:46` | `:80` |
| `toggleMood` | `:98` | `:178` |
| mood sıralaması (exclusion'lar sona) | `:47` | `:155` |

- [ ] `src/lib/filter.js` veya `useFilteredCollection({ items, query, moods, season })` hook'una çıkar
- [ ] Yeni bir exclusion mood'u eklerken tek dosya değişsin

### 3.2 Filtre içinde gereksiz array allocation
> `Episodes.jsx:114-116` — `[...activeMoods]` ve `.filter()` **filter callback'inin içinde**, yani 616 bölümün her biri için iki yeni dizi. Her tuş vuruşunda 1232 gereksiz array.

- [ ] `src/pages/Episodes/Episodes.jsx:114` — `useMemo` içinde, callback'in **üstüne** taşı
- [ ] `src/pages/Videos/Videos.jsx:197` — aynısı

### 3.3 CSS tekrarı: `seasonSlot` / `count` / `loadMore` / `empty`
> Aynı 7 satırlık flex bloğu 4 dosyada birebir duruyor. 47 KB CSS'in ciddi kısmı bu.

- [ ] `Episodes.module.css:159`, `Gallery.module.css:1`, `Quotes.module.css:158`, `Videos.module.css:103`
- [ ] Ortak `ListToolbar` / `LoadMore` componentine ya da `global.css`'e paylaşımlı sınıf olarak taşı

### 3.4 "Load more" bloğu iki kez
- [ ] `src/pages/Videos/Videos.jsx:289-299` ve `src/pages/Gallery/Gallery.jsx:178-188` — aynı buton, aynı `remaining` sayacı, aynı `setVisibleCount(c => c + PAGE_SIZE)`

### 3.5 `DATE_LOCALE` + tarih formatlama 4 yerde
- [ ] `Episodes.jsx:32`, `Actors.jsx:23`, `Press.jsx:14`, `Fandom.jsx:19`
- [ ] `src/i18n.js`'e `formatDate(iso, lang, opts)` olarak taşı

### 3.6 Sezon listesi türetme 3 yerde
- [ ] `Episodes.jsx:53`, `Gallery.jsx:59`, `Videos.jsx:165`
- [ ] `src/data/seasonInfo.js`'e `seasonsIn(items)` helper'ı olarak çıkar

### 3.7 Timeline sezon etiketleri `seasonInfo.js`'i bypass ediyor
> `Timeline.jsx:22-27` — `SEASON_LABEL` ve `SEASON_YEAR` elle 1/2/3 yazılmış. 4. sezon geldiğinde `SEASON_LABEL[4]` undefined olacak ve `Timeline.jsx:49`'daki guard yüzünden **başlık sessizce kaybolacak**.

- [ ] `seasonInfo.js`'e `year` alanı ekle, Timeline oradan türetsin

### 3.8 `videos.json` için gereksiz runtime fetch
> **Düzeltme:** İlk incelemede "videos.json ile timeline aynı içeriği indeksliyor, silinebilir" demiştim — **yanlıştı.** İki farklı klip seti var: R2'deki `ep-*.mp4` tam sahneler (Videos modal'ı), `web-ep*.mp4` ise Timeline için ayrı kesilmiş kısa klipler. Bölüm numaraları şu an örtüşüyor ama içerik farklı ve ileride ayrışabilir. `videos.json` kalmalı.
>
> Kalan gerçek sorun: `Videos.jsx:58` yorumu *"with ~1000 records"* diyor ve dosyayı bundle'dan kaçırmak için runtime'da `fetch` ediyor. Gerçek sayı **54**, dosya **4 KB**. Bu kurulumun maliyeti (ekstra round-trip + loading state + error state + skeleton + AbortController = ~40 satır) kazancından büyük.

- [ ] `Videos.jsx:58` — yanıltıcı "~1000 records" yorumunu düzelt
- [ ] Katalog 4 KB kaldığı sürece `videos.json`'ı statik import'a çevirip fetch/skeleton/error kodunu sil. (Katalog gerçekten binlere çıkarsa geri al — o zaman doğru karar olur)

---

## 🔵 FAZ 4 — Sonraki adım (yayından sonra)

### 4.1 Prerendering / SSG
> Sitenin tamamı statik veri, hiçbir sayfa runtime'a bağımlı değil. Build sırasında HTML üretmek mümkün ve doğru hamle — SEO ve ilk yükleme için 1.1 + 1.8'in üzerine ciddi kazanç.
> **Ama:** yayına kısa süre kala Next.js/Astro'ya migrasyon yapma. Aynı kazancı çok daha ucuza al: `vite-react-ssg` gibi bir prerender adımı, ya da 10 route için build sonrası statik HTML üreten küçük bir script. Mevcut yapı (route listesi tek yerde, veri statik) buna zaten uygun.

- [ ] Prerender adımını değerlendir

---

## 🛠 Depodaki script'ler

Hepsi `--go` verilmeden **kuru çalışır**, hiçbir şeyi değiştirmez.

| script | ne yapar |
|---|---|
| `scripts/make-posters.sh` | Kliplerden poster üretir (yeni klip eklendiğinde tekrar çalıştır) |
| `scripts/r2-rename-scenes.sh` | R2'de `ep-5.mp4` → `scene-ep5.mp4` (bir kez çalıştırıldı, arşiv) |
| `scripts/r2-move-scenes.sh` | R2'de sahneleri `scenes/` altına taşır (bir kez çalıştırıldı, arşiv) |
| `scripts/r2-upload-timeline.sh` | Timeline kliplerini `timeline/` altına yükler (yeni klip eklendiğinde tekrar) |

> Hepsi hedef listeyi `videos.json` / timeline JSON'larından okur — elle liste tutulmaz, kod neye bakıyorsa bucket ona dönüşür.

## 🩹 Ufak tefek (fırsat buldukça)

- [ ] `src/pages/Characters/Characters.jsx:13` — `parts[0][0]` boş isimde patlar
- [ ] `src/components/Stats/Stats.jsx:70` — `key={stat.value}`; `TOTAL - 182 === 182` olursa (toplam 364) duplicate key uyarısı
- [ ] `src/pages/Home/Home.jsx:75` — `q.text` yoksa patlar (`q.text.es ?? ""` yeterli değil)
- [ ] `vite.config.js:9` — `usePolling: true` her 300 ms'de dosya sistemini tarıyor. Sadece dev'i etkiliyor ama ihtiyacın yoksa kaldır
- [ ] `public/admin/config.yml:20` — R2 `access_key_id` public repoda ve `/admin/config.yml` adresinden herkese açık. Secret key orada değil (doğru karar) ve access key ID tek başına yetkilendirme sağlamaz, ama bucket + account ID ile birlikte ifşa oluyor. Bu key'in **sadece** `mafin-photos` bucket'ına write yetkisi olduğundan emin ol

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
