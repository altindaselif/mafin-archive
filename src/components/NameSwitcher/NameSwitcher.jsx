import styles from "./NameSwitcher.module.css";

/**
 * Sayfanın ana ayrımı: Marta / Fina, Marta / Alba / Alma,
 * Todos / Marta / Fina / Mafin.
 *
 * Üç sayfada da aynı işaretleme vardı — kopyala-yapıştır, üç nüsha.
 * Üçüncüsü eklenirken dosyaya "bir dördüncüsü gelirse ortak bir
 * bileşene çıkarmanın zamanı gelmiş demektir" diye not düşülmüştü;
 * dördüncüyü beklemeye gerek kalmadı.
 *
 * `labelOf` AYRI BİR PROP, çünkü üç sayfada da gösterilen ad saklanan
 * değerden farklı olabiliyor: Vestuario'da değer "marta", etiket
 * "Marta"; Citas'ta "All" değeri dile göre "Todos"/"All" yazılıyor;
 * Prensa'da ikisi aynı. Varsayılanı birim işlev, yani Prensa hiçbir şey
 * vermiyor.
 *
 * Ayraç KENDİ ADIYLA aynı `<span>` içinde: sarmalanınca satır sonunda
 * tek başına asılı kalmasın diye.
 */
export default function NameSwitcher({
  options = [],
  active,
  onChange,
  ariaLabel,
  labelOf = (value) => value,
  className = "",
}) {
  return (
    <nav className={`${styles.switcher} ${className}`} aria-label={ariaLabel}>
      {options.map((value, i) => (
        <span key={value}>
          {i > 0 && (
            <span className={styles.sep} aria-hidden="true">
              ·
            </span>
          )}
          <button
            className={`${styles.name} ${value === active ? styles.nameActive : ""}`}
            aria-pressed={value === active}
            onClick={() => onChange(value)}
          >
            {labelOf(value)}
          </button>
        </span>
      ))}
    </nav>
  );
}
