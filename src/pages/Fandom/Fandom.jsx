import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Fandom.module.css";
import SectionTabs from "../../components/SectionTabs/SectionTabs.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import entries from "../../data/fandom.js";
import { formatDate, useLang } from "../../i18n.js";
import { TURNSTILE_ACTION, TURNSTILE_SITE_KEY } from "../../config.js";

const L = {
  title: { es: "El Fandom", en: "The Fandom" },
  subtitle: {
    es: "Canciones, fanfics y arte inspirados en Marta y Fina, creados por los fans que mantienen viva su historia. Cada aportación se revisa antes de aparecer aquí.",
    en: "Songs, fanfics and art inspired by Marta and Fina, made by the fans who keep their story alive. Every submission is reviewed before it appears here.",
  },

  allWorks: { es: "Todas las obras", en: "All works" },
  filterBy: { es: "Filtrar por sección", en: "Filter by section" },
  work: { es: "obra", en: "work" },
  works: { es: "obras", en: "works" },
  by: { es: "por", en: "by" },
  empty: {
    es: "Todavía no hay aportaciones de este tipo. Quizá la primera sea la tuya.",
    en: "No submissions of this kind yet. Perhaps the first one is yours.",
  },

  inviteLine: {
    es: "¿Has creado algo inspirado en su historia?",
    en: "Have you made something inspired by their story?",
  },
  donate: { es: "Donar al archivo", en: "Donate to the archive" },
  formIntro: {
    es: "El archivo acepta enlaces a obras publicadas: canciones, fanfics, arte. Nada se publica sin revisión.",
    en: "The archive accepts links to published works: songs, fanfics, art. Nothing appears without review.",
  },
  received: { es: "Recibido", en: "Received" },
  thanks: {
    es: "Tu aportación espera la revisión del archivero. Si pasa a la colección, aparecerá en esta página con tu nombre.",
    en: "Your submission is waiting for the archivist's review. If it joins the collection, it will appear on this page under your name.",
  },

  fieldType: { es: "Tipo", en: "Type" },
  fieldTitle: { es: "Título de la obra", en: "Title of the work" },
  fieldAuthor: { es: "Tu nombre o alias", en: "Your name or alias" },
  fieldUrl: { es: "Enlace", en: "Link" },
  fieldNote: { es: "Una línea sobre la obra", en: "One line about the work" },
  optional: { es: "(opcional)", en: "(optional)" },
  sending: { es: "Enviando…", en: "Sending…" },
  send: { es: "Enviar a revisión", en: "Submit for review" },

  errRequired: {
    es: "Título, autor/a y un enlace válido (que empiece por https://) son necesarios.",
    en: "Title, author and a valid link (starting with https://) are required.",
  },
  errCaptchaPending: {
    es: "Completa la verificación antes de enviar.",
    en: "Complete the verification before sending.",
  },
  errCaptchaLoad: {
    es: "No se ha podido cargar la verificación.",
    en: "The verification could not be loaded.",
  },
  errVerification: {
    es: "La verificación no se ha superado. Inténtalo de nuevo.",
    en: "The verification did not pass. Please try again.",
  },
  errSend: {
    es: "No se ha podido enviar. Comprueba la conexión e inténtalo de nuevo.",
    en: "It could not be sent. Check your connection and try again.",
  },
};

/*
 * Tür DEĞERLERİ İspanyolca kalıyor: veri dosyalarında böyle saklanıyor,
 * worker gelen gönderimi bu kümeye karşı doğruluyor ve CMS'te de böyle
 * görünüyorlar. Çevrilen yalnızca ekranda görünen etiket — yoksa dil
 * değiştiren biri, kayıtlarla eşleşmeyen bir değer göndermiş olurdu.
 */
const TYPES = ["Canción", "Fanfic", "Arte"];
const TYPE_LABEL = {
  Canción: { es: "Canción", en: "Song" },
  Fanfic: { es: "Fanfic", en: "Fanfic" },
  Arte: { es: "Arte", en: "Art" },
};
const VERB = {
  Canción: { es: "Escuchar", en: "Listen" },
  Fanfic: { es: "Leer", en: "Read" },
  Arte: { es: "Ver", en: "View" },
};

/* Bu sayfada tarih gün göstermiyor — "agosto de 2026" yeterli. */
const MONTH_YEAR = { month: "long", year: "numeric" };

/*
 * Turnstile betiğini yalnızca form açıldığında yüklüyoruz. Sayfa
 * açılışında yüklemek diğer sayfalara da maliyet bindirirdi; bu form
 * ise ziyaretçilerin çoğunun hiç açmadığı bir yer.
 *
 * `render=explicit`: widget'ı biz elle çiziyoruz, çünkü kimliğini
 * saklayıp gönderimden sonra sıfırlamamız gerekiyor (jetonlar tek
 * kullanımlık; modal açık kaldığı için ikinci deneme aynı jetonla
 * gelirse sunucu reddeder).
 */
/* Turnstile API'sinin hazır olduğunu haber verecek genel fonksiyonun adı.
   Betiğin kendi `onload`'u YETMİYOR: `api.js?render=explicit` bir
   yükleyici, kendi onload'u tetiklendiğinde `window.turnstile` henüz
   atanmamış oluyor. Cloudflare bunun için `onload=` parametresini
   tanımlıyor — asıl API hazır olunca burayı çağırıyor. */
const TURNSTILE_READY = "__mafinTurnstileReady";
const TURNSTILE_SRC =
  `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${TURNSTILE_READY}`;

let turnstileLoader = null;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  turnstileLoader ??= new Promise((resolve, reject) => {
    window[TURNSTILE_READY] = resolve;
    const el = document.createElement("script");
    el.src = TURNSTILE_SRC;
    el.async = true;
    el.onerror = () => {
      turnstileLoader = null; // sonraki açılışta yeniden denensin
      reject(new Error("turnstile"));
    };
    document.head.appendChild(el);
  });
  return turnstileLoader;
}

const EMPTY_FORM = {
  type: "Canción",
  title: "",
  author: "",
  url: "",
  note: "",
  website: "",
};

export default function Fandom() {
  const { t, lang } = useLang();
  const [activeType, setActiveType] = useState(null); // null = todas las obras
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  /* Metni değil sözlük girdisini tutuyoruz: kullanıcı hata ekrandayken
     dili değiştirirse mesaj da onunla birlikte çevrilsin. */
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const captchaRef = useRef(null);   // widget'ın çizileceği kutu
  const widgetId = useRef(null);     // sıfırlamak için kimliği
  const [captchaReady, setCaptchaReady] = useState(false);

  // Only curator-approved donations reach the shelves.
  const visible = useMemo(
    () =>
      entries.filter(
        (e) => e.approved && (activeType === null || e.type === activeType),
      ),
    [activeType],
  );

  /* Form açılınca widget'ı çiz, kapanınca temizle. Modal kapanıp tekrar
     açıldığında eskisi ortada kalmasın. */
  useEffect(() => {
    if (!formOpen || submitted) return;
    let cancelled = false;

    loadTurnstile()
      .then(() => {
        if (cancelled || !captchaRef.current || widgetId.current !== null) return;
        widgetId.current = window.turnstile.render(captchaRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: TURNSTILE_ACTION,
        });
        setCaptchaReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(L.errCaptchaLoad);
      });

    return () => {
      cancelled = true;
      if (widgetId.current !== null) {
        window.turnstile?.remove?.(widgetId.current);
        widgetId.current = null;
      }
      setCaptchaReady(false);
    };
  }, [formOpen, submitted]);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  /*
   * Aportación /api/fandom uç noktasına gidiyor (worker/fandom.js).
   * Orada doğrulanıp depoya `approved: false` olarak yazılıyor; CMS'te
   * "onay bekliyor" görünüyor. Arşivci onaylayana kadar sitede çıkmıyor.
   *
   * Buradaki kontroller sadece kullanıcıya hızlı geri bildirim için —
   * asıl doğrulama sunucuda, tarayıcıdan gelene güvenilmiyor.
   */
  const submit = async () => {
    if (sending) return;

    if (
      !form.title.trim() ||
      !form.author.trim() ||
      !/^https?:\/\//i.test(form.url.trim())
    ) {
      setError(L.errRequired);
      return;
    }

    const token =
      widgetId.current !== null
        ? window.turnstile?.getResponse(widgetId.current)
        : null;
    if (!token) {
      setError(L.errCaptchaPending);
      return;
    }

    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/fandom", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, "cf-turnstile-response": token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error ?? "error");
      setSubmitted(true);
    } catch (err) {
      setError(err.message === "verification" ? L.errVerification : L.errSend);
      /* Jetonlar tek kullanımlık: başarısız denemeden sonra widget'ı
         sıfırlamazsak ikinci deneme aynı jetonla gider ve reddedilir. */
      if (widgetId.current !== null) window.turnstile?.reset(widgetId.current);
    } finally {
      setSending(false);
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setSubmitted(false);
    setError(null);
    setSending(false);
    setForm(EMPTY_FORM);
  };

  return (
    <div
      className="page"
      style={{ "--page-art": "url(/img/silhouettes/silhouette-ep616.webp)" }}
    >
      <h1 className="page-title">{t(L.title)}</h1>
      <p className="page-subtitle">{t(L.subtitle)}</p>

      <div className={styles.sectionHeader}>
        <SectionTabs
          allLabel={t(L.allWorks)}
          ariaLabel={t(L.filterBy)}
          sections={TYPES.map((v) => ({ value: v, label: t(TYPE_LABEL[v]) }))}
          active={activeType}
          onChange={setActiveType}
        />
        <span className={styles.count} aria-live="polite">
          {visible.length} {t(visible.length === 1 ? L.work : L.works)}
        </span>
      </div>

      <ul className={styles.ledger}>
        {visible.map((entry) => (
          <li key={entry.id}>
            <a
              className={styles.row}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.rowMeta}>
                <span className={styles.type}>
                  {t(TYPE_LABEL[entry.type] ?? { es: entry.type, en: entry.type })}
                </span>
                <time className={styles.date} dateTime={entry.date}>
                  {formatDate(entry.date, lang, MONTH_YEAR)}
                </time>
              </div>
              <div className={styles.rowBody}>
                <h2 className={styles.workTitle}>{entry.title}</h2>
                <p className={styles.byline}>
                  <em>
                    {t(L.by)} {entry.author}
                  </em>
                  {entry.note && <> — &laquo;{entry.note}&raquo;</>}
                </p>
              </div>
              <span className={styles.verb}>
                {t(VERB[entry.type] ?? VERB.Arte)}
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
        ))}
      </ul>

      {visible.length === 0 && (
        <p className={styles.empty}>{t(L.empty)}</p>
      )}

      {/* ── Invitation ── */}
      <section className={styles.invite}>
        <p className={styles.inviteLine}>{t(L.inviteLine)}</p>
        <button
          className={styles.inviteButton}
          onClick={() => setFormOpen(true)}
        >
          {t(L.donate)}
        </button>
      </section>

      {/* ── Donation form ── */}
      <Modal open={formOpen} onClose={closeForm} label={t(L.donate)}>
        {submitted ? (
          <div className={styles.thanks}>
            <span className={styles.thanksLozenge} aria-hidden="true" />
            <h2 className={styles.formTitle}>{t(L.received)}</h2>
            <p className={styles.thanksText}>{t(L.thanks)}</p>
          </div>
        ) : (
          <div className={styles.form}>
            <h2 className={styles.formTitle}>{t(L.donate)}</h2>
            <p className={styles.formIntro}>{t(L.formIntro)}</p>

            <label className={styles.field}>
              <span className={styles.label}>{t(L.fieldType)}</span>
              <select
                className={styles.select}
                value={form.type}
                onChange={setField("type")}
              >
                {TYPES.map((value) => (
                  <option key={value} value={value}>
                    {t(TYPE_LABEL[value])}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>{t(L.fieldTitle)}</span>
              <input
                className={styles.input}
                type="text"
                value={form.title}
                onChange={setField("title")}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>{t(L.fieldAuthor)}</span>
              <input
                className={styles.input}
                type="text"
                value={form.author}
                onChange={setField("author")}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>{t(L.fieldUrl)}</span>
              <input
                className={styles.input}
                type="url"
                placeholder="https://…"
                value={form.url}
                onChange={setField("url")}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                {t(L.fieldNote)} <em>{t(L.optional)}</em>
              </span>
              <textarea
                className={styles.textarea}
                rows="2"
                maxLength="140"
                value={form.note}
                onChange={setField("note")}
              />
            </label>

            {/* Honeypot — hidden from humans, irresistible to bots */}
            <label className={styles.honeypot} aria-hidden="true">
              Website
              <input
                type="text"
                tabIndex="-1"
                autoComplete="off"
                value={form.website}
                onChange={setField("website")}
              />
            </label>

            {/* Bot koruması. Kutu formun bir parçası; doldurulmadan
                gönderim sunucuda reddediliyor. */}
            <div className={styles.captcha} ref={captchaRef} />

            {error && (
              <p className={styles.error} role="alert">
                {t(error)}
              </p>
            )}

            <button
              className={styles.submit}
              onClick={submit}
              disabled={sending || !captchaReady}
            >
              {sending ? t(L.sending) : t(L.send)}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
