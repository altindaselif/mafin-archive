import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import { useLang } from "../../i18n.js";
import StableLabel from "../StableLabel/StableLabel.jsx";

const MORE_LINKS = [
  { to: "/gallery", label: { es: "Galería", en: "Gallery" } },
  { to: "/outfits", label: { es: "Vestuario", en: "The Outfits" } },
  { to: "/quotes", label: { es: "Citas", en: "Quotes" } },
  { to: "/characters", label: { es: "Personajes", en: "Characters" } },
  { to: "/actors", label: { es: "Actrices", en: "Actresses" } },
  { to: "/press", label: { es: "Prensa", en: "Press" } },
  { to: "/fandom", label: { es: "El Fandom", en: "The Fandom" } },
  {
    to: "/acknowledgements",
    label: { es: "Agradecimientos", en: "Acknowledgements" },
  },
];

const L = {
  home: { es: "Inicio", en: "Home" },
  story: { es: "Su historia", en: "The Story" },
  guide: { es: "Guía", en: "Guide" },
  videos: { es: "Vídeos", en: "Videos" },
  more: { es: "Más", en: "More" },
  openMenu: { es: "Abrir menú", en: "Open menu" },
  language: { es: "Idioma", en: "Language" },
};

/*
 * ARIA MENÜ ROLLERİ YOK (`role="menu"` / `menuitem"` / `aria-haspopup`).
 * Bunlar uygulama menüleri için — ok tuşlarıyla gezilen, bir öğe seçilen
 * şeyler. Buradakiler gezinme bağlantısı; ekran okuyucuya menü diye
 * tanıtmak yanlış vaat. Geriye `aria-expanded` kalıyor, ki açılır bir
 * blok için doğru olan da o.
 * Ayrıca mobilde düğme hiç çizilmiyor: orada bağlantılar menünün
 * içinde düz duruyor, yani açılacak bir menü de yok.
 *
 * Dil seçici iki yerde görünüyor ama işaretlemesi tek yerde: masaüstünde
 * "Más" açılırının içinde, mobilde menünün en altında. Her genişlikte
 * yalnızca biri `display: flex`; diğeri `display: none` olduğu için ne
 * ekranda ne de sekme sırasında var — ikisi aynı anda hiç bulunmuyor.
 */
function LangSwitch({ className, lang, setLang, label }) {
  return (
    <div className={className} role="group" aria-label={label}>
      <button
        className={`${styles.dropLangOption} ${lang === "es" ? styles.dropLangActive : ""}`}
        aria-pressed={lang === "es"}
        onClick={() => setLang("es")}
      >
        Español
      </button>
      <span className={styles.dropLangSep} aria-hidden="true">·</span>
      <button
        className={`${styles.dropLangOption} ${lang === "en" ? styles.dropLangActive : ""}`}
        aria-pressed={lang === "en"}
        onClick={() => setLang("en")}
      >
        English
      </button>
    </div>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const { t, lang, setLang } = useLang();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const moreRef = useRef(null);

  // Solid vs transparent: only the Home page starts transparent over the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the "More" dropdown on outside click / Escape.
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target))
        setMoreOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMoreOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  // Reset transient UI state on navigation.
  useEffect(() => {
    setMoreOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // On the home page the URL doesn't change when the brand/Home link is
  // clicked, so ScrollToTop never fires — handle that case here.
  const scrollTopIfHome = () => {
    if (isHome) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const solid = !isHome || scrolled || menuOpen;
  const moreActive = MORE_LINKS.some((l) => l.to === pathname);
  const linkClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

  return (
    <header
      className={`${styles.header} ${solid ? styles.solid : styles.transparent}`}
    >
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} onClick={scrollTopIfHome}>
          Mafin
        </Link>

        <button
          className={styles.burger}
          aria-expanded={menuOpen}
          aria-label={t(L.openMenu)}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          <NavLink to="/" end className={linkClass} onClick={scrollTopIfHome}>
            <StableLabel field={L.home} />
          </NavLink>
          <NavLink to="/timeline" className={linkClass}>
            <StableLabel field={L.story} />
          </NavLink>
          <NavLink to="/guide" className={linkClass}>
            <StableLabel field={L.guide} />
          </NavLink>
          <NavLink to="/videos" className={linkClass}>
            <StableLabel field={L.videos} />
          </NavLink>

          <div className={styles.more} ref={moreRef}>
            <button
              className={`${styles.link} ${styles.moreButton} ${moreActive ? styles.linkActive : ""}`}
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
            >
              <StableLabel field={L.more} />
              <svg
                className={styles.chevron}
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden="true"
              >
                <path
                  d="M1 3l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div
              className={`${styles.dropdown} ${moreOpen ? styles.dropdownOpen : ""}`}
            >
              {MORE_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.dropLink} ${styles.dropLinkActive}`
                      : styles.dropLink
                  }
                >
                  <StableLabel field={l.label} align="start" />
                </NavLink>
              ))}

              <LangSwitch
                className={styles.dropLang}
                lang={lang}
                setLang={setLang}
                label={t(L.language)}
              />
            </div>
          </div>

          {/* Mobilde menünün en altında; masaüstünde gizli */}
          <LangSwitch
            className={styles.navLang}
            lang={lang}
            setLang={setLang}
            label={t(L.language)}
          />
        </nav>
      </div>
    </header>
  );
}
