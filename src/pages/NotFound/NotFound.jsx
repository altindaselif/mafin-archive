import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";
import { useLang } from "../../i18n.js";

const L = {
  code: { es: "404", en: "404" },
  title: {
    es: "Esta página no está en el archivo",
    en: "This page is not in the archive",
  },
  text: {
    es: "El enlace puede estar mal escrito, o la página que buscas nunca llegó a la colección. El resto del archivo sigue abierto.",
    en: "The link may be mistyped, or the page you are looking for never made it into the collection. The rest of the archive remains open.",
  },
  home: { es: "Volver al inicio", en: "Back to the entrance" },
};

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="page page-no-art">
      <div className={styles.plate}>
        <span className={styles.code} aria-hidden="true">
          {t(L.code)}
        </span>
        <div className={styles.rule} aria-hidden="true">
          <span className={styles.line} />
          <span className={styles.lozenge} />
          <span className={styles.line} />
        </div>
        <h1 className={styles.title}>{t(L.title)}</h1>
        <p className={styles.text}>{t(L.text)}</p>
        <p className={styles.links}>
          <Link to="/">{t(L.home)}</Link>
        </p>
      </div>
    </div>
  );
}
