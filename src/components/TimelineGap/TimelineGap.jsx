import styles from "./TimelineGap.module.css";
import { useLang } from "../../i18n.js";

/**
 * Zaman çizelgesinde KASITLI bir boşluk.
 *
 * Arşivlerde kayıp malzeme "laguna documental" diye işaretlenir. Burada
 * malzeme kayıp değil, kasten alınmamış — ama aynı dili kullanıyoruz:
 * merkez çizgi bu aralıkta kesik kesik akıyor, ortada sayfa zemininde
 * duran küçük bir künye var. Görsel tarafta hiçbir şaka yok; iğneleme
 * tamamen metinde. Zarif bir arşivin bir şeyi kaydetmeyi reddetmesi,
 * yüksek sesli bir şakadan daha sert.
 *
 * Veriden gelir: timeline kaydında `kind: "gap"` varsa Timeline.jsx
 * Milestone yerine bunu çiziyor. Sıralama yine `episode` alanına göre,
 * yani "Llega Bianca" (611) ile "Bianca se va" arasına kendiliğinden
 * oturuyor — araya başka bir an eklense bile yeri bozulmuyor.
 */
export default function TimelineGap({ item }) {
  const { t } = useLang();

  return (
    <li className={styles.gap}>
      <div className={styles.inner}>
        <span className={styles.mark} aria-hidden="true">
          ·&nbsp;·&nbsp;·
        </span>
        <h3 className={styles.label}>{t(item.title)}</h3>
        <p className={styles.text}>{t(item.text)}</p>
      </div>
    </li>
  );
}
