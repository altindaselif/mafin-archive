import styles from "./StableLabel.module.css";
import { useLang } from "../../i18n.js";

/**
 * Dil değişince genişliği değişmeyen etiket.
 *
 * Sorun: "Temporada" ile "Season", "Inicio" ile "Home" farklı genişlikte.
 * Dil değişince menü ve sekmeler yanlara kayıyor.
 *
 * Çözüm: iki dilin metnini de aynı ızgara hücresine koy. Hücre her zaman
 * GENİŞ olana göre şekillenir, aktif olmayan `visibility: hidden` ile
 * gizlenir. "Hangisi daha uzun" diye elle hesaplamak gerekmiyor — üçüncü
 * bir dil eklense de kendiliğinden çalışır.
 *
 * `visibility: hidden` erişilebilirlik ağacından da çıkarır, yani ekran
 * okuyucu metni iki kez okumaz.
 *
 * `align`: dar açılır menülerde metin sola hizalı olmalı; ortalanınca
 * kısa metin içeri kaçmış gibi durur.
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
