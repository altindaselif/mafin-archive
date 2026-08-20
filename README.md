# Mafin — Fan Archive

Elegant, minimalist React archive for Marta & Fina's story. Vite + React Router + CSS Modules, no other runtime dependencies.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Structure

```
src/
  i18n.js                  # t() helper — data is i18n-shaped {es, en}, UI defaults to "es"
  data/                    # quotes / episodes / videos / characters / press / timeline (simulated JSON)
  components/
    Header/                # transparent-over-hero → solid on scroll, "More" dropdown
    Modal/                 # shared backdrop-blur modal (Esc, click-out, scroll lock)
    MoodTags/  MoodFilter/ # pill tags + toggle-button filters (Set-based state)
    SearchInput/  Thumb/   # search field + image placeholder (swap for real <img> later)
  pages/
    Home/       # 100vh hero, daily glassmorphism quote, IntersectionObserver timeline
    Episodes/   # search + mood toggles, 2-line clamp, grid-rows accordion, gallery lightbox
    Videos/     # filterable grid, hover play reveal, Google Drive iframe modal
    Quotes/     # real-time search + speaker dropdown, badge rows
    Characters/ # 3D flip cards      Press/ # external index cards
```

## Performance at scale (large catalogues, many visitors)

The Videos page is built for ~1000+ records:

- **Runtime data**: `public/data/videos.json` is fetched (not bundled) — CDN-cacheable, updates without rebuilds.
- **Pagination**: 24 cards per "Cargar más" click keeps first paint light.
- **`React.memo` on `VideoCard`** + stable `onPlay` callback: opening the player doesn't re-render the grid.
- **`content-visibility: auto`** on cards: the browser skips layout/paint for off-screen cards.
- **`useDeferredValue`** on all search inputs: typing never blocks on list re-renders.
- **Lazy images**: pass `src` to `<Thumb />` and it renders `<img loading="lazy">`.

Stress test: `node scripts/generate-sample-videos.mjs 1000` (overwrites the catalogue — back it up first).

Many concurrent *visitors* is a hosting concern, not a code concern: this is a static site — deploy the `dist/` folder to any CDN (Netlify, Vercel, Cloudflare Pages) and it scales effortlessly. One real-world caveat: Google Drive throttles files that get heavy traffic ("quota exceeded"), so for a popular site plan to move videos to YouTube (unlisted), Vimeo, or Cloudflare Stream — only the iframe `src` needs to change.

## Swapping in real content

- **Images**: replace `<Thumb />` with `<img>` — the aspect-ratio API is identical.
- **Videos**: put real Google Drive file ids in `videos.json` (`driveId`).
- **Language**: change `DEFAULT_LANG` in `src/i18n.js`.
