import styles from "./ListToolbar.module.css";

/**
 * Liste başlığı: solda filtre (sezon sekmeleri), sağda kaç kayıt olduğu,
 * altında ince bir ayraç çizgisi.
 *
 * Guía, Vídeos, Galería ve Citas dördü de bu bloğu ayrı ayrı yazıyordu —
 * aynı yedi satırlık flex kuralı dört CSS dosyasında birebir duruyordu.
 *
 * `count` sayfaya göre değişiyor ("12 capítulos", "40 fotos"), o yüzden
 * hazır metin olarak geliyor. Sol taraf `children`: genelde SeasonFilter,
 * ama başka bir filtre de konabilir.
 */
export default function ListToolbar({ children, count, className = "" }) {
  return (
    <div className={`${styles.toolbar} ${className}`}>
      {children}
      <span className={styles.count} aria-live="polite">
        {count}
      </span>
    </div>
  );
}
