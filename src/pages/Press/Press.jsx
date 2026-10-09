import { useMemo, useState } from "react";
import styles from "./Press.module.css";
import SectionTabs from "../../components/SectionTabs/SectionTabs.jsx";
import ListToolbar from "../../components/ListToolbar/ListToolbar.jsx";
import press from "../../data/press.js";
import { formatDate, useLang } from "../../i18n.js";

/*
 * Prensa — Marta ve Alba'nın röportajları.
 *
 * ÜÇ EKSEN, İKİ KONTROL: kim (ana ayrım, üstte), biçim (ikinci kademe
 * süzgeç) ve yıl (aradaki ayraçlar). Vestuario'daki iskeletin aynısı,
 * bilerek: ziyaretçinin öğreneceği ikinci bir düzen olmasın.
 *
 * NEDEN YIL SÜZGEÇ DEĞİL BAŞLIK: yıl sürekli artıyor. Sekme yapılsaydı
 * her yıl bir sekme daha eklenir ve asıl istenen şey kaybolurdu —
 * zaman içinde kayarak gezmek. Başlıklar arşivin şeklini gösteriyor.
 *
 * NEDEN BİÇİMDE "TODAS" VAR AMA KİŞİDE YOK: biçim bir mod — kimi okumak
 * ister, kimi izlemek, kimi ikisini birden. Kişi ise sayfanın ayrımı;
 * Vestuario'da Marta/Fina nasıl zorunlu bir seçimse burada da öyle.
 *
 * SEKMELER AYRIK: "Alba" yalnızca Alba'nın tek başına konuştuklarını
 * getiriyor, ikisinin birlikte olduğu röportajlar "Mafin"de. Kapsayıcı
 * olsaydı ortak röportajlar üç sekmede birden çıkar ve sekme sayıları
 * toplamı listeyi aşardı. Ayrı bir "ikisi" değeri veride YOK; Mafin,
 * `people` iki isim birden içeriyor demek.
 */

const L = {
  title: { es: "Prensa", en: "Press" },
  subtitle: {
    es: "Entrevistas a Marta Belmonte y Alba Brunet, en texto y en vídeo.",
    en: "Interviews with Marta Belmonte and Alba Brunet, written and filmed.",
  },
  who: { es: "Elegir a quién entrevistan", en: "Choose who is interviewed" },
  byFormat: { es: "Filtrar por formato", en: "Filter by format" },
  allFormats: { es: "Todas", en: "All" },
  interview: { es: "entrevista", en: "interview" },
  interviews: { es: "entrevistas", en: "interviews" },
  read: { es: "Leer", en: "Read" },
  watch: { es: "Ver", en: "Watch" },
  together: { es: "Marta Belmonte y Alba Brunet", en: "Marta Belmonte and Alba Brunet" },
  empty: {
    es: "No hay entrevistas que coincidan. Prueba con otro formato.",
    en: "No interviews match. Try another format.",
  },
};

/* Ana ayrım. "Mafin" bir kişi değil, ikisinin birlikte olduğu kayıtlar —
   veride böyle bir değer yok, `people.length === 2` demek.
   MARTA HER ZAMAN ÖNCE: sitenin her yerinde bu sıra geçerli (Actrices
   verisi de böyle sıralı). */
const WHO = ["Marta", "Alba", "Mafin"];

/* Sekmede kısa ad, satırda tam ad. Sekmeler sayfanın büyük tipografik
   ayrımı, orada soyadı kalabalık yapıyor; satırdaki künye ise kimin
   konuştuğunu kesin söylemeli. Veride saklanan değer yine kısa olan —
   Fandom'daki tür/etiket ayrımıyla aynı gerekçe. */
const FULL_NAME = { Marta: "Marta Belmonte", Alba: "Alba Brunet" };

/* Biçim DEĞERLERİ İspanyolca sabit (veride ve CMS'te böyle duruyorlar),
   çevrilen yalnızca etiket — Fandom'daki türlerle aynı gerekçe. */
const FORMATS = ["texto", "vídeo"];
const FORMAT_LABEL = {
  texto: { es: "Escritas", en: "Written" },
  "vídeo": { es: "En vídeo", en: "On video" },
};

const matchesWho = (item, who) =>
  who === "Mafin"
    ? item.people.length === 2
    : item.people.length === 1 && item.people[0] === who;

export default function Press() {
  const { lang, t } = useLang();
  const [who, setWho] = useState(WHO[0]);
  const [format, setFormat] = useState(null); // null = todas

  const shown = useMemo(
    () =>
      press.filter(
        (p) => matchesWho(p, who) && (format === null || p.format === format),
      ),
    [who, format],
  );

  /* Yıla göre öbekler. Liste zaten tarihe göre azalan sırada geldiği için
     tek geçiş yetiyor; Map ekleme sırasını koruduğu için yıllar da en
     yeniden eskiye çıkıyor. */
  const byYear = useMemo(() => {
    const years = new Map();
    for (const item of shown) {
      const y = (item.date ?? "").slice(0, 4) || "—";
      if (!years.has(y)) years.set(y, []);
      years.get(y).push(item);
    }
    return [...years];
  }, [shown]);

  const count = (n) =>
    `${n} ${n === 1 ? t(L.interview) : t(L.interviews)}`;

  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep561.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>

      {/* Ana ayrım: Vestuario'daki karakter seçicisiyle aynı dil */}
      <nav className={styles.switcher} aria-label={t(L.who)}>
        {WHO.map((name, i) => (
          <span key={name}>
            {i > 0 && (
              <span className={styles.sep} aria-hidden="true">
                ·
              </span>
            )}
            <button
              className={`${styles.name} ${name === who ? styles.nameActive : ""}`}
              aria-pressed={name === who}
              onClick={() => setWho(name)}
            >
              {name}
            </button>
          </span>
        ))}
      </nav>

      <ListToolbar className={styles.toolbar} count={count(shown.length)}>
        <SectionTabs
          allLabel={t(L.allFormats)}
          ariaLabel={t(L.byFormat)}
          sections={FORMATS.map((f) => ({
            value: f,
            label: t(FORMAT_LABEL[f]),
          }))}
          active={format}
          onChange={setFormat}
        />
      </ListToolbar>

      {shown.length === 0 && <p className={styles.empty}>{t(L.empty)}</p>}

      {byYear.map(([year, items]) => (
        <section key={year} className={styles.year}>
          <header className={styles.yearHead}>
            <h2 className={styles.yearTitle}>{year}</h2>
            <span className={styles.yearCount}>{count(items.length)}</span>
          </header>

          <ul className={styles.list}>
            {items.map((item) => {
              const isVideo = item.format === "vídeo";
              return (
                <li key={item.id}>
                  <a
                    className={styles.row}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* Künye tek sütunda alt alta — Fandom'daki satırın
                        aynısı. Tarih ayrı bir sütundayken, farklı
                        uzunluktaki tarihler ("3 noviembre" / "20 enero")
                        yan yana tırtıklı duruyordu. */}
                    <span className={styles.meta}>
                      <span className={styles.outlet}>{item.outlet}</span>
                      <time className={styles.date} dateTime={item.date}>
                        {formatDate(item.date, lang)}
                      </time>
                    </span>

                    <span className={styles.middle}>
                      {/* Oynat işareti "Todas" görünümünde de duruyor:
                          süzgece dokunmadan hangisinin video olduğu belli. */}
                      {isVideo && (
                        <svg
                          className={styles.play}
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                        >
                          {/* Çıplak üçgen oynat düğmesi olarak okunmuyordu.
                              Daire onu tanıdık bir simgeye çeviriyor. */}
                          <circle
                            cx="7"
                            cy="7"
                            r="6.2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.1"
                          />
                          <path d="M5.6 4.4v5.2L9.6 7z" fill="currentColor" />
                        </svg>
                      )}
                      <span className={styles.people}>
                        {item.people.length === 2
                          ? t(L.together)
                          : FULL_NAME[item.people[0]] ?? item.people[0]}
                      </span>
                      <h3 className={styles.title}>{t(item.title)}</h3>
                    </span>

                    <span className={styles.cta}>
                      {t(isVideo ? L.watch : L.read)}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 10L10 2M4 2h6v6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
