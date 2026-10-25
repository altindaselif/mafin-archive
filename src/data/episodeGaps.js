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
    /* Timeline'daki boşlukla BİREBİR aynı metin. İkisi aynı deliği
       işaretliyor (612'den sonrası), o yüzden iki ayrı cümle kurmak
       aynı şeyi iki ayrı şeymiş gibi gösteriyordu.
       Not: 559. bölümün adı da "El de la pesadilla" — aynı listede iki
       kez geçen bir ad. Bilerek böyle. */
    title: { es: "La pesadilla", en: "The Nightmare" },
    text: {
      es: "Entre estos dos momentos hay capítulos que este archivo ha decidido no recordar.",
      en: "Between these two moments there are chapters this archive has chosen not to remember.",
    },
  },
];

export default episodeGaps;
