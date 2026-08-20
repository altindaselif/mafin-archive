import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./Videos.module.css";
import SearchInput from "../../components/SearchInput/SearchInput.jsx";
import MoodFilter from "../../components/MoodFilter/MoodFilter.jsx";
import SeasonFilter from "../../components/SeasonFilter/SeasonFilter.jsx";
import VideoCard from "../../components/VideoCard/VideoCard.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import { COMMON, useLang } from "../../i18n.js";
import { VIDEO_BASE_URL, SCENE_PATH } from "../../config.js";
import episodes from "../../data/episodes.js";
import milestones from "../../data/timeline.js";
import { seasonOf } from "../../data/seasonInfo.js";

const L = {
  title: { es: "Vídeos", en: "Videos" },
  subtitle: {
    es: "Cada momento de la historia Mafin, en vídeo. Busca, o filtra por temática para encontrar los momentos que te apetece revivir.",
    en: "Every milestone of the Mafin story, in video. Search, or filter by mood to find the moments you feel like reliving.",
  },
  copyright: {
    es: "Por motivos de derechos de autor, solo compartimos escenas breves, no capítulos completos.",
    en: "For copyright reasons, we share only short scenes, not full episodes.",
  },
  credit: {
    es: "Cortes y subtítulos por",
    en: "Cuts and subtitles by",
  },
  seeInStory: {
    es: "Descubre estos momentos en la cronología →",
    en: "Discover these moments in the timeline →",
  },
  searchPlaceholder: { es: "Buscar vídeos…", en: "Search videos…" },
  loadErrorMsg: {
    es: "No se pudo cargar el catálogo de vídeos. Comprueba la conexión y recarga la página.",
    en: "The video catalogue could not be loaded. Check your connection and reload the page.",
  },
  video: { es: "vídeo", en: "video" },
  videos: { es: "vídeos", en: "videos" },
  empty: {
    es: "Ningún vídeo coincide en esta temporada. Prueba otra búsqueda, otras temáticas u otro volumen.",
    en: "No video matches in this season. Try another search, other moods, or another volume.",
  },
  loadMore: { es: "Cargar más", en: "Load more" },
  remaining: { es: "restantes", en: "remaining" },
  playing: { es: "Reproduciendo", en: "Now playing" },
  player: { es: "Reproductor", en: "Player" },
  untitled: { es: "Sin título", en: "Untitled" },
};

/*
 * The video catalogue is fetched at runtime instead of being bundled:
 * with ~1000 records the JSON would otherwise bloat the JS bundle, and
 * updating the catalogue would require a rebuild. The file lives in
 * /public/data/videos.json and is served as a static asset (CDN-cacheable).
 */
const DATA_URL = `${import.meta.env.BASE_URL}data/videos.json`;

/* Title, moods and season live in the episode guide — a video only
 * stores its episode number and file, and inherits the rest by number.
 * No duplicate data to keep in sync. */
const EPISODE_BY_NUMBER = new Map(episodes.map((e) => [e.number, e]));
/* These clips are the scenes of the timeline's milestones, so titles
 * come from there ("El primer beso"), not the raw episode names. */
const MILESTONE_BY_EPISODE = new Map(milestones.map((m) => [m.episode, m]));

/* How many cards render initially / per "load more" click. Keeps the
 * first paint light even when the filtered result is huge. */
const PAGE_SIZE = 20;

/* Baby videos are unwanted: the tag excludes instead of includes
 * (same convention as the episode guide). It renders last, in ink. */
const EXCLUDED_MOODS = ["baby", "cloe"];
const EXCLUSIONS = new Set(EXCLUDED_MOODS);

export default function Videos() {
  const { t } = useLang();
  const [videos, setVideos] = useState(null); // null = loading
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query); // typing stays responsive on large lists
  const [activeMoods, setActiveMoods] = useState(new Set());
  const [activeSeason, setActiveSeason] = useState(1);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [playing, setPlaying] = useState(null); // the video object shown in the modal
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const controller = new AbortController();
    fetch(DATA_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        /*
         * Normalize at the boundary: the rest of the page trusts the
         * data unconditionally, so every record is made safe HERE, once —
         * no scattered `?? []` guards in filters and derived lists.
         * A non-array payload (broken JSON, wrong path) throws and lands
         * in the catch below, showing the error state.
         */
        if (!Array.isArray(data)) throw new Error("Invalid catalogue format");
        setVideos(
          data.map((v) => {
            const ep = EPISODE_BY_NUMBER.get(v.episode);
            const ms = MILESTONE_BY_EPISODE.get(v.episode);
            const file = typeof v.file === "string" && v.file ? v.file : null;
            return {
              id: v.id ?? `v${v.episode}`,
              episode: v.episode,
              file,
              // scene title from the timeline; fall back to episode name
              title: ms?.title ?? ep?.title ?? L.untitled,
              moods: Array.isArray(ep?.moods) ? ep.moods : [],
              season: Number.isFinite(ep?.season)
                ? ep.season
                : seasonOf(v.episode),
              poster: file
                ? `${import.meta.env.BASE_URL}img/videos-posters/${file.replace(/\.mp4$/, ".jpg")}`
                : null,
            };
          }),
        );
      })
      .catch((err) => {
        if (err.name !== "AbortError") setLoadError(true);
      });
    return () => controller.abort();
  }, []);

  /*
   * Deep link from the timeline: /videos?ep=186 opens that scene straight
   * in the player. We also switch to its season so the list behind the
   * modal is the right one, then clear the param so closing won't reopen it.
   */
  useEffect(() => {
    if (!videos) return;
    const ep = searchParams.get("ep");
    if (!ep) return;
    const match = videos.find((v) => String(v.episode) === ep);
    if (match) {
      setPlaying(match);
      setActiveSeason(match.season);
    }
    setSearchParams({}, { replace: true });
  }, [videos, searchParams, setSearchParams]);

  const allMoods = useMemo(() => {
    if (!videos) return [];
    const moods = [...new Set(videos.flatMap((v) => v.moods))];
    // Exclusion mood sits last, apart from the regular moods
    return [
      ...moods.filter((m) => !EXCLUSIONS.has(m)),
      ...EXCLUDED_MOODS.filter((m) => moods.includes(m)),
    ];
  }, [videos]);

  const seasons = useMemo(
    () =>
      videos
        ? [...new Set(videos.map((v) => v.season))].sort((a, b) => a - b)
        : [],
    [videos],
  );

  /*
   * Stable reference. Note the functional updater (`prev => ...`):
   * it reads the CURRENT set on every call, which is what makes the
   * empty dependency array safe — no stale closure over activeMoods.
   */
  const toggleMood = useCallback(
    (mood) =>
      setActiveMoods((prev) => {
        const next = new Set(prev);
        next.has(mood) ? next.delete(mood) : next.add(mood);
        return next;
      }),
    [],
  );

  const filtered = useMemo(() => {
    if (!videos) return [];
    const q = deferredQuery.trim().toLowerCase();
    return videos.filter((video) => {
      // Season narrows the volume first; search and moods act within it.
      if (video.season !== activeSeason) return false;
      const haystack = `${video.episode} ${t(video.title)}`.toLowerCase();
      const byText = !q || haystack.includes(q);
      // Baby works in reverse: active means "hide these videos"
      if ([...activeMoods].some((m) => EXCLUSIONS.has(m) && video.moods.includes(m)))
        return false;
      const includeMoods = [...activeMoods].filter((m) => !EXCLUSIONS.has(m));
      const byMood =
        includeMoods.length === 0 ||
        video.moods.some((m) => includeMoods.includes(m));
      return byText && byMood;
    });
  }, [videos, deferredQuery, activeMoods, activeSeason, t]);

  // New search / filter → back to the first page of results.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [deferredQuery, activeMoods, activeSeason]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  // Stable reference so React.memo on VideoCard actually prevents re-renders.
  const handlePlay = useCallback((video) => setPlaying(video), []);

  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep145.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>
      <p className={styles.copyright}>{t(L.copyright)}</p>
      <p className={styles.storyLink}>
        <Link to="/timeline">{t(L.seeInStory)}</Link>
      </p>

      <div className={styles.controls}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t(L.searchPlaceholder)}
        />
        <MoodFilter
          moods={allMoods}
          active={activeMoods}
          onToggle={toggleMood}
          exclusions={EXCLUSIONS}
        />
      </div>

      {loadError && (
        <p className={styles.status} role="alert">
          {t(L.loadErrorMsg)}
        </p>
      )}

      {!videos && !loadError && (
        <div className={styles.grid} aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {videos && (
        <>
          <div className={styles.seasonSlot}>
            <SeasonFilter
              seasons={seasons}
              activeSeason={activeSeason}
              onSeasonChange={setActiveSeason}
            />
            <span className={styles.count} aria-live="polite">
              {filtered.length}{" "}
              {filtered.length === 1 ? t(L.video) : t(L.videos)}
            </span>
          </div>

          <div className={styles.grid}>
            {visible.map((video, i) => (
              <VideoCard
                key={video.id}
                video={video}
                tone={i % 6}
                onPlay={handlePlay}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className={styles.status}>{t(L.empty)}</p>
          )}

          {visibleCount < filtered.length && (
            <div className={styles.loadMoreWrap}>
              <button
                className={styles.loadMore}
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                {t(L.loadMore)} ({filtered.length - visibleCount}{" "}
                {t(L.remaining)})
              </button>
            </div>
          )}

          <p className={styles.credit}>
            {t(L.credit)}{" "}
            <a
              href="https://x.com/starryskyEN"
              target="_blank"
              rel="noopener noreferrer"
            >
              @starryskyEN
            </a>
          </p>
        </>
      )}

      <Modal
        open={playing !== null}
        onClose={() => setPlaying(null)}
        wide
        label={playing ? `${t(L.playing)}: ${t(playing.title)}` : t(L.player)}
      >
        {playing && (
          <div className={styles.player}>
            <div className={styles.playerFrame}>
              {/* Doğrudan R2'den; videos.json sadece dosya adını tutar,
                  host ve klasör config.js'ten gelir */}
              <video
                src={`${VIDEO_BASE_URL}/${SCENE_PATH}/${playing.file}`}
                poster={playing.poster ?? undefined}
                controls
                autoPlay
                playsInline
              />
            </div>
            <div className={styles.playerInfo}>
              <span className={styles.playerEpisode}>
                {t(COMMON.episode)} {playing.episode}
              </span>
              <span className={styles.playerMeta}>{t(playing.title)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
