import styles from "./MoodTags.module.css";
import { useLang } from "../../i18n.js";
import { moodLabel } from "../../data/moods.js";

/** Tiny pill-shaped mood tags used across episode rows and video cards.
 *  `mood` is the internal key; we render its translated label. */
export default function MoodTags({ moods = [] }) {
  const { t } = useLang();
  if (!moods.length) return null; // no tags -> no reserved strip, no bald gap
  return (
    <div className={styles.tags}>
      {moods.map((mood) => (
        <span key={mood} className={styles.tag}>{t(moodLabel(mood))}</span>
      ))}
    </div>
  );
}
