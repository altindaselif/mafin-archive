import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";
import { useLang } from "../../i18n.js";

const L = { close: { es: "Cerrar", en: "Close" } };

/**
 * Shared modal shell: backdrop-blur, click-outside + Escape to close,
 * body scroll lock. `wide` stretches the panel for lightbox/player use.
 */
export default function Modal({ open, onClose, wide = false, label, children }) {
  const { t } = useLang();
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`${styles.panel} ${wide ? styles.wide : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.close} onClick={onClose} aria-label={t(L.close)}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
