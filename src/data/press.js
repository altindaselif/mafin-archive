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

const press = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, m]) => ({
    ...m.default,
    id: path.slice(path.lastIndexOf("/") + 1, -".json".length),
  }))
  .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

export default press;
