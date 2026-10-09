import { Link, useLocation } from "react-router-dom";
import styles from "./Footer.module.css";
import { useLang } from "../../i18n.js";

const L = {
  /* Künyedeki bağlantı bir etiket değil, bir cümle — sayfanın kendi
     başlığı "Agradecimientos" olarak kalıyor.
     İspanyolcası dişil çoğul ("ellas"): emeği geçenler kadın. */
  thanks: {
    es: "Nada de esto existiría sin ellas",
    en: "None of this would exist without them",
  },
  /* İki dil BİLEREK aynı uzunlukta değil. İspanyolca aynı şeyi söylemek
     için doğası gereği daha çok yer kaplıyor; kısaltılmamış hali künyede
     fazla yayvan duruyordu. İngilizcesi ise kısaltılınca kuru kalıyor,
     o yüzden tam hali korundu. Birini diğerine uydurmaya çalışma. */
  legal: {
    es: (
      <>
        Archivo de fans independiente y sin ánimo de lucro. Todos los derechos
        de <em>Sueños de Libertad</em> y de sus medios pertenecen a Atresmedia.
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

      {/* Katkıda bulunanların adları buradaydı. Dört isim sığıyordu ama
          liste büyüdükçe künyeyi boğacaktı; hepsi kendi sayfasında. */}
      <p className={styles.credit}>
        <Link to="/acknowledgements">{t(L.thanks)}</Link>
      </p>
    </footer>
  );
}
