/*
 * Site-wide constants.
 *
 * VIDEO_BASE_URL: where the archive's media lives (Cloudflare R2 bucket).
 * Currently the R2 public development URL — rate-limited and blocked by
 * some Turkish ISPs, fine for development behind a VPN. When the custom
 * domain is connected to the bucket (e.g. https://videos.mafinarchive.com),
 * change ONLY this line; videos.json stores bare file names.
 */
export const VIDEO_BASE_URL = "https://pub-ed0ded3a371c4f209e861c6fb92b245c.r2.dev";

/*
 * Bucket içindeki klasörler. Dosya adları (scene-ep5.mp4 / timeline-ep5.mp4)
 * veride saklanır; hangi klasörde durdukları bir dağıtım detayı olduğu için
 * burada tutulur. R2'de klasör yapısı değişirse tek yerden döner.
 */
export const SCENE_PATH = "scenes";
export const TIMELINE_PATH = "timeline";

/*
 * PHOTO_BASE_URL: where the archive's gallery photos live (Cloudflare R2
 * bucket "mafin-photos", uploaded at full 4K by the CMS). gallery JSON may
 * store either bare file names or full URLs; the Gallery page prefixes this
 * base only when the stored value is not already an absolute URL. Point this
 * at the custom domain once it's connected; nothing else needs to change.
 */
export const PHOTO_BASE_URL = "https://pub-17a4e1676af940bea88a2f26ef361d81.r2.dev";

/*
 * PHOTO_RESIZE: turn on Cloudflare Image Resizing for gallery thumbnails.
 * Keep false while photos are served from the pub-*.r2.dev dev URL — the
 * /cdn-cgi/image endpoint only exists on a Cloudflare zone (a custom domain).
 * Once the bucket is behind such a domain (and PHOTO_BASE_URL points at it),
 * flip this to true: the grid then requests small, fast thumbnails while the
 * lightbox still loads the full 4K original. No other change needed.
 */
export const PHOTO_RESIZE = false;
