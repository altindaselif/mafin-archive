import styles from "./Characters.module.css";
import characters from "../../data/characters.js";
import { useLang } from "../../i18n.js";

const L = {
  title: { es: "Personajes", en: "Characters" },
  subtitle: {
    es: "Todos los que se cruzaron en el camino de Marta y Fina.",
    en: "Everyone who crossed Marta and Fina's path, one by one.",
  },
};

const monogram = (name) => {
  const parts = name.split(" ");
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Characters() {
  const { t } = useLang();

  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep363.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>

      <ul className={styles.list}>
        {characters.map((c) => (
          <li key={c.id} className={styles.character}>
            <div className={styles.monogram} aria-hidden="true">
              {monogram(c.name)}
            </div>
            <div className={styles.body}>
              <h3 className={styles.name}>{c.name}</h3>
              <div className={styles.role}>{t(c.role)}</div>
              <p className={styles.bio}>{t(c.bio)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
