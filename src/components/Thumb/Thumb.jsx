import styles from "./Thumb.module.css";
import { useLang } from "../../i18n.js";

const L = { pending: { es: "Imagen pendiente", en: "Image pending" } };

/**
 * Thumbnail. `src` verilirse gerçek resim, verilmezse gradient yer tutucu.
 *
 * `priority`: ilk ekranda görünen kartlar için. Varsayılan davranış
 * (loading="lazy") büyük listelerde şart — tarayıcı sadece görünür alana
 * yakın resimleri indiriyor. Ama ilk satırdaki kartlar zaten ekranda:
 * onları da ertelemek LCP'yi boşuna geciktiriyor, üstelik kartın kendisi
 * `content-visibility: auto` ile de ertelendiği için gecikme iki katına
 * çıkıyordu. `priority` ile o kartlar hemen ve öncelikli indiriliyor.
 */
export default function Thumb({
  src,
  label = "",
  ratio = "16 / 9",
  tone = 0,
  className = "",
  priority = false,
}) {
  const { t } = useLang();
  if (src) {
    return (
      <img
        src={src}
        alt={label}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
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
