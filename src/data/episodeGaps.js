/*
 * Guía'daki KASITLI boşluklar: yayınlanmış ama arşive alınmamış aralıklar.
 *
 * Timeline'ın boşlukları kendi klasöründe `kind: "gap"` kayıtları olarak
 * duruyor çünkü oranın tek okuyucusu timeline.js. Burada öyle yapılamıyor:
 * `src/data/episodes/` klasörünü sayfanın yanı sıra build-indexes.mjs,
 * sync-airdates.mjs ve CMS de okuyor. Oraya konan bir boşluk kaydı
 * episodeMeta.json'a, home.json'a ve editörün bölüm listesine sızardı.
 * Bu yüzden ayrı dosya — okuyucusu yalnızca Guía.
 *
 * `from` boşluğun İLK bölümü. Nerede biteceği YAZILMIYOR: bir sonraki
 * kataloglanmış bölümden türüyor. Bugün 611'den sonrası boş, yani aralık
 * açık uçlu görünüyor; 681 eklendiği gün etiket kendiliğinden
 * "capítulos 612 – 680" oluyor ve buraya dönüp bir şey düzeltmek
 * gerekmiyor.
 */
const episodeGaps = [
  {
    id: "gap-612",
    from: 612,
    /* "La pesadilla" DEĞİL: 559. bölümün adı zaten o ("El de la
       pesadilla"), ikisi aynı listede karışıyordu. "Laguna" arşivcilikte
       kayıt boşluğunun kendi terimi (laguna documental) — soğuk, teknik
       ve tam da bu yüzden sert. */
    title: { es: "La laguna", en: "The Lacuna" },
    text: {
      es: "Estos capítulos se emitieron. Este archivo ha decidido no recordarlos.",
      en: "These chapters aired. This archive has chosen not to remember them.",
    },
  },
];

export default episodeGaps;
