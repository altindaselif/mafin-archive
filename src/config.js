/*
 * Site-wide constants.
 *
 * Medya R2'de ama tarayıcı oraya doğrudan gitmiyor: istekler /media/...
 * yoluna gidiyor, worker/index.js R2'den karşılıyor. Eskiden kullanılan
 * `pub-*.r2.dev` hız sınırlıydı ve Türkiye'den kararsız çalışıyordu.
 *
 * Yollar göreli: alan adı değişse de istek aynı origin'e gidiyor.
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
 * PHOTO_VERSION: fotoğraf adreslerinin sonuna eklenen sürüm etiketi.
 *
 * Bir fotoğrafın üstüne AYNI adla yenisi yazıldığında tarayıcı bunu
 * fark etmiyor — adres değişmediği için tekrar sormuyor ve elindeki
 * eski kopyayı gösteriyor. Sayfayı daha önce açmış olanlar günlerce
 * eski görseli görüyor; 2026-11'de Fina'nın kıyafetlerinde böyle oldu.
 *
 * Buradaki sayı artınca adres değişiyor, tarayıcı "bunu görmedim"
 * deyip yeniden indiriyor. R2'de hiçbir şeyi değiştirmeye gerek yok.
 *
 * NE ZAMAN ARTIR: var olan bir dosyanın üstüne yeni görsel yazdıysan.
 * Yeni ADLA yüklediysen gerek yok, o zaten yeni bir adres.
 *
 * BEDELİ: artırınca bütün fotoğraflar bir kez yeniden iniyor, sadece
 * değişenler değil. O yüzden her yüklemede değil, gerçekten üzerine
 * yazdığında artır.
 */
export const PHOTO_VERSION = "2";

/*
 * Turnstile site anahtarı — Fandom bağış formundaki bot koruması.
 * Bu değer herkese açık, sayfaya gömülüyor; gizli olan Secret Key
 * Worker'da `TURNSTILE_SECRET` olarak duruyor.
 */
export const TURNSTILE_SITE_KEY = "0x4AAAAAAEZfib3I8bRgBxiu";

/* Widget'a verilen eylem adı. Sunucu jetonun BU formdan geldiğini
   buradan doğruluyor — worker/fandom.js içindeki değerle aynı olmalı. */
export const TURNSTILE_ACTION = "fandom-donation";
