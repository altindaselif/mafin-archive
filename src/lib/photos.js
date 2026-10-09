/*
 * Fotoğraf adreslerini siteye ait adreslere çeviren tek yer.
 *
 * Galería ile Vestuario aynı şeye ihtiyaç duyuyor: veride ne yazılı olursa
 * olsun fotoğrafı kendi origin'imizden servis etmek. Kod Galería'nın içinde
 * duruyordu; ikinci sayfa gelince kopyalamak yerine buraya taşındı —
 * ListToolbar ve LoadMore'un buraya taşınmasıyla aynı gerekçe.
 */
import { PHOTO_BASE_URL, PHOTO_RESIZE } from "../config.js";

/* CMS fotoğrafı seçince kayda TAM adresi yazıyor. Hangi tam adres olduğu
   zamanla değişti (önce pub-*.r2.dev, şimdi kendi /media/photos yolumuz) ve
   alan adı bağlanınca bir kez daha değişecek. Bu yüzden gelen adresi olduğu
   gibi kullanmıyoruz: dosya adını çıkarıp her zaman kendi yolumuzdan
   sunuyoruz. Böylece veride hangi adres yazılı olursa olsun site kendi
   kaynağından servis ediyor.
   Tanımadığımız bir sunucudaki adresler (örnek veriler) olduğu gibi kalıyor. */
const OWN_PHOTO = [
  /^https?:\/\/[^/]*r2\.dev\/(.+)$/i, // eski R2 genel adresi
  /^https?:\/\/[^/]+\/media\/photos\/(.+)$/i, // kendi origin'imiz (alan adı ne olursa olsun)
];

export const absUrl = (p) => {
  const s = String(p);
  if (/^https?:\/\//i.test(s)) {
    for (const re of OWN_PHOTO) {
      const m = s.match(re);
      if (m) return `${PHOTO_BASE_URL}/${m[1]}`;
    }
    return s;
  }
  return `${PHOTO_BASE_URL}/${s.replace(/^\/+/, "")}`;
};

/* Varsayılan olarak orijinal boyut. Bir genişlik verilirse küçültülmüş
   sürüm — yalnızca PHOTO_RESIZE açıkken; kapalıyken orijinal olduğu gibi
   gidiyor, yani lightbox (genişlik verilmeyen çağrı) her zaman tam boy. */
export const photoUrl = (p, width) => {
  const src = absUrl(p);
  if (!width || !PHOTO_RESIZE) return src;
  return `${PHOTO_BASE_URL}/cdn-cgi/image/width=${width},fit=cover,format=auto/${src}`;
};
