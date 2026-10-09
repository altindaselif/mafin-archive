import styles from "./Press.module.css";
import press from "../../data/press.js";
import { formatDate, useLang } from "../../i18n.js";

const L = {
  title: { es: "Prensa", en: "Press" },
  subtitle: {
    es: "Entrevistas a Alba Brunet y Marta Belmonte, en texto y en vídeo.",
    en: "Interviews with Alba Brunet and Marta Belmonte, written and filmed.",
  },
  readOn: { es: "Leer en", en: "Read on" },
};

export default function Press() {
  const { lang, t } = useLang();
  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep561.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>

      <div className={styles.grid}>
        {press.map((item) => (
          <a
            key={item.id}
            className={styles.card}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.top}>
              <span className={styles.outlet}>{item.outlet}</span>
              <time className={styles.date} dateTime={item.date}>
                {formatDate(item.date, lang)}
              </time>
            </div>
            <h2 className={styles.title}>{t(item.title)}</h2>
            <span className={styles.cta}>
              {t(L.readOn)} {item.outlet}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                aria-hidden="true"
              >
                <path
                  d="M2 10L10 2M4 2h6v6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
