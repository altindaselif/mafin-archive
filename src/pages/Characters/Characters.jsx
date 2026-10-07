import styles from "./Characters.module.css";
import characters from "../../data/characters.js";
import { useLang } from "../../i18n.js";

const L = {
  title: { es: "Personajes", en: "Characters" },
  /* «Personaje» eril bir isim, o yüzden «fallecido» karakterin cinsiyetinden
     bağımsız olarak doğru — ileride kadın bir karakter eklenirse de uyar. */
  deceased: { es: "Personaje fallecido", en: "Deceased character" },
  subtitle: {
    es: "Todos los que se cruzaron en el camino de Marta y Fina.",
    en: "Everyone who crossed Marta and Fina's path, one by one.",
  },
};

/* Ad ve soyadın baş harfleri. Tek kelimelik adlarda tek harf, boş/eksik
   adda hiçbir şey döner — eskiden boş adda "NAN" yazıyordu. */
const monogram = (name) => {
  // `?? ""` şart: varsayılan parametre yalnız undefined'ı yakalar,
  // null gelirse String(null) "null" olup "N" üretirdi.
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)[0] ?? "") : "";
  return (first + last).toUpperCase();
};

export default function Characters() {
  const { t } = useLang();

  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep269.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>

      {/* Listenin üst çizgisinin hemen üstünde, sağa hizalı — Actrices'te
          «Imprescindibles» göstergesinin filmografi çizgisiyle kurduğu
          ilişkinin aynısı. Hover'a bırakmıyoruz: dokunmatik cihazda hover
          yok, keşfedilmesi de tesadüfe kalıyor. */}
      <p className={styles.legend}>
        <span className={styles.legendMark} aria-hidden="true">†</span>
        {t(L.deceased)}
      </p>

      <ul className={styles.list}>
        {characters.map((c) => (
          <li key={c.id} className={styles.character}>
            {/* Fotoğrafı olan karakterde avatar, olmayanda baş harfler.
                Yedek yol duruyor: yeni bir karakter fotoğrafsız eklenebilsin. */}
            {c.photo ? (
              <img
                className={styles.avatar}
                src={`${import.meta.env.BASE_URL}img/characters/${c.photo}`}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className={styles.monogram} aria-hidden="true">
                {monogram(c.name)}
              </div>
            )}
            <div className={styles.body}>
              <h3 className={styles.name}>
                {c.name}
                {c.deceased && (
                  /* Hançer (†): basılı arşivlerin ve soyağaçlarının
                     yüzyıllardır kullandığı "vefat etti" işareti. */
                  <abbr className={styles.dagger} title={t(L.deceased)}>
                    †<span className={styles.srOnly}>{t(L.deceased)}</span>
                  </abbr>
                )}
              </h3>
              <div className={styles.role}>{t(c.role)}</div>
              <p className={styles.bio}>{t(c.bio)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
