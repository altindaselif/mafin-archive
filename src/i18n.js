// Central i18n. Data files store every human-readable string as
// { es: "...", en: "..." }; UI components keep their own small
// dictionaries in the same shape. The current language lives in
// LanguageContext (persisted to localStorage) and the `t` returned
// by useLang() resolves against it.
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const DEFAULT_LANG = "es";
const STORAGE_KEY = "mafin-lang";

/* Words shared across several components live here once; page-specific
 * strings stay co-located with their component. */
export const COMMON = {
  episode: { es: "Capítulo", en: "Episode" },
  season: { es: "Temporada", en: "Season" },
};

function resolve(field, lang) {
  if (field == null) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field[DEFAULT_LANG] ?? Object.values(field)[0] ?? "";
}

/* Static helper for non-component code; always DEFAULT_LANG.
 * Components should use useLang() so they re-render on switch. */
export function t(field, lang = DEFAULT_LANG) {
  return resolve(field, lang);
}

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (field) => resolve(field, DEFAULT_LANG),
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private mode — the choice simply won't persist */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const tLang = useCallback((field) => resolve(field, lang), [lang]);
  const value = useMemo(() => ({ lang, setLang, t: tLang }), [lang, tLang]);

  return createElement(LanguageContext.Provider, { value }, children);
}

export function useLang() {
  return useContext(LanguageContext);
}
