import styles from "./StableLabel.module.css";
import { useLang } from "../../i18n.js";

/**
 * Dil değişince genişliği değişmeyen etiket. "Temporada"/"Season" farklı
 * genişlikte, menü ve sekmeler dil değişince kayıyordu.
 *
 * İki dilin metni de aynı ızgara hücresinde; hücre geniş olana göre
 * şekilleniyor, aktif olmayan `visibility: hidden`. Elle "hangisi uzun"
 * hesabı gerekmiyor, üçüncü bir dilde de çalışır — ayrıca `hidden`
 * erişilebilirlik ağacından da çıkarıyor, metin iki kez okunmuyor.
 *
 * `align`: dar menülerde sola hizalı olmalı, ortalanınca içeri kaçıyor.
 */
export default function StableLabel({ field, align = "center" }) {
  const { lang } = useLang();
  return (
    <span className={`${styles.slot} ${align === "start" ? styles.start : ""}`}>
      {["es", "en"].map((code) => (
        <span
          key={code}
          className={code === lang ? styles.on : styles.off}
        >
          {field[code]}
        </span>
      ))}
    </span>
  );
}
