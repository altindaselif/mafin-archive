import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./Episodes.module.css";
import SearchInput from "../../components/SearchInput/SearchInput.jsx";
import MoodFilter from "../../components/MoodFilter/MoodFilter.jsx";
import SeasonFilter from "../../components/SeasonFilter/SeasonFilter.jsx";
import MoodTags from "../../components/MoodTags/MoodTags.jsx";
import Pager from "../../components/Pager/Pager.jsx";
import episodes from "../../data/episodes.js";
import { useLang } from "../../i18n.js";

const L = {
  title: { es: "Guía de capítulos", en: "Episode Guide" },
  subtitle: {
    es: "Cada capítulo de la historia Mafin, resumido. Busca, o filtra por temática para encontrar los momentos que te apetece revivir.",
    en: "Every chapter of the Mafin story, summarized. Search, or filter by mood to find the moments you feel like reliving.",
  },
  searchPlaceholder: { es: "Buscar capítulos…", en: "Search episodes…" },
  episode: { es: "capítulo", en: "episode" },
  episodes: { es: "capítulos", en: "episodes" },
  readAria: {
    es: "Leer la sinopsis completa del capítulo",
    en: "Read the full synopsis of episode",
  },
  pagerAria: { es: "Paginación de capítulos", en: "Episode pagination" },
  empty: {
    es: "Ningún capítulo coincide en esta temporada. Ajusta la búsqueda, las temáticas o cambia de volumen.",
    en: "No episode matches in this season. Adjust the search, the moods, or switch volumes.",
  },
};

const DATE_LOCALE = { es: "es-ES", en: "en-GB" };
const fmtDay = (iso) => new Date(iso).getUTCDate();
const fmtMonthYear = (iso, lang) =>
  new Date(iso).toLocaleDateString(DATE_LOCALE[lang] ?? "es-ES", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const PAGE_SIZE = 30; // keeps each "page" of the guide a comfortable scroll

// Baby and Cloe episodes are unwanted: their tags exclude instead of
// include, so they sit last, apart from the regular moods.
const EXCLUDED_MOODS = ["baby", "cloe"];
const EXCLUSIONS = new Set(EXCLUDED_MOODS);
const ALL_MOODS = [
  ...[...new Set(episodes.flatMap((e) => e.moods))].filter(
    (m) => !EXCLUSIONS.has(m),
  ),
  ...EXCLUDED_MOODS,
];
const SEASONS = [...new Set(episodes.map((e) => e.season))].sort(
  (a, b) => a - b,
);

export default function Episodes() {
  const { lang, t } = useLang();
  const [activeSeason, setActiveSeason] = useState(1);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query); // keeps typing responsive as the guide grows
  const [activeMoods, setActiveMoods] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const skipPageReset = useRef(false); // deep-link sets its own page
  const scrollTarget = useRef(null); // episode number to scroll to after paging

  // Any change of season, search, or moods starts again at the first folio —
  // unless a deep link just set the season/page on purpose.
  useEffect(() => {
    if (skipPageReset.current) {
      skipPageReset.current = false;
      return;
    }
    setPage(1);
  }, [activeSeason, deferredQuery, activeMoods]);

  // Deep link from "On this day": /guide?ep=415 opens that chapter's summary.
  useEffect(() => {
    const ep = searchParams.get("ep");
    if (!ep) return;
    const target = episodes.find((e) => e.number === Number(ep));
    if (target) {
      const seasonEps = episodes.filter((e) => e.season === target.season);
      const idx = seasonEps.findIndex((e) => e.number === target.number);
      skipPageReset.current = true; // keep the page we compute below
      setQuery("");
      setActiveMoods(new Set());
      setActiveSeason(target.season);
      setPage(Math.floor(idx / PAGE_SIZE) + 1);
      setExpandedId(target.id);
      scrollTarget.current = target.number;
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const toggleMood = (mood) =>
    setActiveMoods((prev) => {
      const next = new Set(prev);
      next.has(mood) ? next.delete(mood) : next.add(mood);
      return next;
    });

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return episodes.filter((ep) => {
      // Season narrows the volume first; search and moods act within it.
      if (ep.season !== activeSeason) return false;
      const haystack =
        `${ep.number} ${t(ep.title)} ${t(ep.description)}`.toLowerCase();
      const byText = !q || haystack.includes(q);
      // Baby & Cloe work in reverse: active means "hide these episodes"
      if ([...activeMoods].some((m) => EXCLUSIONS.has(m) && ep.moods.includes(m)))
        return false;
      const includeMoods = [...activeMoods].filter((m) => !EXCLUSIONS.has(m));
      const byMood =
        includeMoods.length === 0 ||
        ep.moods.some((m) => includeMoods.includes(m));
      return byText && byMood;
    });
  }, [deferredQuery, activeMoods, activeSeason, t]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goToPage = (next) => {
    setPage(next);
    setExpandedId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // After a deep link switches to the right page, scroll to that chapter.
  useEffect(() => {
    if (scrollTarget.current == null) return;
    const el = document.getElementById(`guide-ep-${scrollTarget.current}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      scrollTarget.current = null;
    }
  }, [currentPage, expandedId]);

  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep61.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>

      <div className={styles.controls}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t(L.searchPlaceholder)}
        />
        <MoodFilter
          moods={ALL_MOODS}
          active={activeMoods}
          onToggle={toggleMood}
          exclusions={EXCLUSIONS}
        />
      </div>

      <div className={styles.seasonSlot}>
        <SeasonFilter
          seasons={SEASONS}
          activeSeason={activeSeason}
          onSeasonChange={setActiveSeason}
        />
        <span className={styles.count} aria-live="polite">
          {filtered.length}{" "}
          {filtered.length === 1 ? t(L.episode) : t(L.episodes)}
        </span>
      </div>

      <ul className={styles.list}>
        {paged.map((ep) => {
          const expanded = expandedId === ep.id;
          return (
            <li
              key={ep.id}
              id={`guide-ep-${ep.number}`}
              className={`${styles.row} ${expanded ? styles.rowOpen : ""}`}
            >
              {/* Whole row toggles the accordion */}
              <div
                className={styles.rowMain}
                role="button"
                tabIndex={0}
                onClick={() => setExpandedId(expanded ? null : ep.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedId(expanded ? null : ep.id);
                  }
                }}
                aria-expanded={expanded}
                aria-label={`${t(L.readAria)} ${ep.number}`}
              >
                <span className={styles.number}>
                  {String(ep.number).padStart(2, "0")}
                </span>

                <div className={styles.middle}>
                  <MoodTags moods={ep.moods} />
                  <h2 className={styles.title}>{t(ep.title)}</h2>
                  {/* Clamped snippet hides while the accordion is open */}
                  {!expanded && (
                    <p className={styles.snippet}>{t(ep.description)}</p>
                  )}
                </div>

                {ep.airDate && (
                  <time className={styles.date} dateTime={ep.airDate}>
                    <span className={styles.dateDay}>{fmtDay(ep.airDate)}</span>
                    <span className={styles.dateMonth}>
                      {fmtMonthYear(ep.airDate, lang)}
                    </span>
                  </time>
                )}
              </div>

              {/* Accordion: grid-rows 0fr → 1fr for a smooth height animation */}
              <div
                className={`${styles.accordion} ${expanded ? styles.accordionOpen : ""}`}
              >
                <div className={styles.accordionInner}>
                  <p className={styles.fullText}>{t(ep.description)}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Pager
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        label={t(L.pagerAria)}
      />

      {filtered.length === 0 && <p className={styles.empty}>{t(L.empty)}</p>}
    </div>
  );
}
