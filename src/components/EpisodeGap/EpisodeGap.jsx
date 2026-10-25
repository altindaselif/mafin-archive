import styles from "./EpisodeGap.module.css";
import { useLang } from "../../i18n.js";

/**
 * Guía listesinde KASITLI bir boşluk. TimelineGap'in kardeşi: aynı
 * eksiltme işareti, aynı küçük kapital künye, aynı soğuk arşiv dili.
 * İğneleme metinde, görselde hiçbir şaka yok.
 *
 * Timeline'daki kardeşinden tek farkı aralığı SÖYLEMESİ. Orada boşluk
 * iki anın arasında duruyor ve ikisi de ekranda; burada liste 611'den
 * 681'e atlıyor, aradaki numaralar hiç görünmüyor. Kaç bölümün
 * atlandığını söylemezse boşluk bir eksiklik gibi okunuyor — oysa
 * bilerek yapılmış bir tercih.
 */
export default function EpisodeGap({ item, to }) {
  const { lang, t } = useLang();

  /* Aralık etiketi veriden türüyor. `to` yoksa boşluk henüz kapanmamış
     demektir: arşiv orada duruyor ve nerede devam edeceği belli değil. */
  const range = to
    ? lang === "es"
      ? `capítulos ${item.from} – ${to}`
      : `chapters ${item.from}–${to}`
    : lang === "es"
      ? `desde el capítulo ${item.from}`
      : `from chapter ${item.from} on`;

  return (
    <li className={styles.gap}>
      <span className={styles.mark} aria-hidden="true">
        ·&nbsp;·&nbsp;·
      </span>
      <h2 className={styles.label}>{t(item.title)}</h2>
      <p className={styles.text}>{t(item.text)}</p>
      <span className={styles.range}>{range}</span>
    </li>
  );
}
