/*
 * Guía ve Vídeos sayfalarının paylaştığı liste mantığı.
 *
 * İki sayfa da aynı üç filtreyi uyguluyordu — sezon, arama, temalar — ve
 * kod ikisinde birebir kopyaydı (yorum satırları dahil). Yeni bir dışlayıcı
 * tema eklemek iki dosyayı birden düzenlemek demekti; kaçırılan biri
 * sessizce yanlış davranırdı.
 */

/*
 * Bebek ve Cloe temaları TERS çalışır: seçilince o kayıtları GÖSTERMEZ,
 * gizler. Filtre çubuğunda da ayrı dururlar (sonda, mürekkep renginde).
 * Yeni bir dışlayıcı tema gerekirse tek yer burası.
 */
export const EXCLUDED_MOODS = ["baby", "cloe"];
export const EXCLUSIONS = new Set(EXCLUDED_MOODS);

/* Filtre çubuğunun sırası: önce normal temalar, sonda dışlayıcılar.
   Veride hiç geçmeyen bir dışlayıcı için buton üretilmez. */
export function orderMoods(moods) {
  const seen = [...new Set(moods)];
  return [
    ...seen.filter((m) => !EXCLUSIONS.has(m)),
    ...EXCLUDED_MOODS.filter((m) => seen.includes(m)),
  ];
}

/* Set'e ekle/çıkar. setState'in fonksiyonel biçimiyle kullanılır:
   setActiveMoods((prev) => toggleMood(prev, mood)) */
export function toggleMood(active, mood) {
  const next = new Set(active);
  next.has(mood) ? next.delete(mood) : next.add(mood);
  return next;
}

/**
 * Sezon + arama + tema filtresi.
 *
 * `searchText` iki sayfanın TEK farkı: Guía açıklamalarda da arıyor,
 * Vídeos yalnızca başlıkta. Onun dışında mantık aynı.
 *
 * Dahil edici ve dışlayıcı temalar döngünün DIŞINDA bir kez ayrılıyor.
 * Eskiden her kayıt için iki yeni dizi üretiliyordu — tüm bölüm kataloğunda her
 * tuş vuruşunda 1232 gereksiz dizi demekti.
 */
export function filterCollection(items, { query = "", moods, season, searchText }) {
  const q = query.trim().toLowerCase();

  const include = [];
  const exclude = [];
  for (const m of moods) (EXCLUSIONS.has(m) ? exclude : include).push(m);

  return items.filter((item) => {
    // Sezon önce daralt: en ucuz kontrol, en çok eleyen
    if (item.season !== season) return false;
    if (exclude.some((m) => item.moods.includes(m))) return false;
    if (include.length && !item.moods.some((m) => include.includes(m))) return false;
    return !q || searchText(item).toLowerCase().includes(q);
  });
}
