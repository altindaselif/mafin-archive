import { Fragment } from "react";
import styles from "./SeasonFilter.module.css";
import { COMMON, useLang } from "../../i18n.js";
import StableLabel from "../StableLabel/StableLabel.jsx";

const L = {
  aria: { es: "Filtrar por temporada", en: "Filter by season" },
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const toRoman = (n) => ROMAN[n - 1] ?? String(n);

/**
 * Encyclopedia-volume season tabs: pure typography, no boxes.
 * `seasons` is derived from the data by each page, so a new season
 * in the JSON appears here automatically. Renders nothing while
 * there is only one season to choose from.
 */
export default function SeasonFilter({ seasons = [], activeSeason, onSeasonChange }) {
  const { t } = useLang();
  if (seasons.length <= 1) return null;

  return (
    <nav className={styles.filter} aria-label={t(L.aria)}>
      {seasons.map((season, i) => (
        <Fragment key={season}>
          {i > 0 && (
            <span className={styles.dot} aria-hidden="true">
              ·
            </span>
          )}
          <button
            className={`${styles.season} ${season === activeSeason ? styles.active : ""}`}
            aria-pressed={season === activeSeason}
            onClick={() => onSeasonChange(season)}
          >
            {/* Sezon kelimesi sabit genişlikte: dil değişince sekmeler
                kaymasın. Rakam dilden bağımsız, dışarıda kalıyor. */}
            <StableLabel field={COMMON.season} /> {toRoman(season)}
          </button>
        </Fragment>
      ))}
    </nav>
  );
}
