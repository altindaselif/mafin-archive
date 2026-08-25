/*
 * Her aportación kendi dosyasında, ./fandom/ altında. Build sırasında
 * toplanıp tek dizi olarak veriliyor.
 *
 * Bu düzen CMS için şart: onay bekleyen bir aportación ayrı bir dosya
 * olarak gelirse CMS onu tek başına gösterip düzenlenebiliyor. Tek büyük
 * JSON olsaydı her onay tüm dosyayı yeniden yazmak olurdu.
 *
 * Sıralama tarihe göre, en yeni üstte. Aynı gün gelen eserler dosya adı
 * sırasında kalıyor. Eskiden elle yazılan bir `number` alanı vardı; hem
 * worker'ın hem editörün onu doldurması gerekiyordu, oysa sıralamayı
 * zaten tarih belirliyordu.
 *
 * Kimlik dosya adından türüyor, veride tutulmuyor.
 */
const modules = import.meta.glob("./fandom/*.json", { eager: true });

const entries = Object.entries(modules)
  .sort(([a], [b]) => b.localeCompare(a))
  .map(([path, m]) => ({
    ...m.default,
    id: path.slice(path.lastIndexOf("/") + 1, -".json".length),
  }))
  .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

export default entries;
