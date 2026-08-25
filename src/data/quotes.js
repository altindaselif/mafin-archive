/*
 * Her alıntı ./quotes/ altında kendi dosyasında. Build sırasında toplanıp
 * bölüme göre sıralı tek dizi olarak veriliyor.
 *
 * SIRALAMA: yalnızca bölüm numarasına göre. Aynı bölümdeki alıntıların
 * kendi aralarındaki sırası önemli değil — dosya adı sırasında kalıyorlar
 * (JS sıralaması kararlı olduğu için bu her derlemede aynı çıkıyor).
 *
 * KİMLİK: dosya adından türüyor, veride tutulmuyor. Eskiden CMS'te elle
 * yazılan bir `number` alanı hem dosya adını hem sırayı belirliyordu; bu
 * ikisi çelişiyordu (dosya adı benzersiz olsun diye "en sondan devam et"
 * gerekiyordu, ama o da yeni alıntıyı bölümün en altına atıyordu). Artık
 * dosya adını CMS kendisi üretiyor, kimlik de oradan geliyor.
 */
const modules = import.meta.glob("./quotes/*.json", { eager: true });

const quotes = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, m]) => ({
    ...m.default,
    id: path.slice(path.lastIndexOf("/") + 1, -".json".length),
  }))
  .sort((a, b) => a.episode - b.episode);

export default quotes;
