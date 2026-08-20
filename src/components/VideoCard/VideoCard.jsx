import { memo } from "react";
import styles from "./VideoCard.module.css";
import MoodTags from "../MoodTags/MoodTags.jsx";
import Thumb from "../Thumb/Thumb.jsx";
import { COMMON, useLang } from "../../i18n.js";

const L = { play: { es: "Reproducir", en: "Play" } };

/**
 * Single video card, wrapped in React.memo so that unrelated state
 * changes on the Videos page (e.g. opening/closing the player modal)
 * don't re-render hundreds of cards. `onPlay` must be a stable
 * reference (useCallback) for the memo to be effective.
 */
function VideoCard({ video, tone, onPlay, priority = false }) {
  const { t } = useLang();
  return (
    <button
      className={styles.card}
      onClick={() => onPlay(video)}
      aria-label={`${t(L.play)}: ${t(video.title)}`}
    >
      <div className={styles.thumbWrap}>
        <Thumb
          label={t(video.title)}
          src={video.poster}
          ratio="16 / 9"
          tone={tone}
          priority={priority}
        />
        <span className={styles.playOverlay} aria-hidden="true">
          <span className={styles.playIcon}>
            <svg width="18" height="20" viewBox="0 0 18 20">
              <path d="M2 1.5v17l14-8.5z" fill="currentColor" />
            </svg>
          </span>
        </span>
      </div>
      <div className={styles.info}>
        <span className={styles.episode}>{t(COMMON.episode)} {video.episode}</span>
        <span className={styles.meta}>{t(video.title)}</span>
        <MoodTags moods={video.moods} />
      </div>
    </button>
  );
}

export default memo(VideoCard);
