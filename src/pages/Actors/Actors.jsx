import { useState } from "react";
import styles from "./Actors.module.css";
import actors from "../../data/actors.json";
import { useLang } from "../../i18n.js";

const L = {
  title: { es: "Las actrices", en: "The Actresses" },
  as: { es: "en el papel de", en: "as" },
  filmography: { es: "Filmografía", en: "Filmography" },
  photo: { es: "fotografía", en: "photograph" },
  compiledBy: { es: "Semblanza por", en: "Portrait by" },
  essentialsNote: { es: "Imprescindibles", en: "Essential works" },
};

/* Catalogue order — the categories that make up the raisonné */
const CATEGORIES = [
  { key: "film", label: { es: "Cine", en: "Film" } },
  { key: "tv", label: { es: "Televisión", en: "Television" } },
  { key: "theatre", label: { es: "Teatro", en: "Theatre" } },
  { key: "music", label: { es: "Videoclips", en: "Music videos" } },
];

const DATE_LOCALE = { es: "es-ES", en: "en-GB" };

function birthLine(place, iso, lang) {
  const date = new Date(iso).toLocaleDateString(DATE_LOCALE[lang] ?? "es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${place} · ${date}`;
}

export default function Actors() {
  const { lang, t } = useLang();
  const [active, setActive] = useState(0);
  const actor = actors[active];
  const film = actor.filmography ?? {};

  return (
    <div className="page page-no-art">
      <div className={styles.record}>
        <div className={styles.portrait}>
          {actor.photo ? (
            <img src={`${import.meta.env.BASE_URL}img/${actor.photo}`} alt={actor.name} loading="lazy" />
          ) : (
            <span className={styles.portraitEmpty}>{t(L.photo)}</span>
          )}
        </div>

        <div>
          <div className={styles.born}>
            {birthLine(actor.birthPlace, actor.birthDate, lang)}
          </div>
          <h1 className={styles.actorName}>{actor.name}</h1>
          <p className={styles.character}>
            {t(L.as)} {actor.character}
          </p>

          <div className={styles.bio}>
            {t(actor.bio).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        <nav className={styles.toggle} aria-label={t(L.title)}>
          {actors.map((a, i) => (
            <button
              key={a.id}
              className={`${styles.initial} ${i === active ? styles.initialActive : ""}`}
              aria-pressed={i === active}
              aria-label={a.name}
              title={a.name}
              onClick={() => setActive(i)}
            >
              {a.name.split(" ").map((w) => w[0]).join("")}
            </button>
          ))}
        </nav>
      </div>

      {/* Catalogue raisonné: every credit, by category, flowing across two columns */}
      <section className={styles.filmography}>
        <h2 className={styles.filmLabel}>
          {t(L.filmography)}
          <span className={styles.legend}>
            <span className={styles.lozenge} aria-hidden="true" />
            {t(L.essentialsNote)}
          </span>
        </h2>
        <div className={styles.catalogue}>
          {CATEGORIES.map(({ key, label }) => {
            const items = film[key] ?? [];
            if (items.length === 0) return null;
            const mid = Math.ceil(items.length / 2);
            const halves = [items.slice(0, mid), items.slice(mid)];
            return (
              <section key={key} className={styles.category}>
                <h3 className={styles.categoryLabel}>{t(label)}</h3>
                <div className={styles.works}>
                  {halves.map((half, hi) => (
                    <ul key={hi} className={styles.worksCol}>
                      {half.map((w) => (
                        <li key={`${w.year}-${w.title}`} className={styles.work}>
                          <span className={styles.workYear}>{w.year}</span>
                          <span className={styles.workTitle}>
                            {t(w.title)}
                            {w.featured && <span className={styles.lozenge} aria-hidden="true" />}
                          </span>
                          {w.role && <span className={styles.workRole}>{t(w.role)}</span>}
                          {w.detail && (
                            <span className={styles.workDetail} role="note">{t(w.detail)}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {actor.credit && (
          <p className={styles.credit}>
            {t(L.compiledBy)}{" "}
            <a href={actor.credit.url} target="_blank" rel="noopener noreferrer">
              @{actor.credit.handle}
            </a>
          </p>
        )}
      </section>
    </div>
  );
}
