/*
 * Mood labels — the ONLY place mood keys become human-readable.
 *
 * The keys (kiss, argue, iconic…) are internal identifiers: they live in
 * the episode JSON `moods` arrays and drive all filtering + exclusion
 * logic. Never rename a key here; that would mean editing every episode.
 * To translate a tag, edit only its { es, en } label below — the filters
 * keep working because they still match on the key, not the label.
 *
 * A key with no entry falls back to showing itself raw, so a brand-new
 * mood added to the data never breaks the UI; it just waits for a label.
 */
export const MOOD_LABELS = {
  iconic: { es: "Icónico", en: "Iconic" },
  kiss: { es: "Besos", en: "Kisses" },
  argue: { es: "Peleas", en: "Fights" },
  hug: { es: "Abrazos", en: "Hugs" },
  miento: { es: "Miento", en: "Miento" },
  baby: { es: "Bebé", en: "Baby" },
  cloe: { es: "Cloe", en: "Cloe" },
  // bianca: { es: "Bianca", en: "Bianca" },  // uncomment when the mood exists in the data
};

/* Returns an { es, en } field for t(); unknown keys show themselves. */
export const moodLabel = (key) => MOOD_LABELS[key] ?? { es: key, en: key };
