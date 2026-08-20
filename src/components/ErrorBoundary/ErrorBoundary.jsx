import { Component } from "react";
import styles from "./ErrorBoundary.module.css";

/*
 * Son savunma hattı. Bir bileşen render sırasında hata fırlatırsa React
 * varsayılan olarak TÜM ağacı söker ve kullanıcı bembeyaz bir ekran görür —
 * hata mesajı yok, geri dönüş yok. Bu sınır o hatayı yakalayıp arşivin
 * dilinde bir künye gösteriyor.
 *
 * Sınıf bileşeni olmak zorunda: componentDidCatch / getDerivedStateFromError
 * kancalarının hook karşılığı yok.
 *
 * Rotaların İÇİNDE duruyor (App.jsx), yani Header ve Footer ayakta kalıyor —
 * kullanıcı menüden başka bir sayfaya geçebiliyor.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Geliştirme sırasında konsolda görünsün; canlıda sessiz kalır.
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary:", error, info?.componentStack);
    }
  }

  /* Rota değişince hatayı temizle: kullanıcı menüden başka bir sayfaya
     geçtiğinde kırık ekranda kilitli kalmasın. */
  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.routeKey !== this.props.routeKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="page page-no-art">
        <div className={styles.plate} role="alert">
          <div className={styles.rule} aria-hidden="true">
            <span className={styles.line} />
            <span className={styles.lozenge} />
            <span className={styles.line} />
          </div>
          <h1 className={styles.title}>
            Algo se ha roto en el archivo
            <span className={styles.en}>Something broke in the archive</span>
          </h1>
          <p className={styles.text}>
            Esta sección no ha podido abrirse. Recarga la página o vuelve al
            inicio; el resto del archivo sigue en pie.
            <span className={styles.en}>
              This section could not be opened. Reload the page or return to the
              entrance; the rest of the archive is still standing.
            </span>
          </p>
          <p className={styles.links}>
            <a href="/">Volver al inicio · Back to the entrance</a>
          </p>
        </div>
      </div>
    );
  }
}
