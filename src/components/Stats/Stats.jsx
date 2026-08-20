import styles from "./Stats.module.css";
import { useLang } from "../../i18n.js";
import episodes from "../../data/episodes.js";

/*
 * "En cifras": the fandom's accounting of the story (compiled by a fan,
 * shared with permission). The total chapter count is read from
 * seasonInfo.js so it stays in sync as the show airs — nothing here is
 * updated by hand day to day. Only these two constants drift slowly and
 * are updated on the rare occasion they change.
 */
const CHAPTERS_WITHOUT_FINA = 182;
const CHAPTERS_OF_CALM = 58;

// Self-syncing chapter count: every episode already aired. Adding new
// episode files updates this automatically — no manual bump needed.
const TODAY = new Date();
const TOTAL_CHAPTERS = episodes.filter(
  (e) => !e.airDate || new Date(e.airDate) <= TODAY
).length;

const STATS = [
  {
    value: TOTAL_CHAPTERS,
    label: { es: "capítulos de la historia", en: "chapters of the story" },
  },
  {
    value: TOTAL_CHAPTERS - CHAPTERS_WITHOUT_FINA,
    label: { es: "juntas en pantalla", en: "both on screen" },
  },
  {
    value: CHAPTERS_WITHOUT_FINA,
    label: { es: "sin Fina", en: "without Fina" },
  },
];

/* The third parties who stood between them, and how long each lingered. */
const THIRD_PARTIES = [
  { name: "Jaime", chapters: 98 },
  { name: "Pelayo", chapters: 326 },
  { name: "Cloe", chapters: 180 },
  { name: "Bianca", chapters: null }, // still on screen
];

const L = {
  label: { es: "En cifras", en: "In Numbers" },
  tercerosLabel: { es: "Los terceros", en: "The Third Parties" },
  tercerosOngoing: { es: "en curso", en: "ongoing" },
  chaptersUnit: { es: "capítulos", en: "chapters" },
  verdict: {
    es: "Nadie ha podido destrozar a Mafin.",
    en: "Nobody has been able to destroy Mafin.",
  },
};

export default function Stats() {
  const { t } = useLang();

  const turbulentChapters = TOTAL_CHAPTERS - CHAPTERS_OF_CALM;
  const lead = {
    es: `${CHAPTERS_OF_CALM} capítulos de calma y ${turbulentChapters} de curvas.`,
    en: `${CHAPTERS_OF_CALM} chapters of calm and ${turbulentChapters} of turbulence.`,
  };

  return (
    <section className={styles.stats}>
      <span className={styles.label}>{t(L.label)}</span>
      <dl className={styles.row}>
        {STATS.map((stat) => (
          <div key={stat.value} className={styles.item}>
            <dd className={styles.value}>{stat.value}</dd>
            <dt className={styles.name}>{t(stat.label)}</dt>
          </div>
        ))}
      </dl>

      <div className={styles.terceros}>
        <span className={styles.tercerosLabel}>{t(L.tercerosLabel)}</span>
        <ul className={styles.tercerosList}>
          {THIRD_PARTIES.map((p) => (
            <li key={p.name} className={styles.tercero}>
              <span className={styles.terceroName}>{p.name}</span>
              <span className={styles.terceroChapters}>
                {p.chapters ? `${p.chapters} ${t(L.chaptersUnit)}` : t(L.tercerosOngoing)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.lead}>{t(lead)}</p>
      <p className={styles.verdict}>{t(L.verdict)}</p>
    </section>
  );
}
