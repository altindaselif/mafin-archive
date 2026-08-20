/*
 * Each gallery record its own file under ./gallery/ (one per episode, written
 * by the CMS as { episode, photos: [...] }). Globbed at build time; season is
 * derived from the episode number so a volume can never be mislabelled. Only
 * records that actually carry photos survive — an empty album never shows.
 */
import { seasonOf } from "./seasonInfo.js";

const modules = import.meta.glob("./gallery/*.json", { eager: true });

const galleries = Object.values(modules)
  .map((m) => m.default)
  .filter((g) => Array.isArray(g.photos) && g.photos.length > 0)
  .map((g) => ({ ...g, season: seasonOf(g.episode) }))
  .sort((a, b) => a.episode - b.episode);

export default galleries;
