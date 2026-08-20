import { Fragment } from "react";
import styles from "./SectionTabs.module.css";

/**
 * Single-select typographic tabs for mutually exclusive sections
 * (one "volume" open at a time). Shares the visual grammar of
 * SeasonFilter — center dots, small caps, lozenge bookmark — but a
 * different contract: string labels + an "all" option (value null).
 * If a third tab-like use case appears, unify the two into one
 * generic component; until then two small files beat one clever one.
 */
export default function SectionTabs({ allLabel = "Todo", sections = [], active, onChange }) {
  const items = [{ value: null, label: allLabel }, ...sections.map((s) => ({ value: s, label: s }))];

  return (
    <nav className={styles.tabs} aria-label="Filtrar por sección">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && (
            <span className={styles.dot} aria-hidden="true">·</span>
          )}
          <button
            className={`${styles.tab} ${active === item.value ? styles.active : ""}`}
            aria-pressed={active === item.value}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        </Fragment>
      ))}
    </nav>
  );
}
