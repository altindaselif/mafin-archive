import styles from "./Acknowledgements.module.css";
import { useLang } from "../../i18n.js";

/*
 * Agradecimientos — arşive emeği geçenler.
 *
 * Kolofon sayfası: ana sayfadaki ızgarada BİLEREK yok (orası tam 10 karo
 * = 5x2, on birincisi düzeni bozar), yalnızca üst menüdeki "Más"
 * listesinden ve künyeden geçiliyor. Kitabın sonundaki teşekkür sayfası
 * gibi — arayan bulur, arayan olmayanı rahatsız etmez.
 *
 * NEDEN İŞE GÖRE DEĞİL KİŞİYE GÖRE: önce işe göre gruplanmıştı
 * ("Contenido: @a, @b, @c"). Liste tamamlanınca görüldü ki aynı kişi
 * birden fazla iş yapıyor — biri üç grupta birden geçiyordu. Teşekkür
 * sayfasında aynı ismi üç kez görmek listeyi insanların değil işlerin
 * listesine çeviriyor. Şimdi herkes bir kez, yaptığı işler yanında.
 *
 * YENİ KİŞİ EKLEMEK: aşağıdaki PEOPLE dizisine bir satır ekle, başka
 * hiçbir yere dokunma. Sıra listedeki sıra — alfabetik değil, bilerek.
 *
 * `url` isteğe bağlı: bağlantısı olmayan biri düz metin olarak çizilir
 * (herkesin sosyal hesabı olmak zorunda değil).
 */

const PEOPLE = [
  {
    handle: "@gini__us",
    url: "https://x.com/gini__us",
    work: {
      es: "Compañera en la idea de este archivo · fotografías de rodaje",
      en: "Partner in the idea for this archive · behind-the-scenes photographs",
    },
  },
  {
    handle: "@hudriemd",
    url: "https://x.com/hudriemd",
    work: {
      es: "Sinopsis y citas · revisión del español",
      en: "Synopses and quotes · Spanish proofreading",
    },
  },
  {
    handle: "@luimeliaaeps",
    url: "https://x.com/luimeliaaeps",
    work: {
      es: "Citas y personajes · revisión del español",
      en: "Quotes and characters · Spanish proofreading",
    },
  },
  {
    handle: "@starryskyEN",
    url: "https://x.com/starryskyEN",
    work: {
      es: "Cortes de vídeo y subtítulos",
      en: "Video edits and subtitles",
    },
  },
  {
    handle: "@iamsway88",
    url: "https://x.com/iamsway88",
    work: {
      es: "Fotografías del vestuario",
      en: "Outfit photographs",
    },
  },
  {
    handle: "@ay_ayno",
    url: "https://x.com/ay_ayno",
    work: {
      es: "Sinopsis · revisión del español",
      en: "Synopses · Spanish proofreading",
    },
  },
  {
    handle: "@yvsunflower",
    url: "https://x.com/yvsunflower",
    work: {
      es: "Biografía y filmografía de Marta Belmonte",
      en: "Marta Belmonte's biography and filmography",
    },
  },
  {
    handle: "@PerfectlyEspos",
    url: "https://x.com/PerfectlyEspos",
    work: {
      es: "Biografía y filmografía de Alba Brunet",
      en: "Alba Brunet's biography and filmography",
    },
  },
  {
    handle: "@reyizag",
    url: "https://x.com/reyizag",
    work: {
      es: "Revisión del español",
      en: "Spanish proofreading",
    },
  },
  {
    handle: "@SeRechista",
    url: "https://x.com/SeRechista",
    work: {
      es: "Mafin en cifras",
      en: "Mafin in numbers",
    },
  },
  {
    handle: "@mrscoulterr",
    url: "https://x.com/mrscoulterr",
    work: {
      es: "Pruebas del sitio y fe en él desde el principio",
      en: "Site testing, and faith in it from the start",
    },
  },
];

const L = {
  title: { es: "Agradecimientos", en: "Acknowledgements" },
  /* Tek cümle, bilerek. Önce iki cümleydi ve ikincisi ("Estos son sus
     nombres") altındaki listeyi ilan etmekten başka bir iş yapmıyordu —
     isimler zaten orada. Yerine listenin NE TÜR işler içerdiğini söyleyen
     bir cümle kondu: okuyucu listeye hazırlıklı giriyor. Künyedeki
     "Nada de esto existiría sin ellas" bağlantısından gelindiği için
     cümle onu tekrar etmiyor, devam ediyor. */
  subtitle: {
    es: "Lo escribieron, lo tradujeron, lo fotografiaron y lo corrigieron. Todo lo que hay aquí se lo debe a ellas.",
    en: "They wrote it, translated it, photographed it and corrected it. Everything here owes itself to them.",
  },
  /* Kapanışın işi listenin yapamadığını yapmak: üstte on bir kişi adıyla
     sayılı, burada adı yazılmamış ya da yazılamayacak kadar küçük bir
     katkı yapmış olanlar ve okuyanlar içeri alınıyor. */
  closing: {
    es: "Y a quienes ayudaron sin aparecer en esta lista, y a quienes lo leen: gracias.",
    en: "And to everyone who helped without appearing on this list, and to everyone who reads it: thank you.",
  },
  /* KOLOFON, LİSTE DEĞİL. Listeye girmek için bir sebep yok: sayfanın
     altyazısı "todo lo que hay aquí se lo debe a ellas" diyor ve arşivi
     yapan kişi o cümlenin öznesi olamaz — kendine teşekkür etmiş olur.
     Kitaplar bunu ayırır: teşekkür sayfası başkalarını anar, kolofon
     kitabı kimin yaptığını kaydeder. Bu satır ikincisi.
     Ses de ona göre: teşekkür cümlesi değil, künye. Fiil yok, isim
     öbekleri var ve listedeki satırlarla aynı ayraçla (·) diziliyor. */
  /* CÜMLE, KÜNYE SATIRI DEĞİL. Önce listenin satır dilinde yazılmıştı
     (solda hesap, sağda italik iş) ama o biçim listeyi bitirmiyor,
     uzatıyordu — on ikinci bir teşekkür satırı gibi okunuyordu.
     Cümle olunca sayfanın dışına çıkıyor: liste kimlere teşekkür
     edildiğini sayar, bu satır arşivi kimin yaptığını söyler.
     İspanyolcası sayfanın altyazısındaki kalıbı sürdürüyor —
     "LO escribieron, LO tradujeron, LO fotografiaron" — burada da
     "LO diseñó y LO programó". Aynı ses, farklı iş.
     Hesap adı cümlenin ortasında bağlantı olduğu için metin ikiye
     bölünmüş durumda; iki dilde de virgül `after`ın başında. */
  colophonBefore: {
    /* "Este/This", "El/The" DEĞİL: sayfa kendinden bahsederken zaten
       böyle diyor ("Compañera en la idea de este archivo"). İki dil de
       aynı sözcükle başlasın. */
    es: "Este archivo lo diseñó y lo programó ",
    en: "This archive was designed and built by ",
  },
  colophonAfter: {
    es: ", que también escribió las sinopsis y reunió las entrevistas.",
    en: ", who also wrote the synopses and gathered the interviews.",
  },
};

/* Arşivi yapan kişi. Ayrı duruyor, PEOPLE'a girmiyor — gerekçesi
   yukarıda. */
const AUTHOR = {
  handle: "@annadewitt125",
  url: "https://x.com/annadewitt125",
};

export default function Acknowledgements() {
  const { t } = useLang();

  return (
    <div className="page page-no-art">
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>

      <dl className={styles.list}>
        {PEOPLE.map((p) => (
          <div key={p.handle} className={styles.entry}>
            <dt className={styles.person}>
              {p.url ? (
                <a
                  className={styles.link}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.handle}
                </a>
              ) : (
                p.handle
              )}
            </dt>
            <dd className={styles.work}>{t(p.work)}</dd>
          </div>
        ))}
      </dl>

      <p className={styles.closing}>{t(L.closing)}</p>

      {/* Sayfanın kolofonu: kapanış cümlesinden sonra, düz bir cümle. */}
      <p className={styles.colophon}>
        {t(L.colophonBefore)}
        <a
          className={styles.link}
          href={AUTHOR.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {AUTHOR.handle}
        </a>
        {t(L.colophonAfter)}
      </p>
    </div>
  );
}
