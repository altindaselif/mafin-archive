import { Fragment } from "react";
import styles from "./SeasonFilter.module.css";
import { COMMON, useLang } from "../../i18n.js";

const L = {
  aria: { es: "Filtrar por temporada", en: "Filter by season" },
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const toRoman = (n) => ROMAN[n - 1] ?? String(n);

const labelOf = (lang, season) => `${COMMON.season[lang]} ${toRoman(season)}`;

/**
 * Encyclopedia-volume season tabs: pure typography, no boxes.
 * `seasons` is derived from the data by each page, so a new season
 * in the JSON appears here automatically. Renders nothing while
 * there is only one season to choose from.
 */
export default function SeasonFilter({ seasons = [], activeSeason, onSeasonChange }) {
  const { lang } = useLang();
  if (seasons.length <= 1) return null;

  /* Her sekmenin yuvasında BÜTÜN etiketler var: iki dil × her sezon.
     Yuva en genişine göre şekillendiği için sekmeler birbirine eşit
     oluyor ve seçim değişince sıra yerinden oynamıyor.
     StableLabel'ın tekniği, ama o yalnızca dili sabitliyor; burada
     "Temporada I" ile "Temporada III" arasındaki fark da kapatılmalı.
     Kelime ve rakam AYNI yuvada, ayrı ayrı değil: ayrılırsa "Season"
     kısa kaldığı için rakamla arasında boşluk açılıyor. */
  const variants = seasons.flatMap((s) => [labelOf("es", s), labelOf("en", s)]);

  return (
    <nav className={styles.filter} aria-label={L.aria[lang]}>
      {seasons.map((season, i) => {
        const shown = labelOf(lang, season);
        return (
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
              <span className={styles.slot}>
                {variants.map((v) => (
                  <span key={v} className={v === shown ? styles.on : styles.off}>
                    {v}
                  </span>
                ))}
              </span>
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}
