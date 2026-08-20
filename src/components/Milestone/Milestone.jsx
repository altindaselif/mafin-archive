import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Thumb from "../Thumb/Thumb.jsx";
import { COMMON, useLang } from "../../i18n.js";
import { VIDEO_BASE_URL, TIMELINE_PATH } from "../../config.js";
import styles from "./Milestone.module.css";

/* Hızlı scroll'da her kartın videosunu tetiklememek için: kart ekranda
   bu kadar süre KALIRSA video yüklenmeye başlar. */
const DWELL_MS = 200;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* timeline-ep5.mp4 -> /img/timeline-posters/timeline-ep5.jpg */
const posterFor = (file) =>
  `${import.meta.env.BASE_URL}img/timeline-posters/${file.replace(/\.mp4$/, ".jpg")}`;

/**
 * Tek bir zaman çizelgesi anı. Kart varsayılan olarak poster gösterir;
 * ekranda görünür hale gelince videoyu yükleyip oynatır, ekrandan
 * çıkınca videoyu söküp tekrar postere döner (indirme de iptal olur).
 * Alternating side is driven by `index`.
 */
export default function Milestone({ item, index }) {
  const { t } = useLang();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false); // reveal-on-scroll
  const [onStage, setOnStage] = useState(false); // merkez şeritte mi
  const [playing, setPlaying] = useState(false); // video DOM'a girdi mi
  const [ready, setReady] = useState(false); // ilk kare çizilebilir mi

  // Reveal-on-scroll (bir kez çalışır)
  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Kart ekrana girip çıktıkça onStage'i güncelle
  useEffect(() => {
    if (!item.video || prefersReducedMotion()) return;
    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => setOnStage(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [item.video]);

  /*
   * Ekrandan çıkınca video ANINDA sökülür (indirme iptal olur, poster
   * geri gelir). Girişte ise DWELL_MS kadar beklenir — böylece hızlıca
   * scroll edilip geçilen kartlar hiç istek atmaz.
   */
  useEffect(() => {
    if (!onStage) {
      setPlaying(false);
      setReady(false);
      return;
    }
    const id = setTimeout(() => setPlaying(true), DWELL_MS);
    return () => clearTimeout(id);
  }, [onStage]);

  const side = index % 2 === 0 ? styles.left : styles.right;
  const epLabel = `${t(COMMON.episode)} ${item.episode}`;

  return (
    <li ref={ref} className={`${styles.milestone} ${side} ${visible ? styles.visible : ""}`}>
      <span className={styles.dot} aria-hidden="true" />
      <Link
        className={styles.card}
        to={`/videos?ep=${item.episode}`}
        aria-label={`${epLabel} — ${t(item.title)}`}
      >
        {item.video ? (
          <div className={styles.cardFrame}>
            <img
              className={styles.cardMedia}
              src={posterFor(item.video)}
              alt=""
              loading="lazy"
              decoding="async"
            />
            {playing && (
              <video
                className={`${styles.cardMedia} ${styles.cardVideo} ${ready ? styles.cardVideoReady : ""}`}
                src={`${VIDEO_BASE_URL}/${TIMELINE_PATH}/${item.video}`}
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                aria-hidden="true"
                tabIndex={-1}
                onCanPlay={() => setReady(true)}
              />
            )}
          </div>
        ) : (
          <Thumb label={epLabel} ratio="16 / 7" tone={index} className={styles.cardThumb} />
        )}
        <div className={styles.cardBody}>
          <span className={styles.cardEpisode}>{epLabel}</span>
          <h3 className={styles.cardTitle}>{t(item.title)}</h3>
          <p className={styles.cardText}>{t(item.text)}</p>
        </div>
      </Link>
    </li>
  );
}
