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
 * YENİ KİŞİ EKLEMEK: aşağıdaki CREDITS dizisine ekle, başka hiçbir yere
 * dokunma. Aynı kişi birden fazla grupta geçebilir.
 *
 * `handle` zorunlu, `url` isteğe bağlı: bağlantısı olmayan biri düz
 * metin olarak çizilir (herkesin sosyal hesabı olmak zorunda değil).
 */

const CREDITS = [
  {
    role: { es: "Contenido", en: "Content" },
    people: [
      { handle: "@gini__us", url: "https://x.com/gini__us" },
      { handle: "@luimeliaaeps", url: "https://x.com/luimeliaaeps" },
      { handle: "@hudriemd", url: "https://x.com/hudriemd" },
      { handle: "@annadewitt125", url: "https://x.com/annadewitt125" },
    ],
  },
  {
    role: { es: "Cortes y subtítulos", en: "Cuts and subtitles" },
    people: [{ handle: "@starryskyEN", url: "https://x.com/starryskyEN" }],
  },
  /* Örnek — doldurulacak:
  {
    role: { es: "Fotografías", en: "Photographs" },
    people: [{ handle: "@kullanici" }],
  },
  {
    role: { es: "En cifras", en: "The numbers" },
    people: [{ handle: "@kullanici", url: "https://x.com/kullanici" }],
  },
  */
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
        {CREDITS.map((group) => (
          <div key={group.role.en} className={styles.group}>
            <dt className={styles.role}>{t(group.role)}</dt>
            <dd className={styles.people}>
              {group.people.map((p) =>
                p.url ? (
                  <a
                    key={p.handle}
                    className={styles.person}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {p.handle}
                  </a>
                ) : (
                  <span key={p.handle} className={styles.person}>
                    {p.handle}
                  </span>
                ),
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className={styles.closing}>{t(L.closing)}</p>
    </div>
  );
}
