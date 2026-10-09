/*
 * Her kıyafet ./outfits/ altında kendi dosyasında. Build sırasında toplanıp
 * karakter → sezon → sıra düzeniyle sıralı tek dizi olarak veriliyor.
 *
 * SEZON NEDEN VERİDE SAKLANIYOR: sitenin her yerinde sezon bölüm
 * numarasından hesaplanıyor (bkz. episodes.js, gallery.js) ve elle hiç
 * yazılmıyor — "sezon yanlış olamaz" ilkesi buradan geliyor. Vestuario
 * bilerek istisna: aynı kıyafet bir sürü bölümde görünüyor (35, 78, 190…),
 * yani bir kıyafetin tek bir bölümü YOK. Katalog kıyafetleri sayıyor,
 * görünmeleri değil. Her kıyafet bir kez, ilk göründüğü sezona kaydediliyor.
 *
 * Bunun bedeli: kronolojik sıra yok ve Guía'ya bağlantı verilemiyor.
 * Elimizdeki tek sıra `order` — kataloğu hazırlayanın numaralaması.
 */
const modules = import.meta.glob("./outfits/*.json", { eager: true });

const outfits = Object.entries(modules)
  .map(([path, m]) => ({
    ...m.default,
    id: path.slice(path.lastIndexOf("/") + 1, -".json".length),
  }))
  .sort(
    (a, b) =>
      a.character.localeCompare(b.character) ||
      a.season - b.season ||
      a.order - b.order,
  );

export default outfits;

/* Veride geçen karakterler, görünme sırasına göre değil sabit sırayla:
   Marta önce. Sayfa sekmelerini bundan üretiyor, yani üçüncü bir karakter
   eklenirse sekme kendiliğinden çıkıyor. */
export const CHARACTERS = ["marta", "fina"];

export const charactersIn = (items) =>
  CHARACTERS.filter((c) => items.some((o) => o.character === c));
