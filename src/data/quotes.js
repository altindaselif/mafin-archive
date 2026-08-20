/*
 * Each quote lives in its own file under ./quotes/. Globbed at build time
 * and exposed as a single array sorted by episode, so quotes read in story
 * order and the rest of the app keeps importing `quotes` exactly as before.
 */
const modules = import.meta.glob("./quotes/*.json", { eager: true });

const quotes = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.episode - b.episode || a.number - b.number);

export default quotes;
