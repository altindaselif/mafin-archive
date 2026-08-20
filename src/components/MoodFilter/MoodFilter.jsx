import styles from "./MoodFilter.module.css";
import { useLang } from "../../i18n.js";
import { moodLabel } from "../../data/moods.js";

const L = {
  aria: { es: "Filtrar por temática", en: "Filter by mood" },
  hide: { es: "Ocultar capítulos", en: "Hide episodes" },
};

/**
 * Toggle-button mood filter. `active` is a Set held by the parent page;
 * an empty set means "show everything".
 *
 * Moods listed in `exclusions` work in reverse: activating them HIDES
 * matching entries instead of showing them. They render in ink instead
 * of wine, and get struck through while active — like a crossed-out
 * entry in a ledger.
 */
export default function MoodFilter({ moods, active, onToggle, exclusions = new Set() }) {
  const { t } = useLang();
  return (
    <div className={styles.group} role="group" aria-label={t(L.aria)}>
      {moods.map((mood) => {
        const on = active.has(mood);
        const negative = exclusions.has(mood);
        return (
          <button
            key={mood}
            aria-pressed={on}
            className={`${styles.toggle} ${negative ? styles.negative : ""} ${
              on ? (negative ? styles.negativeOn : styles.on) : ""
            }`}
            onClick={() => onToggle(mood)}
            title={negative ? `${t(L.hide)} ${t(moodLabel(mood))}` : undefined}
          >
            {t(moodLabel(mood))}
          </button>
        );
      })}
    </div>
  );
}
