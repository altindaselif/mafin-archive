import styles from "./Outfits.module.css";
import { useLang } from "../../i18n.js";

/*
 * Vestuario — los trajes que llevan los personajes.
 *
 * Bölüm henüz içeriksiz: veri modeli, CMS koleksiyonu ve fotoğraflar
 * sonra gelecek. Sayfa yine de GERÇEK: ana sayfadaki kart ve menüdeki
 * bağlantı buraya düşüyor, 404 görünmüyor. Galería'nın boş albüm
 * mesajıyla aynı dili konuşuyor.
 *
 * İçerik eklenirken Galería'nın yapısı doğrudan örnek alınabilir:
 * sezon süzgeci + ızgara + lightbox. Fotoğraflar R2'ye, veri
 * src/data/outfits/ altına bölüm bölüm.
 *
 * Köşe çizimi YOK (page-no-art): silüetlerin sırası gezinme sırasıyla
 * birlikte artıyor ve bu sayfa Galería (145) ile Citas (159) arasına
 * giriyor — o aralıktan bir kesit gerekiyor, elde yok.
 */

const L = {
  title: { es: "Vestuario", en: "The Outfits" },
  subtitle: {
    es: "Los trajes que llevan Marta y Fina, capítulo a capítulo.",
    en: "The outfits Marta and Fina wear, chapter by chapter.",
  },
  empty: {
    es: "El vestuario aún se está preparando. Pronto llegarán las primeras prendas.",
    en: "The wardrobe is still being prepared. The first garments will arrive soon.",
  },
};

export default function Outfits() {
  const { t } = useLang();

  return (
    <div className="page page-no-art">
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>
      <p className={styles.empty}>{t(L.empty)}</p>
    </div>
  );
}
