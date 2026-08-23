import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";
import { useLang } from "../../i18n.js";

const L = { close: { es: "Cerrar", en: "Close" } };

/* Klavyeyle gezilebilen elemanlar. Odak tuzağı bunların ilkiyle sonuncusu
   arasında dönüyor. `:not([disabled])` devre dışı düğmeleri eler. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])';

/**
 * Shared modal shell: backdrop-blur, click-outside + Escape to close,
 * body scroll lock, odak tuzağı.
 *
 * Odak yönetimi neden gerekli: bu olmadan modal açıkken Tab'a basan biri
 * arkadaki listede gezinmeye devam ediyor — ekran okuyucu kullanan biri
 * için modal hiç açılmamış gibi. Kapanınca da odak, modalı açan düğmeye
 * geri veriliyor ki kullanıcı listede yerini kaybetmesin.
 */
export default function Modal({ open, onClose, wide = false, label, children }) {
  const { t } = useLang();
  const panelRef = useRef(null);
  const openerRef = useRef(null);

  /*
   * `onClose` çoğu çağrı yerinde satır içi tanımlanıyor, yani her
   * render'da YENİ bir fonksiyon. Aşağıdaki efekt ona bağlı olsaydı her
   * render'da yeniden çalışır ve odağı ilk elemana — kapatma düğmesine —
   * geri atardı. Formda her harfe basışta odak kaçıyordu.
   *
   * Referansı ref'te tutup efekti yalnızca `open`e bağlıyoruz: dinleyici
   * hep güncel fonksiyonu çağırıyor ama efekt sadece açılış/kapanışta
   * çalışıyor.
   */
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    // Modalı açan eleman — kapanınca odak buraya dönecek
    openerRef.current = document.activeElement;

    const panel = panelRef.current;
    const list = () => [...panel.querySelectorAll(FOCUSABLE)];

    // Odağı içeri al: ilk gezilebilir eleman, yoksa panelin kendisi
    (list()[0] ?? panel).focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      // Tuzak: son elemandan Tab ileri sarınca başa, ilk elemandan
      // Shift+Tab geri sarınca sona döner — odak dışarı çıkmaz.
      const items = list();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
      // Odağı açan elemana iade et (hâlâ sayfadaysa)
      openerRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
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
