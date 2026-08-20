import { Link, useLocation } from "react-router-dom";
import styles from "./Footer.module.css";
import { useLang } from "../../i18n.js";

const L = {
  creditBy: {
    es: "El contenido principal de este sitio ha sido elaborado por",
    en: "The main content of this site was created by",
  },
  and: { es: "y", en: "and" },
  legal: {
    es: (
      <>
        Este sitio es un archivo de fans independiente y sin ánimo de lucro.
        Todos los derechos de la serie <em>Sueños de Libertad</em> y de sus
        medios pertenecen a Atresmedia.
      </>
    ),
    en: (
      <>
        This site is a non-profit independent fan archive. All copyrights of the{" "}
        <em>Sueños de Libertad</em> series and media belong to Atresmedia.
      </>
    ),
  },
};

/**
 * Micro-footer styled as a book colophon: an engraved, tapering rule
 * with a wine lozenge, the wordmark, the legal imprint, and a quiet
 * language toggle. An archive ends the way a book does.
 */
export default function Footer() {
  const { pathname } = useLocation();
  const { t } = useLang();

  // Already on the home page? The URL won't change, so scroll manually.
  const scrollTopIfHome = () => {
    if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.rule} aria-hidden="true">
        <span className={styles.line} />
        <span className={styles.lozenge} />
        <span className={styles.line} />
      </div>

      <Link to="/" className={styles.brand} onClick={scrollTopIfHome}>
        Mafin
      </Link>

      <p className={styles.legal}>{t(L.legal)}</p>

      <p className={styles.credit}>
        {t(L.creditBy)}
        <br />
        <a
          href="https://x.com/gini__us"
          target="_blank"
          rel="noopener noreferrer"
        >
          @gini__us
        </a>
        ,{" "}
        <a
          href="https://x.com/luimeliaaeps"
          target="_blank"
          rel="noopener noreferrer"
        >
          @luimeliaaeps
        </a>
        ,{" "}
        <a
          href="https://x.com/hudriemd"
          target="_blank"
          rel="noopener noreferrer"
        >
          @hudriemd
        </a>{" "}
        {t(L.and)}{" "}
        <a
          href="https://x.com/annadewitt125"
          target="_blank"
          rel="noopener noreferrer"
        >
          @annadewitt125
        </a>
        .
      </p>
    </footer>
  );
}
