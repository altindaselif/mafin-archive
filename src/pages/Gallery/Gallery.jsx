import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Gallery.module.css";
import SeasonFilter from "../../components/SeasonFilter/SeasonFilter.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import galleries from "../../data/gallery.js";
import episodes from "../../data/episodes.js";
import { PHOTO_BASE_URL, PHOTO_RESIZE } from "../../config.js";
import { COMMON, useLang } from "../../i18n.js";

const L = {
  title: { es: "Galería", en: "Gallery" },
  subtitle: {
    es: "Fotografías de cada capítulo, reunidas volumen a volumen. Elige una lámina para verla en grande.",
    en: "Photographs from each chapter, gathered volume by volume. Pick a plate to see it larger.",
  },
  photo: { es: "foto", en: "photo" },
  photos: { es: "fotos", en: "photos" },
  emptyVolume: {
    es: "Aún no hay láminas en este volumen.",
    en: "No plates in this volume yet.",
  },
  emptyAll: {
    es: "El álbum aún está vacío. Pronto llegarán las primeras fotografías.",
    en: "The album is still empty. The first photographs will arrive soon.",
  },
  prev: { es: "Anterior", en: "Previous" },
  next: { es: "Siguiente", en: "Next" },
  open: { es: "Ampliar la fotografía", en: "Open the photograph" },
  loadMore: { es: "Cargar más", en: "Load more" },
  remaining: { es: "restantes", en: "remaining" },
};

/* Stored value may be a bare file name or an absolute URL; only bare names
   get the R2 base prepended. */
const absUrl = (p) =>
  /^https?:\/\//i.test(p)
    ? p
    : `${PHOTO_BASE_URL}/${String(p).replace(/^\/+/, "")}`;

/* Full original by default. Pass a width to get a resized thumbnail — only
   applied when PHOTO_RESIZE is on; otherwise the original is served as-is,
   so the lightbox (no width) always shows the full 4K. */
const photoUrl = (p, width) => {
  const src = absUrl(p);
  if (!width || !PHOTO_RESIZE) return src;
  return `${PHOTO_BASE_URL}/cdn-cgi/image/width=${width},fit=cover,format=auto/${src}`;
};

const PAGE_SIZE = 12; // episode plates revealed per "load more"
const THUMB_WIDTH = 640; // grid thumbnail width when resizing is on

/* Episode number -> its { es, en } title, for the plate captions. */
const EP_TITLE = new Map(episodes.map((e) => [e.number, e.title]));

export default function Gallery() {
  const { t } = useLang();

  // Volumes that actually contain photos, in order.
  const seasons = useMemo(
    () => [...new Set(galleries.map((g) => g.season))].sort((a, b) => a - b),
    [],
  );
  const [activeSeason, setActiveSeason] = useState(seasons[0] ?? null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const inSeason = useMemo(
    () => galleries.filter((g) => g.season === activeSeason),
    [activeSeason],
  );
  const totalPhotos = useMemo(
    () => inSeason.reduce((n, g) => n + g.photos.length, 0),
    [inSeason],
  );
  const shown = inSeason.slice(0, visibleCount);

  useEffect(() => setVisibleCount(PAGE_SIZE), [activeSeason]);

  // Lightbox: which album is open and which photo within it.
  const [box, setBox] = useState(null); // { photos, index, episode }
  const openAt = useCallback(
    (g, index) => setBox({ photos: g.photos, index, episode: g.episode }),
    [],
  );
  const close = useCallback(() => setBox(null), []);
  const step = useCallback(
    (d) =>
      setBox((b) =>
        b
          ? { ...b, index: (b.index + d + b.photos.length) % b.photos.length }
          : b,
      ),
    [],
  );

  // Arrow keys page through the open album (Modal already owns Escape).
  useEffect(() => {
    if (!box) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [box, step]);

  const count = (n) => `${n} ${n === 1 ? t(L.photo) : t(L.photos)}`;

  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep159.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>

      {galleries.length === 0 && (
        <p className={styles.empty}>{t(L.emptyAll)}</p>
      )}

      {galleries.length > 0 && (
        <>
          <div className={styles.seasonSlot}>
            <SeasonFilter
              seasons={seasons}
              activeSeason={activeSeason}
              onSeasonChange={setActiveSeason}
            />
            <span className={styles.count} aria-live="polite">
              {count(totalPhotos)}
            </span>
          </div>

          {inSeason.length === 0 && (
            <p className={styles.empty}>{t(L.emptyVolume)}</p>
          )}

          {shown.map((g) => (
            <section key={g.episode} className={styles.plate}>
              <header className={styles.plateHead}>
                <span className={styles.lozenge} aria-hidden="true" />
                <h2 className={styles.plateTitle}>
                  <span className={styles.plateCap}>
                    {t(COMMON.episode)} {g.episode}
                  </span>
                  {EP_TITLE.has(g.episode) && (
                    <span className={styles.plateName}>
                      {" · "}
                      {t(EP_TITLE.get(g.episode))}
                    </span>
                  )}
                </h2>
                <span className={styles.plateCount}>
                  {count(g.photos.length)}
                </span>
              </header>

              <ul className={styles.grid}>
                {g.photos.map((p, i) => (
                  <li key={`${g.episode}-${i}`}>
                    <button
                      className={styles.thumbButton}
                      onClick={() => openAt(g, i)}
                      aria-label={`${t(L.open)} — ${t(COMMON.episode)} ${g.episode}`}
                    >
                      <img
                        className={styles.thumb}
                        src={photoUrl(p, THUMB_WIDTH)}
                        alt=""
                        loading="lazy"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {visibleCount < inSeason.length && (
            <div className={styles.loadMoreWrap}>
              <button
                className={styles.loadMore}
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                {t(L.loadMore)} ({inSeason.length - visibleCount}{" "}
                {t(L.remaining)})
              </button>
            </div>
          )}
        </>
      )}

      <Modal open={!!box} onClose={close} wide label={t(L.title)}>
        {box && (
          <figure className={styles.viewer}>
            <img
              className={styles.viewerImg}
              src={photoUrl(box.photos[box.index])}
              alt=""
            />
            {box.photos.length > 1 && (
              <>
                <button
                  className={`${styles.nav} ${styles.navPrev}`}
                  onClick={() => step(-1)}
                  aria-label={t(L.prev)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    aria-hidden="true"
                  >
                    <path
                      d="M11 3L5 9l6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  className={`${styles.nav} ${styles.navNext}`}
                  onClick={() => step(1)}
                  aria-label={t(L.next)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 3l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <figcaption className={styles.counter}>
                  {box.index + 1} / {box.photos.length}
                </figcaption>
              </>
            )}
          </figure>
        )}
      </Modal>
    </div>
  );
}
