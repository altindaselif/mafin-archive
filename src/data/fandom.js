/*
 * Her aportación kendi dosyasında, ./fandom/ altında. Build sırasında
 * toplanıp tek dizi olarak veriliyor — diğer koleksiyonlarla (bölümler,
 * alıntılar, galeri) aynı düzen.
 *
 * Bu düzen CMS için şart: onay bekleyen bir aportación ayrı bir dosya
 * olarak gelirse CMS onu tek başına gösterip düzenlenebiliyor. Tek büyük
 * JSON olsaydı her onay tüm dosyayı yeniden yazmak olurdu.
 *
 * Sıralama yeniden eskiye: en son gelen eser üstte.
 */
const modules = import.meta.glob("./fandom/*.json", { eager: true });

const entries = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.number - a.number);

export default entries;
