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
      es: "Pruebas y apoyo",
      en: "Testing and support",
    },
  },
];

const L = {
  title: { es: "Agradecimientos", en: "Acknowledgements" },
  subtitle: {
    es: "Este archivo existe porque mucha gente le dedicó su tiempo. Estos son sus nombres.",
    en: "This archive exists because many people gave it their time. These are their names.",
  },
  closing: {
    es: "Y a quienes comparten, corrigen y recuerdan: gracias.",
    en: "And to everyone who shares, corrects and remembers: thank you.",
  },
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
    </div>
  );
}
