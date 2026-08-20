import { Fragment } from "react";
import styles from "./Timeline.module.css";
import Milestone from "../../components/Milestone/Milestone.jsx";
import milestones from "../../data/timeline.js";
import { seasonOf } from "../../data/seasonInfo.js";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n.js";

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
};

// Season dividers that break up the single chronological flow.
const SEASON_LABEL = {
  1: { es: "Temporada 1", en: "Season 1" },
  2: { es: "Temporada 2", en: "Season 2" },
  3: { es: "Temporada 3", en: "Season 3" },
};
const SEASON_YEAR = { 1: "2024", 2: "2025", 3: "2026" };

export default function Timeline() {
  const { t } = useLang();
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

      <ol className={styles.timeline}>
        {milestones.map((item, i) => {
          const season = seasonOf(item.episode);
          const newSeason =
            i === 0 || season !== seasonOf(milestones[i - 1].episode);
          return (
            <Fragment key={item.id}>
              {newSeason && SEASON_LABEL[season] && (
                <li className={styles.seasonHeader}>
                  <span>
                    {t(SEASON_LABEL[season])}
                    <em>· {SEASON_YEAR[season]}</em>
                  </span>
                </li>
              )}
              <Milestone item={item} index={i} />
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}
