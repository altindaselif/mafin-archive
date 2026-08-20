import styles from "./Thumb.module.css";
import { useLang } from "../../i18n.js";

const L = { pending: { es: "Imagen pendiente", en: "Image pending" } };

/**
 * Thumbnail. If `src` is provided it renders a real, lazily-loaded
 * image (critical with large catalogues: the browser only fetches
 * images near the viewport). Without `src` it falls back to the
 * elegant gradient placeholder.
 */
export default function Thumb({ src, label = "", ratio = "16 / 9", tone = 0, className = "" }) {
  const { t } = useLang();
  if (src) {
    return (
      <img
        src={src}
        alt={label}
        loading="lazy"
        decoding="async"
        className={`${styles.image} ${className}`}
        style={{ aspectRatio: ratio }}
      />
    );
  }

  return (
    <div
      className={`${styles.thumb} ${className}`}
      style={{ aspectRatio: ratio, "--tone": tone }}
      role="img"
      aria-label={label || t(L.pending)}
    >
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
