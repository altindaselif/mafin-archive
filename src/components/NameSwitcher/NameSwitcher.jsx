import styles from "./NameSwitcher.module.css";

/**
 * Sayfanın ana ayrımı: Marta / Fina, Marta / Alba / Alma,
 * Todos / Marta / Fina / Mafin. Üç sayfada kopyala-yapıştır duruyordu.
 *
 * `labelOf` ayrı bir prop çünkü gösterilen ad saklanan değerden farklı
 * olabiliyor: Vestuario'da değer "marta" etiket "Marta", Citas'ta "All"
 * dile göre "Todos"/"All" yazılıyor, Prensa'da ikisi aynı (varsayılan
 * birim işlev, o yüzden Prensa hiçbir şey vermiyor).
 *
 * Ayraç kendi adıyla aynı `<span>` içinde: sarmalanınca satır sonunda
 * asılı kalmasın.
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
