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
export default function SectionTabs({
  allLabel = "Todo",
  ariaLabel = "Filtrar por sección",
  sections = [],
  active,
  onChange,
}) {
  /*
   * `sections` ya düz string dizisi ya da {value, label} nesneleri.
   * İkisi ayrı olmalı: Fandom'da tür DEĞERİ veride İspanyolca sabit
   * ("Canción"), görünen etiket ise dile göre değişiyor ("Song").
   */
  const items = [
    { value: null, label: allLabel },
    ...sections.map((s) => (typeof s === "string" ? { value: s, label: s } : s)),
  ];

  return (
    <nav className={styles.tabs} aria-label={ariaLabel}>
      {items.map((item, i) => (
        <Fragment key={String(item.value)}>
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
