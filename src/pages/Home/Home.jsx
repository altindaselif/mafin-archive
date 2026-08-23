import { useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import SectionIcon from "../../components/SectionIcon/SectionIcon.jsx";
import { COMMON, useLang } from "../../i18n.js";
import { useHomeIndex } from "../../data/homeIndex.js";
import Stats from "../../components/Stats/Stats.jsx";

/* The foyer's doors: one symmetric card each. Icons are hand-drawn line-art
   in the site's language — no imported icon set.
   TAM SEKİZ kart: ızgara 4×2 olarak tasarlandı, dokuzuncu kart tek başına
   üçüncü satıra düşüyor. Yeni bir bölüm eklenirse ya biri çıkmalı ya da
   Home.module.css'teki sütun sayısı yeniden düşünülmeli.
   Fandom kasten burada değil — üst menüdeki "Más" listesinden erişiliyor. */
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

export default function Home() {
  const { t } = useLang();
  /*
   * Eskiden bu sayfa quotes.js (96 KB) ve episodes.js (408 KB) dosyalarının
   * tamamını import ediyordu — ikisinden de sadece birkaç alan kullandığı
   * halde. Artık build'de üretilen hafif indeksi (87 KB) fetch ediyor;
   * hero ve bölüm kartları veriyi beklemeden çiziliyor.
   */
  const index = useHomeIndex();

  // Deterministic "quote of the day": same quote for everyone all day,
  // changing at midnight. The multiplicative hash (Knuth) scatters the
  // sequence so consecutive days don't read the array in order.
  const dailyQuote = useMemo(() => {
    const pool = index?.quotePool;
    if (!pool?.length) return null; // veri yok / havuz boş -> kart çizilmez
    const now = new Date();
    const dayOfYear = Math.floor(
      (now - new Date(now.getFullYear(), 0, 0)) / 86_400_000
    );
    const seed = (now.getFullYear() * 366 + dayOfYear) * 2654435761;
    return pool[seed % pool.length];
  }, [index]);

  /*
   * "En este día": bugünün ay-gününe düşen bölümün yıldönümü.
   * Kazanan bölüm (aynı güne düşenlerin en eskisi) build sırasında
   * hesaplanıp gün tablosuna yazıldı — burada tek anahtarla okunuyor,
   * 616 kayıt taranmıyor.
   */
  const todayLine = useMemo(() => {
    if (!index) return null;
    const now = new Date();
    const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    const hit = index.days[mmdd];
    if (!hit) return null;
    return {
      years: now.getFullYear() - hit.y,
      aired: { number: hit.n, title: hit.t },
    };
  }, [index]);

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

      {/* ── Daily quote (veri gelene kadar çizilmez) ── */}
      {dailyQuote && (
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
      )}

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
