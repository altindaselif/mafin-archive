import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Fandom.module.css";
import SectionTabs from "../../components/SectionTabs/SectionTabs.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import entries from "../../data/fandom.js";
import { useLang } from "../../i18n.js";
import { TURNSTILE_ACTION, TURNSTILE_SITE_KEY } from "../../config.js";

const L = {
  title: { es: "El Fandom", en: "The Fandom" },
  subtitle: {
    es: "Canciones, fanfics y arte inspirados en Marta y Fina, creados por los fans que mantienen viva su historia. Cada aportación se revisa antes de aparecer aquí.",
    en: "Songs, fanfics and art inspired by Marta and Fina, made by the fans who keep their story alive. Every submission is reviewed before it appears here.",
  },
};

const TYPES = ["Canción", "Fanfic", "Arte"];
const VERB = { Canción: "Escuchar", Fanfic: "Leer", Arte: "Ver" };

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("es-ES", { month: "long", year: "numeric" });

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
  const { t } = useLang();
  const [activeType, setActiveType] = useState(null); // null = todas las obras
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
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
        if (!cancelled) setError("No se ha podido cargar la verificación.");
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
      setError(
        "Título, autor/a y un enlace válido (que empiece por https://) son necesarios.",
      );
      return;
    }

    const token =
      widgetId.current !== null
        ? window.turnstile?.getResponse(widgetId.current)
        : null;
    if (!token) {
      setError("Completa la verificación antes de enviar.");
      return;
    }

    setError("");
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
      setError(
        err.message === "verification"
          ? "La verificación no se ha superado. Inténtalo de nuevo."
          : "No se ha podido enviar. Comprueba la conexión e inténtalo de nuevo.",
      );
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
    setError("");
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
          allLabel="Todas las obras"
          sections={TYPES}
          active={activeType}
          onChange={setActiveType}
        />
        <span className={styles.count} aria-live="polite">
          {visible.length} {visible.length === 1 ? "obra" : "obras"}
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
                <span className={styles.type}>{entry.type}</span>
                <time className={styles.date} dateTime={entry.date}>
                  {formatDate(entry.date)}
                </time>
              </div>
              <div className={styles.rowBody}>
                <h2 className={styles.workTitle}>{entry.title}</h2>
                <p className={styles.byline}>
                  <em>por {entry.author}</em>
                  {entry.note && <> — &laquo;{entry.note}&raquo;</>}
                </p>
              </div>
              <span className={styles.verb}>
                {VERB[entry.type] ?? "Ver"}
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
        <p className={styles.empty}>
          Todavía no hay aportaciones de este tipo. Quizá la primera sea la
          tuya.
        </p>
      )}

      {/* ── Invitation ── */}
      <section className={styles.invite}>
        <p className={styles.inviteLine}>
          ¿Has creado algo inspirado en su historia?
        </p>
        <button
          className={styles.inviteButton}
          onClick={() => setFormOpen(true)}
        >
          Donar al archivo
        </button>
      </section>

      {/* ── Donation form ── */}
      <Modal open={formOpen} onClose={closeForm} label="Donar al archivo">
        {submitted ? (
          <div className={styles.thanks}>
            <span className={styles.thanksLozenge} aria-hidden="true" />
            <h2 className={styles.formTitle}>Recibido</h2>
            <p className={styles.thanksText}>
              Tu aportación espera la revisión del archivero. Si pasa a la
              colección, aparecerá en esta página con tu nombre.
            </p>
          </div>
        ) : (
          <div className={styles.form}>
            <h2 className={styles.formTitle}>Donar al archivo</h2>
            <p className={styles.formIntro}>
              El archivo acepta enlaces a obras publicadas: canciones, fanfics,
              arte. Nada se publica sin revisión.
            </p>

            <label className={styles.field}>
              <span className={styles.label}>Tipo</span>
              <select
                className={styles.select}
                value={form.type}
                onChange={setField("type")}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Título de la obra</span>
              <input
                className={styles.input}
                type="text"
                value={form.title}
                onChange={setField("title")}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Tu nombre o alias</span>
              <input
                className={styles.input}
                type="text"
                value={form.author}
                onChange={setField("author")}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Enlace</span>
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
                Una línea sobre la obra <em>(opcional)</em>
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
                {error}
              </p>
            )}

            <button
              className={styles.submit}
              onClick={submit}
              disabled={sending || !captchaReady}
            >
              {sending ? "Enviando…" : "Enviar a revisión"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
