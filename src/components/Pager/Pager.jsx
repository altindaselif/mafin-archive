import styles from "./Pager.module.css";
import { useLang } from "../../i18n.js";

const L = {
  prev: { es: "Anterior", en: "Previous" },
  next: { es: "Siguiente", en: "Next" },
  goto: { es: "Ir a la página", en: "Go to page" },
};

/**
 * Folio pager. The running foot of a book: PREVIOUS on the left, NEXT on
 * the right, and in the middle the page numbers — first and last always
 * shown, a window around the current page, "…" for the stretches between.
 */
function buildRange(current, total, sibling = 1) {
  const pages = new Set([1, total]);
  for (let i = current - sibling; i <= current + sibling; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push(`gap-${prev}`); // ellipsis marker
    out.push(p);
    prev = p;
  }
  return out;
}

export default function Pager({ currentPage, totalPages, onPageChange, label }) {
  const { t } = useLang();
  if (totalPages <= 1) return null;

  const items = buildRange(currentPage, totalPages, 2);

  return (
    <nav className={styles.pager} aria-label={label}>
      <button
        className={styles.step}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {t(L.prev)}
      </button>

      <ul className={styles.pages}>
        {items.map((item) =>
          typeof item === "string" ? (
            <li key={item} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                className={`${styles.folio} ${
                  item === currentPage ? styles.current : ""
                }`}
                onClick={() => onPageChange(item)}
                aria-label={`${t(L.goto)} ${item}`}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </button>
            </li>
          )
        )}
      </ul>

      <button
        className={styles.step}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {t(L.next)}
      </button>
    </nav>
  );
}
