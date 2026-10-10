import { Fragment, useEffect, useState } from "react";
import styles from "./Timeline.module.css";
import Milestone from "../../components/Milestone/Milestone.jsx";
import TimelineGap from "../../components/TimelineGap/TimelineGap.jsx";
import milestones from "../../data/timeline.js";
import { seasonOf, yearOfSeason } from "../../data/seasonInfo.js";
import { Link } from "react-router-dom";
import { COMMON, useLang } from "../../i18n.js";

const L = {
  title: { es: "Su historia", en: "The Story" },
  subtitle: {
    es: "La relación de Marta y Fina: cada momento que cambió su rumbo, en orden, desde la primera mirada.",
    en: "Marta and Fina's relationship, milestone by milestone: every moment that changed its course, in order, from the very first glance.",
  },
  watchInVideos: {
    es: "Mira las escenas tras estos momentos →",
    en: "Watch the scenes behind these moments →",
  },
  jumpAria: { es: "Ir a una temporada", en: "Jump to a season" },
  toTop: { es: "Volver arriba", en: "Back to top" },
};

/* Sezon ayracının çapası. İki yerde birden kuruluyor (bağlantı ve
   başlık), o yüzden tek bir yerden türüyor. */
const anchorOf = (season) => `temporada-${season}`;

/* Hangi sezonlar var: veriden türüyor, elle yazılmıyor. Yeni bir sezon
   JSON'a girince şerit kendiliğinden büyüyor. */
const SEASONS = [...new Set(milestones.map((m) => seasonOf(m.episode)))];

/* Düğme iki ekran kaydırıldıktan SONRA beliriyor. Daha erken çıkarsa
   sayfanın başında, kimsenin yukarı çıkmak istemediği yerde duruyor. */
const TO_TOP_AFTER = 2;

export default function Timeline() {
  const { t } = useLang();

  /* Yukarı düğmesi yalnızca MOBİLDE çizilir (CSS'te gizleniyor); burada
     tutulan tek şey ne kadar aşağıda olduğumuz. */
  const [farDown, setFarDown] = useState(false);
  useEffect(() => {
    const onScroll = () =>
      setFarDown(window.scrollY > window.innerHeight * TO_TOP_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep34.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>
      <p className={styles.videosLink}>
        <Link to="/videos">{t(L.watchInVideos)}</Link>
      </p>

      {/* Sezon ŞERİDİ — süzgeç DEĞİL, çapa.
          Guía'daki SeasonFilter listeden kayıt çıkarıyor; burada öyle bir
          şey yapılamaz, çünkü bu sayfa bir katalog değil anlatı: üç sezonu
          ayırmak "Bianca se va'dan sonra ne oldu?" sorusunun cevabını
          siler. Şerit hiçbir şey gizlemiyor, sadece kronolojinin bir
          yerine indiriyor. Bu yüzden düğme değil bağlantı: JavaScript
          kapalıyken bile çalışır ve sağ tıkla yeni sekmede açılır. */}
      {SEASONS.length > 1 && (
        <nav className={styles.jump} aria-label={t(L.jumpAria)}>
          <span className={styles.jumpLabel}>{t(COMMON.season)}</span>
          {SEASONS.map((season, i) => (
            <Fragment key={season}>
              {i > 0 && (
                <span className={styles.jumpDot} aria-hidden="true">
                  ·
                </span>
              )}
              <a className={styles.jumpLink} href={`#${anchorOf(season)}`}>
                {season}
              </a>
            </Fragment>
          ))}
        </nav>
      )}

      <ol className={styles.timeline}>
        {milestones.map((item, i) => {
          const season = seasonOf(item.episode);
          const newSeason =
            i === 0 || season !== seasonOf(milestones[i - 1].episode);
          return (
            <Fragment key={item.id}>
              {/* Sezon ayracı. Etiket COMMON.season'dan, yıl seasonInfo'dan
                  türüyor — yeni bir sezon eklenince kendiliğinden çalışır. */}
              {newSeason && (
                <li className={styles.seasonHeader} id={anchorOf(season)}>
                  <span>
                    {t(COMMON.season)} {season}
                    <em>· {yearOfSeason(season)}</em>
                  </span>
                </li>
              )}
              {/* `kind: "gap"` kayıtları an değil, kasıtlı boşluk.
                  Sıralama yine episode'a göre, yani araya kendiliğinden
                  doğru yere oturuyorlar. */}
              {item.kind === "gap" ? (
                <TimelineGap item={item} />
              ) : (
                <Milestone item={item} index={i} />
              )}
            </Fragment>
          );
        })}
      </ol>

      {/* 24 ekranlık bir sayfada yukarı dönmenin tek yolu kaydırmaktı.
          Masaüstünde CSS onu gizliyor: orada kaydırma çubuğu zaten bu işi
          görüyor ve sayfanın üstüne bir hamlede gidiliyor.
          Yumuşak kaydırma global.css'ten geliyor (`scroll-behavior`), o da
          prefers-reduced-motion altında kendiliğinden kapanıyor — burada
          ayrıca kontrol etmeye gerek yok. */}
      <button
        className={`${styles.toTop} ${farDown ? styles.toTopOn : ""}`}
        onClick={() => window.scrollTo(0, 0)}
        aria-label={t(L.toTop)}
        aria-hidden={!farDown}
        tabIndex={farDown ? 0 : -1}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            d="M9 14V4M4.5 8.5L9 4l4.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
