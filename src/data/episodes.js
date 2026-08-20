/*
 * Each episode lives in its own file under ./episodes/. Globbed at build
 * time, sorted by number. Season is NOT stored in the data — it's derived
 * from the episode number here (single source of truth in seasonInfo.js),
 * so editors never touch it and it can never be wrong.
 */
import { seasonOf } from "./seasonInfo.js";

const modules = import.meta.glob("./episodes/*.json", { eager: true });

const episodes = Object.values(modules)
  .map((m) => ({ ...m.default, season: seasonOf(m.default.number) }))
  .sort((a, b) => a.number - b.number);

export default episodes;
