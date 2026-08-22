import styles from "./LoadMore.module.css";
import { useLang } from "../../i18n.js";

const L = {
  more: { es: "Cargar más", en: "Load more" },
  remaining: { es: "restantes", en: "remaining" },
};

/**
 * "Cargar más" düğmesi. Vídeos ve Galería aynı düğmeyi, aynı sayacı ve
 * aynı iki çeviriyi ayrı ayrı taşıyordu.
 *
 * Gösterilecek bir şey kalmadıysa kendini hiç çizmiyor — çağıran sayfanın
 * ayrıca koşul yazmasına gerek yok.
 */
export default function LoadMore({ remaining, onClick }) {
  const { t } = useLang();
  if (remaining <= 0) return null;

  return (
    <div className={styles.wrap}>
      <button className={styles.button} onClick={onClick}>
        {t(L.more)} ({remaining} {t(L.remaining)})
      </button>
    </div>
  );
}
