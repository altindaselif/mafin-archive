/*
 * Season ranges for Sueños de libertad, in the archive's continuous
 * episode numbering. Derived from the TVMaze episode list (show 74973).
 *
 * Bu tablo ELLE DÜZENLENMEZ: `npm run sync:dates` onu TVMaze'den yeniden
 * üretiyor. Eskiden elle güncelleniyordu ve bayatlıyordu — 3. sezon
 * "612'de biter" yazarken sezon hâlâ devam ediyordu, yani o tarihten
 * sonraki her bölüm yanlış sezona düşüyordu. Last synced: 2026-10-26, 680 episodes.
 *
 * Shared by every page that needs to map an episode number to a season
 * (quotes, videos, …) so the boundaries live in exactly one place.
 */
export const SEASON_RANGES = [
  { season: 1, firstEpisode: 1, lastEpisode: 269, year: "2024" },
  { season: 2, firstEpisode: 270, lastEpisode: 477, year: "2025" },
  { season: 3, firstEpisode: 478, lastEpisode: 680, year: "2026" },
];

/* Bir sezonun başladığı yıl. Timeline'daki ayraçlar bunu kullanıyor;
   eskiden orada elle yazılmış {1:"2024", 2:"2025", 3:"2026"} tablosu
   vardı ve 4. sezonda sessizce eksik kalırdı. */
export const yearOfSeason = (season) =>
  SEASON_RANGES.find((r) => r.season === season)?.year ?? "";

export const SEASONS = SEASON_RANGES.map((r) => r.season);

/* Episodes beyond the last known range fall into the newest season
 * until this file is synced again. */
export const seasonOf = (episodeNumber) =>
  (
    SEASON_RANGES.find((r) => episodeNumber <= r.lastEpisode) ??
    SEASON_RANGES[SEASON_RANGES.length - 1]
  ).season;

/* Bir koleksiyonda geçen sezonlar, artan sırada. Guía, Vídeos ve Galería
   üçü de aynı satırı ayrı ayrı yazıyordu. `of` kaydın sezonunu okur. */
export const seasonsIn = (items, of = (x) => x.season) =>
  [...new Set(items.map(of))].sort((a, b) => a - b);
