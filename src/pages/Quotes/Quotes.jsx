import { useDeferredValue, useEffect, useMemo, useState } from "react";
import styles from "./Quotes.module.css";
import SearchInput from "../../components/SearchInput/SearchInput.jsx";
import SeasonFilter from "../../components/SeasonFilter/SeasonFilter.jsx";
import Pager from "../../components/Pager/Pager.jsx";
import quotes from "../../data/quotes.js";
import { SEASONS, seasonOf } from "../../data/seasonInfo.js";
import { useLang } from "../../i18n.js";

const L = {
  title: { es: "Citas", en: "Quotes" },
  subtitle: {
    es: "Una colección de frases inolvidables, las palabras que nos llegaron al corazón. Busca o filtra por personaje para encontrar las palabras que te apetece revivir.",
    en: "A collection of unforgettable lines, the words that captured our hearts. Search or filter by character to find the words you feel like reliving.",
  },
  searchPlaceholder: { es: "Buscar una cita…", en: "Search a quote…" },
  voice: { es: "Personaje", en: "Character" },
  all: { es: "Todos", en: "All" },
  quote: { es: "cita", en: "quote" },
  quotes: { es: "citas", en: "quotes" },
  ep: { es: "Cap.", en: "Ep." },
  pagerAria: { es: "Paginación de citas", en: "Quote pagination" },
  empty: {
    es: "Ninguna cita coincide en esta temporada. Prueba con otra palabra, otro personaje u otro volumen.",
    en: "No quote matches in this season. Try another word, another character, or another volume.",
  },
};

const SPEAKERS = ["All", "Marta", "Fina", "Mafin"];

const BADGE_CLASS = {
  Marta: "badgeMarta",
  Fina: "badgeFina",
  Mafin: "badgeBoth",
};

/*
 * Shared quotes are written as "Marta: … Fina: …" in the data and
 * rendered like a page of the shooting script: one line per turn,
 * the character's name in small caps and their own colour.
 * Returns null when the text doesn't parse, so the plain layout
 * can take over.
 */
const parseDialogue = (text) => {
  const parts = text.split(/(Marta|Fina):\s*/).filter((p) => p.trim() !== "");
  const turns = [];
  for (let i = 0; i < parts.length - 1; i += 2) {
    if (parts[i] !== "Marta" && parts[i] !== "Fina") return null;
    turns.push({ name: parts[i], line: parts[i + 1].trim() });
  }
  return turns.length >= 2 ? turns : null;
};

const PAGE_SIZE = 25; // same folio length as the episode guide

export default function Quotes() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [speaker, setSpeaker] = useState("All");
  const [activeSeason, setActiveSeason] = useState(1);
  const [page, setPage] = useState(1);

  // Any change of season, search, or voice starts again at the first folio
  useEffect(() => {
    setPage(1);
  }, [activeSeason, deferredQuery, speaker]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return quotes.filter((quote) => {
      // Season narrows the volume first; search and voice act within it.
      if (seasonOf(quote.episode) !== activeSeason) return false;
      const bySpeaker = speaker === "All" || quote.speaker === speaker;
      const byText = !q || t(quote.text).toLowerCase().includes(q);
      return bySpeaker && byText;
    });
  }, [deferredQuery, speaker, activeSeason, t]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goToPage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep269.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>

      <div className={styles.controls}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t(L.searchPlaceholder)}
        />
        <label className={styles.selectWrap}>
          <span className={styles.selectLabel}>{t(L.voice)}</span>
          <select
            className={styles.select}
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
          >
            {SPEAKERS.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? t(L.all) : s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.seasonSlot}>
        <SeasonFilter
          seasons={SEASONS}
          activeSeason={activeSeason}
          onSeasonChange={setActiveSeason}
        />
        <span className={styles.count} aria-live="polite">
          {filtered.length} {filtered.length === 1 ? t(L.quote) : t(L.quotes)}
        </span>
      </div>

      <ul className={styles.list}>
        {paged.map((quote) => (
          <li key={quote.id} className={styles.row}>
            <span className={styles.episode}>
              {t(L.ep)} {quote.episode}
            </span>
            {(() => {
              const turns =
                quote.speaker === "Mafin" ? parseDialogue(t(quote.text)) : null;
              if (!turns)
                return (
                  <p className={styles.text}>&ldquo;{t(quote.text)}&rdquo;</p>
                );
              return (
                <div className={styles.dialogue}>
                  {turns.map((turn, i) => (
                    <p key={i} className={styles.dialogueLine}>
                      {/* Playscript convention: NAME — line */}
                      <span
                        className={`${styles.dialogueName} ${
                          turn.name === "Marta"
                            ? styles.nameMarta
                            : styles.nameFina
                        }`}
                      >
                        {turn.name} —
                      </span>
                      {turn.line}
                    </p>
                  ))}
                </div>
              );
            })()}
            <span
              className={`${styles.badge} ${styles[BADGE_CLASS[quote.speaker]] ?? ""}`}
            >
              {quote.speaker}
            </span>
          </li>
        ))}
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
