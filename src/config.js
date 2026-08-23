/*
 * Site-wide constants.
 *
 * Medya (video ve fotoğraf) Cloudflare R2'de duruyor ama tarayıcı oraya
 * doğrudan gitmiyor: istekler sitenin kendi adresindeki /media/... yoluna
 * gidiyor, worker/index.js onları R2'den karşılıyor.
 *
 * Eskiden `https://pub-*.r2.dev` adresleri kullanılıyordu — Cloudflare'in
 * geliştirme adresi. Hız sınırlıydı, önbeleksizdi ve Türkiye'den kararsız
 * çalışıyordu: aynı dosya bazen açılıyor bazen açılmıyordu. Site
 * Cloudflare'e taşınıp kovalar Worker'a bağlanınca o adrese gerek kalmadı.
 *
 * Yollar göreli: alan adı değişse de (universomafin.com) hiçbir şey
 * değişmiyor, istek hep aynı origin'e gidiyor.
 */
export const VIDEO_BASE_URL = "/media/videos";
export const PHOTO_BASE_URL = "/media/photos";

/*
 * Bucket içindeki klasörler. Dosya adları (scene-ep5.mp4 / timeline-ep5.mp4)
 * veride saklanır; hangi klasörde durdukları bir dağıtım detayı olduğu için
 * burada tutulur.
 */
export const SCENE_PATH = "scenes";
export const TIMELINE_PATH = "timeline";

/*
 * PHOTO_RESIZE: Cloudflare Image Resizing ile küçük galeri önizlemeleri.
 * Kapalı kalmalı — /cdn-cgi/image uç noktası yalnızca bir Cloudflare
 * bölgesinde (kendi alan adında) var, workers.dev adresinde yok.
 * universomafin.com bağlanınca açılabilir.
 */
export const PHOTO_RESIZE = false;

/*
 * Turnstile site anahtarı — Fandom bağış formundaki bot koruması.
 * Bu değer herkese açık, sayfaya gömülüyor; gizli olan Secret Key
 * Worker'da `TURNSTILE_SECRET` olarak duruyor.
 */
export const TURNSTILE_SITE_KEY = "0x4AAAAAAEZfib3I8bRgBxiu";

/* Widget'a verilen eylem adı. Sunucu jetonun BU formdan geldiğini
   buradan doğruluyor — worker/fandom.js içindeki değerle aynı olmalı. */
export const TURNSTILE_ACTION = "fandom-donation";
