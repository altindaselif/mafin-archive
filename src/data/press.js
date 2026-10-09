/*
 * Her basın kaydı ./press/ altında kendi dosyasında, TARİHE göre sıralı,
 * en yeni en üstte.
 *
 * Eskiden elle yazılan bir `number` alanı sıralıyordu; o alan tarih
 * sırasının ikinci bir kopyasıydı. Tarihe göre sıralayınca eski bir yazı
 * sonradan eklense bile kendi yerine oturuyor.
 *
 * Kimlik dosya adından türüyor, veride tutulmuyor.
 */
const modules = import.meta.glob("./press/*.json", { eager: true });

/* Eksik alanlar burada bir kez normalleştiriliyor: `people` ve `format`
   sonradan eklendi, yani eski kayıtlarda yoklar ve CMS'te biri boş
   bırakılabilir. Varsayılanı sayfada her kullanım yerinde ayrı ayrı
   yazmak yerine tek yerde veriyoruz — kayıt eksik diye LİSTEDEN DÜŞMESİN,
   yalnızca süzgeçte yazılı sayılsın. */
const press = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, m]) => ({
    ...m.default,
    people: m.default.people ?? [],
    format: m.default.format ?? "texto",
    id: path.slice(path.lastIndexOf("/") + 1, -".json".length),
  }))
  .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

export default press;
