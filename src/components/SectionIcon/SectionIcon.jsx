/**
 * Line-art section marks in the archive's shared visual language:
 * 1.4px strokes, currentColor (wine on the home grid), rounded joins.
 * No icon library — every glyph is drawn to match the site, not imported.
 */
const paths = {
  // Open book — la guía
  episodes: (
    <>
      <path d="M14 7.3c-2.2-1.7-5-2.3-8.5-2.1v15.6c3.5-.2 6.3.4 8.5 2.1 2.2-1.7 5-2.3 8.5-2.1V5.2c-3.5-.2-6.3.4-8.5 2.1z" strokeLinejoin="round" />
      <path d="M14 7.3v15.6" />
    </>
  ),
  // Play triangle — vídeos (sized to match the others' optical weight)
  videos: <path d="M8 5.5l13 8.5-13 8.5z" strokeLinejoin="round" />,
  // Quotation marks (outline, to match the other line icons) — citas
  quotes: (
    <path
      d="M6 21.55c3.2-.8 4.8-3 4.8-6.2V6.55H5.2v6.4h3.4c0 2-1 3.2-3 3.8zM17 21.55c3.2-.8 4.8-3 4.8-6.2V6.55h-5.6v6.4h3.4c0 2-1 3.2-3 3.8z"
      strokeLinejoin="round"
    />
  ),
  // Framed portrait — personajes
  characters: (
    <>
      <rect x="5" y="4" width="18" height="20" rx="2" />
      <circle cx="14" cy="11" r="3" />
      <path d="M8.5 20c1-3 3-4.5 5.5-4.5s4.5 1.5 5.5 4.5" />
    </>
  ),
  // Three figures shoulder to shoulder (community) — la afición
  fandom: (
    <>
      <circle cx="14" cy="10" r="2.7" />
      <path d="M9.4 18.7c0-2.6 2-4.6 4.6-4.6s4.6 2 4.6 4.6" />
      <circle cx="6.8" cy="12.5" r="2.4" />
      <path d="M2.4 20c0-2.4 1.7-4.2 4-4.2.6 0 1.1.1 1.6.3" />
      <circle cx="21.2" cy="12.5" r="2.4" />
      <path d="M25.6 20c0-2.4-1.7-4.2-4-4.2-.6 0-1.1.1-1.6.3" />
    </>
  ),
  // Camera — la prensa (body, viewfinder bump, lens)
  press: (
    <>
      <rect x="4" y="8.5" width="20" height="13.5" rx="2" />
      <path d="M9.6 8.5l1.3-2.3c.2-.3.5-.5.9-.5h4.4c.4 0 .7.2.9.5l1.3 2.3" strokeLinejoin="round" />
      <circle cx="14" cy="15.2" r="3.8" />
    </>
  ),
  // Framed landscape photo — la galería
  gallery: (
    <>
      <rect x="4" y="6" width="20" height="16" rx="2" />
      <circle cx="10" cy="12" r="1.8" />
      <path d="M5 20l6-6 3.5 3.5L18 14l5 5" strokeLinejoin="round" />
    </>
  ),
  // Five-pointed star — las actrices
  actors: (
    <path
      d="M14 5l2.35 6.76 6.66.15-5.71 4.33 1.98 6.85L14 19l-5.88 4.09 1.98-6.85-5.71-4.33 6.66-.15z"
      strokeLinejoin="round"
    />
  ),
  // Hourglass — la historia
  history: (
    <>
      <path d="M8 5h12M8 23h12" />
      <path d="M9 5c0 5 5 6 5 9s-5 4-5 9M19 5c0 5-5 6-5 9s5 4 5 9" strokeLinejoin="round" />
    </>
  ),
};

export default function SectionIcon({ name, size = 28, className = "" }) {
  const glyph = paths[name];
  if (!glyph) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );
}
