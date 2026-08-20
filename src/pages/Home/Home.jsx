import { useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import SectionIcon from "../../components/SectionIcon/SectionIcon.jsx";
import quotes from "../../data/quotes.js";
import episodes from "../../data/episodes.js";
import { COMMON, useLang } from "../../i18n.js";
import Stats from "../../components/Stats/Stats.jsx";

/* The foyer's doors: every section, one symmetric card each. Icons are
   hand-drawn line-art in the site's language — no imported icon set. */
const SECTIONS = [
  { to: "/timeline", icon: "history",
    title: { es: "Su historia", en: "The Story" },
    desc: { es: "La relación, momentos clave.", en: "The relationship, milestone by milestone." } },
  { to: "/guide", icon: "episodes",
    title: { es: "Guía", en: "Guide" },
    desc: { es: "Cada capítulo resumido y ordenado por temática.", en: "Every chapter summary, sorted by mood." } },
  { to: "/videos", icon: "videos",
    title: { es: "Vídeos", en: "Videos" },
    desc: { es: "Cada mirada, beso y lágrima, en vídeo.", en: "Every look, kiss and tear, on video." } },
  { to: "/gallery", icon: "gallery",
    title: { es: "Galería", en: "Gallery" },
    desc: { es: "Fotografías de cada capítulo.", en: "Photographs from every chapter." } },
  { to: "/quotes", icon: "quotes",
    title: { es: "Citas", en: "Quotes" },
    desc: { es: "Las frases que lo definieron todo.", en: "The lines that defined everything." } },
  { to: "/characters", icon: "characters",
    title: { es: "Personajes", en: "Characters" },
    desc: { es: "Todos los que marcaron su historia.", en: "Everyone who shaped their story." } },
  { to: "/actors", icon: "actors",
    title: { es: "Actrices", en: "Actresses" },
    desc: { es: "Las intérpretes de Marta y Fina.", en: "The actresses behind Marta and Fina." } },
  { to: "/press", icon: "press",
    title: { es: "Prensa", en: "Press" },
    desc: { es: "Mafin en los medios.", en: "Mafin in the press." } },
  { to: "/fandom", icon: "fandom",
    title: { es: "El Fandom", en: "The Fandom" },
    desc: { es: "Canciones, fanfics y fan art.", en: "Songs, fanfics and fan art." } },
];

const L = {
  heroSubtitle: {
    es: "Un archivo dedicado a la historia de Marta y Fina",
    en: "An archive devoted to the story of Marta and Fina",
  },
  quoteLabel: { es: "Cita del día", en: "Quote of the Day" },
  onThisDay: { es: "Tal día como hoy", en: "On This Day" },
  aired: { es: "Se emitió el capítulo", en: "Episode" },
  airedSuffix: { es: "", en: " aired" },
  yearAgo: { es: "año", en: "year ago" },
  yearsAgoWord: { es: "años", en: "years ago" },
  agoPrefix: { es: "Hace", en: "" },
  neutral: {
    es: "El archivo sigue abierto. Vuelve mañana para otro recuerdo de su historia.",
    en: "The archive remains open. Come back tomorrow for another memory of their story.",
  },
  explore: { es: "Explorar el archivo", en: "Explore the archive" },
};

/* "Hace 2 años" / "2 years ago" — the two languages build the phrase in
 * different orders, so it lives in one helper instead of the JSX. */
const agoPhrase = (years, t) =>
  years
    ? `${t(L.agoPrefix)} ${years} ${years === 1 ? t(L.yearAgo) : t(L.yearsAgoWord)}: `.trimStart()
    : "";

/*
 * Pool for the daily card: solo voices only (dialogues need the script
 * layout of the quotes page) and short enough to sit comfortably in a
 * single card. Spanish text is the reference length.
 */
const DAILY_MAX_LENGTH = 160;
const DAILY_POOL = quotes.filter(
  (q) => q.speaker !== "Mafin" && (q.text.es ?? "").length <= DAILY_MAX_LENGTH
);

export default function Home() {
  const { t } = useLang();
  // Deterministic "quote of the day": same quote for everyone all day,
  // changing at midnight. The multiplicative hash (Knuth) scatters the
  // sequence so consecutive days don't read the array in order.
  const dailyQuote = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now - new Date(now.getFullYear(), 0, 0)) / 86_400_000
    );
    const seed = (now.getFullYear() * 366 + dayOfYear) * 2654435761;
    return DAILY_POOL[seed % DAILY_POOL.length];
  }, []);

  // "En este día": the broadcast anniversary of an episode aired on this
  // date (the oldest broadcast makes the biggest anniversary); failing
  // that, a quiet neutral line so the block is never an empty gap.
  const todayLine = useMemo(() => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const mmdd = `${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const aired = episodes
      .filter((e) => e.airDate?.slice(5) === mmdd)
      .sort((a, b) => a.airDate.localeCompare(b.airDate))[0];
    if (aired) {
      return {
        years: now.getFullYear() - Number(aired.airDate.slice(0, 4)),
        aired,
      };
    }

    return null;
  }, []);

  // Language-dependent strings resolve at render time, not inside the memo
  const todayText = todayLine
    ? `${t(L.aired)} ${todayLine.aired.number}${t(L.airedSuffix)}`
    : null;

  return (
    <div>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroImage} aria-hidden="true" />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>1958 · Toledo</p>
          <h1 className={styles.heroTitle}>Mafin</h1>
          <p className={styles.heroSubtitle}>{t(L.heroSubtitle)}</p>
        </div>
      </section>

      {/* ── Daily quote ── */}
      <section className={styles.quoteSection}>
        <figure className={styles.quoteCard}>
          <figcaption className={styles.quoteLabel}>{t(L.quoteLabel)}</figcaption>
          <blockquote className={styles.quoteText}>
            &ldquo;{t(dailyQuote.text)}&rdquo;
          </blockquote>
          <p className={styles.quoteMeta}>
            — {dailyQuote.speaker}, {t(COMMON.episode).toLowerCase()} {dailyQuote.episode}
          </p>
        </figure>
      </section>

      {/* ── En este día (always shown; falls back to a neutral line) ── */}
      <section className={styles.ephemeris}>
        <span className={styles.ephemerisLabel}>{t(L.onThisDay)}</span>
        <p className={todayLine ? styles.ephemerisIntro : styles.ephemerisText}>
          {todayLine ? (
            <>
              {agoPhrase(todayLine.years, t)}
              {todayText}
            </>
          ) : (
            t(L.neutral)
          )}
        </p>
        {todayLine && (
          <p className={styles.ephemerisTitle}>
            <Link
              to={`/guide?ep=${todayLine.aired.number}`}
              className={styles.ephemerisTitleLink}
            >
              &laquo;{t(todayLine.aired.title)}&raquo;
            </Link>
          </p>
        )}
      </section>

      {/* ── Section grid (the foyer) ── */}
      <section className={styles.sections} aria-label={t(L.explore)}>
        <div className={styles.grid}>
          {SECTIONS.map((s) => (
            <Link key={s.to} to={s.to} className={styles.tile}>
              <SectionIcon name={s.icon} className={styles.tileIcon} />
              <h2 className={styles.tileTitle}>{t(s.title)}</h2>
              <p className={styles.tileDesc}>{t(s.desc)}</p>
            </Link>
          ))}
        </div>
      </section>

      <Stats />
    </div>
  );
}
