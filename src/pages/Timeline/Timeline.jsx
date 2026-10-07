import { Fragment } from "react";
import styles from "./Timeline.module.css";
import Milestone from "../../components/Milestone/Milestone.jsx";
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
};

export default function Timeline() {
  const { t } = useLang();
  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep29.webp)" }}
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
              {/* Sezon ayracı. Etiket COMMON.season'dan, yıl seasonInfo'dan
                  türüyor — yeni bir sezon eklenince kendiliğinden çalışır. */}
              {newSeason && (
                <li className={styles.seasonHeader}>
                  <span>
                    {t(COMMON.season)} {season}
                    <em>· {yearOfSeason(season)}</em>
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
