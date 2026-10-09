import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Outfits.module.css";
import SeasonFilter from "../../components/SeasonFilter/SeasonFilter.jsx";
import ListToolbar from "../../components/ListToolbar/ListToolbar.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import outfits, { charactersIn } from "../../data/outfits.js";
import { photoUrl } from "../../lib/photos.js";
import { seasonsIn } from "../../data/seasonInfo.js";
import { useLang } from "../../i18n.js";

/*
 * Kostüm levhaları: Marta ve Fina'nın dizi boyunca giydiği kıyafetler.
 *
 * NEDEN KÜNYE YOK: aynı kıyafet bir sürü bölümde görünüyor, o yüzden
 * katalogda bölüm numarası tutulmuyor (gerekçesi src/data/outfits.js'te).
 * Elimizde levha numarasından başka veri olmadığı için sayfa bilerek saf
 * görsel: her karenin altında yalnızca numara var, bölüm satırı ya da
 * Guía bağlantısı yok. Şıklık metadatadan değil ritimden geliyor.
 *
 * İKİ KADEMELİ SÜZGEÇ: karakter sayfanın ANA ayrımı (süzgeç değil), sezon
 * onun altında ikinci kademe. "İkisi birden" diye bir seçenek YOK: ortak
 * bir sıralama ekseni olmadığı için iki listeyi karıştırmak sıra değil
 * gürültü üretiyor.
 *
 * Köşe çizimi ep159. Silüetlerin sırası gezinme sırasıyla birlikte artıyor;
 * bu sayfa Galería (145) ile Citas arasına girdiği için 159'u Citas'tan
 * devraldı ve ondan sonraki her sayfa bir kaydı. Actrices zincirin dışında:
 * köşeyi kendi oyuncu seçicisi kullanıyor. Tablo LAUNCH-CHECKLIST.md'de.
 */

const L = {
  title: { es: "Vestuario", en: "The Outfits" },
  subtitle: {
    es: "Todos los conjuntos de Marta y Fina, los que nos enamoraron uno a uno.",
    en: "Every outfit Marta and Fina wore — the ones we all fell for, one by one.",
  },
  outfit: { es: "conjunto", en: "outfit" },
  outfits: { es: "conjuntos", en: "outfits" },
  plate: { es: "Conjunto", en: "Outfit" },
  who: { es: "Elegir personaje", en: "Choose character" },
  open: { es: "Ampliar el conjunto", en: "Open the outfit" },
  prev: { es: "Anterior", en: "Previous" },
  next: { es: "Siguiente", en: "Next" },
  emptyAll: {
    es: "El vestuario aún se está preparando. Pronto llegarán las primeras prendas.",
    en: "The wardrobe is still being prepared. The first garments will arrive soon.",
  },
  emptyVolume: {
    es: "Todavía no hay conjuntos en este volumen.",
    en: "No outfits in this volume yet.",
  },
};

/* Adlar iki dilde de aynı — özel isim, çeviri sözlüğüne girmiyorlar. */
const DISPLAY_NAME = { marta: "Marta", fina: "Fina" };

const THUMB_WIDTH = 640; // ızgara önizlemesi, PHOTO_RESIZE açıkken

export default function Outfits() {
  const { t } = useLang();

  const characters = useMemo(() => charactersIn(outfits), []);
  const [character, setCharacter] = useState(characters[0] ?? null);

  const forCharacter = useMemo(
    () => outfits.filter((o) => o.character === character),
    [character],
  );
  const seasons = useMemo(() => seasonsIn(forCharacter), [forCharacter]);

  /* Sezon TÜRETİLİYOR, efektle sıfırlanmıyor: karakter değişince seçili
     sezon o karakterde yoksa kendiliğinden ilk sezona düşüyor. Efektle
     yapılsaydı araya bir render girip bir kare boş liste görünürdü. */
  const [wantedSeason, setWantedSeason] = useState(null);
  const activeSeason = seasons.includes(wantedSeason) ? wantedSeason : seasons[0];

  const shown = useMemo(
    () => forCharacter.filter((o) => o.season === activeSeason),
    [forCharacter, activeSeason],
  );

  const [index, setIndex] = useState(null); // lightbox: shown içindeki sıra
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d) => setIndex((i) => (i === null ? i : (i + d + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, step]);

  const count = (n) => `${n} ${n === 1 ? t(L.outfit) : t(L.outfits)}`;
  const plateLabel = (o) =>
    `${DISPLAY_NAME[o.character]} · ${t(L.plate)} ${String(o.order).padStart(2, "0")}`;
  const open = index !== null && shown[index];

  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep159.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>

      {outfits.length === 0 && <p className={styles.empty}>{t(L.emptyAll)}</p>}

      {outfits.length > 0 && (
        <>
          {/* Karakter ayrımı: SeasonFilter'la aynı dil (kutusuz, saf
              tipografi) ama bir kademe büyük — sayfanın bölünme çizgisi
              bu, sezon ondan sonra geliyor. */}
          <nav className={styles.switcher} aria-label={t(L.who)}>
            {characters.map((c, i) => (
              <span key={c}>
                {i > 0 && (
                  <span className={styles.sep} aria-hidden="true">
                    ·
                  </span>
                )}
                <button
                  className={`${styles.name} ${c === character ? styles.nameActive : ""}`}
                  aria-pressed={c === character}
                  onClick={() => setCharacter(c)}
                >
                  {DISPLAY_NAME[c]}
                </button>
              </span>
            ))}
          </nav>

          <ListToolbar className={styles.toolbar} count={count(shown.length)}>
            <SeasonFilter
              seasons={seasons}
              activeSeason={activeSeason}
              onSeasonChange={setWantedSeason}
            />
          </ListToolbar>

          {shown.length === 0 && (
            <p className={styles.empty}>{t(L.emptyVolume)}</p>
          )}

          <ul className={styles.grid}>
            {shown.map((o, i) => (
              <li key={o.id} className={styles.cell}>
                <button
                  className={styles.plate}
                  onClick={() => setIndex(i)}
                  aria-label={`${t(L.open)} — ${plateLabel(o)}`}
                >
                  <img
                    className={styles.photo}
                    src={photoUrl(o.photo, THUMB_WIDTH)}
                    alt=""
                    loading="lazy"
                  />
                </button>
                <span className={styles.number} aria-hidden="true">
                  {String(o.order).padStart(2, "0")}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal open={!!open} onClose={close} wide label={t(L.title)}>
        {open && (
          <figure className={styles.viewer}>
            <img
              className={styles.viewerImg}
              src={photoUrl(open.photo)}
              alt=""
            />
            {shown.length > 1 && (
              <>
                <button
                  className={`${styles.nav} ${styles.navPrev}`}
                  onClick={() => step(-1)}
                  aria-label={t(L.prev)}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
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
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
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
              </>
            )}
            <figcaption className={styles.caption}>{plateLabel(open)}</figcaption>
          </figure>
        )}
      </Modal>
    </div>
  );
}
