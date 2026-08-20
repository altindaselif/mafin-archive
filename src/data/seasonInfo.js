/*
 * Season ranges for Sueños de libertad, in the archive's continuous
 * episode numbering. Derived from the TVMaze episode list (show 74973);
 * update `lastEpisode` of the newest season (or add a new entry) as
 * the show airs. Last synced: 2026-07-21, 612 episodes.
 *
 * Shared by every page that needs to map an episode number to a season
 * (quotes, videos, …) so the boundaries live in exactly one place.
 */
export const SEASON_RANGES = [
  { season: 1, firstEpisode: 1, lastEpisode: 269 },
  { season: 2, firstEpisode: 270, lastEpisode: 477 },
  { season: 3, firstEpisode: 478, lastEpisode: 612 },
];

export const SEASONS = SEASON_RANGES.map((r) => r.season);

/* Episodes beyond the last known range fall into the newest season
 * until this file is synced again. */
export const seasonOf = (episodeNumber) =>
  (
    SEASON_RANGES.find((r) => episodeNumber <= r.lastEpisode) ??
    SEASON_RANGES[SEASON_RANGES.length - 1]
  ).season;
