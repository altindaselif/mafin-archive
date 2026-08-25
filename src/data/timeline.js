/*
 * Her kilometre taşı ./timeline/ altında kendi dosyasında. Build sırasında
 * toplanıp BÖLÜME göre sıralı tek dizi olarak veriliyor.
 *
 * Neden bölüme göre: timeline tanımı gereği kronolojik. Eskiden elle yazılan
 * bir `number` alanı sıralıyordu, ama o alan bölüm sırasının ikinci bir
 * kopyasıydı — ve sonradan araya bir taş eklendiğinde (mesela 200. bölüm)
 * sıradaki numara verildiği için listenin en sonuna düşüyordu. Bölüme göre
 * sıralayınca yeni taş kendiliğinden doğru yere oturuyor.
 *
 * Kimlik dosya adından türüyor, veride tutulmuyor.
 */
const modules = import.meta.glob("./timeline/*.json", { eager: true });

const milestones = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, m]) => ({
    ...m.default,
    id: path.slice(path.lastIndexOf("/") + 1, -".json".length),
  }))
  .sort((a, b) => a.episode - b.episode);

export default milestones;
