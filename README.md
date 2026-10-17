# 👋 #MAFIN — Fan Archive

> _A daily drama since 2024, indexed — every episode, every quote, every milestone, in two languages._  
> A bilingual archive for the Mafin storyline of _Sueños de Libertad_ — built on Cloudflare Workers with a headless CMS, self-hosted media on R2, and a moderated fan-submission pipeline.

> ⚠️ **Work in progress — not launched yet.** The engineering is complete and deployed, but the archive is still being filled with real content. The Gallery, the Outfits page and the Fandom section currently hold placeholder images and sample records, and the final domain (`universomafin.com`) is not connected yet. Treat the preview below as a technical demo, not a finished publication.

---

## 🔗 Links

- **Live Site:** [View Live Demo](https://archivo.universomafin.workers.dev)
- **Code:** [View GitHub Repository](https://github.com/altindaselif/mafin-archive)

---

## 📸 Screenshots

- [View Desktop Version](./desktop-screenshot.png)
- [View Mobile Version](./mobile-screenshot.png)

---

## 🎭 What Is This?

A fan-made archive devoted to **Marta** and **Fina**, the central couple of the Spanish daily drama _Sueños de Libertad_. A weekday broadcast running since February 2024 is a lot of story to lose track of, so the archive indexes it all: a summary for every episode, the quotes worth keeping, the milestone moments with video, a photo gallery, a wardrobe index of both women season by season, a character and cast directory, an interview index, a credits page for the people the archive was built on, and a section where fans submit their own work.

It is written for two audiences at once. Every human-readable string in the dataset is stored as `{ es, en }`, so the whole archive — including the data, not just the interface — switches between **Spanish and English** instantly. And because the people who maintain it are fans rather than developers, the entire catalogue is editable through a **headless CMS at `/admin`**: no pull requests, no JSON by hand, no deploy step.

---

## 💡 Key Features

- **✍️ Fully CMS-editable catalogue** — every collection is edited at `/admin` and committed over the GitHub API; one JSON file per record, so two editors never collide.
- **📬 Moderated fan submissions** — a Worker validates the payload, verifies a Turnstile token server-side, and files the entry as `approved: false`. Nothing reaches the site unreviewed.
- **🎬 Self-hosted media on R2** — two buckets bound to the Worker and served from the site's own origin, with range requests, conditional `304`s and a week-long cache.
- **🌐 Bilingual down to the data (ES / EN)** — every string in the dataset is `{ es, en }`, and labels render both languages into one grid cell so the navigation never shifts when you switch.
- **📅 Quote of the day & "Tal día como hoy"** — one quote and one anniversary chosen from the date itself, resolved at build time into a single key lookup.
- **🎞️ Scroll-activated timeline** — each milestone swaps its poster for a muted clip on a 200 ms dwell, and tears the `<video>` down again on exit. `prefers-reduced-motion` opts out.
- **⚡ Build-time index generation** — a prebuild script cuts what the home page loads by roughly six-fold; route-level splitting keeps every section in its own lazy chunk.
- **🗓️ Air dates that fill themselves** — a GitHub Actions job runs every Monday, pulls the episode list from TVMaze and commits whatever was missing. A date typed by a human is never overwritten.
- **🎨 Duotone tinting at render time** — an inline SVG filter tones artwork to the archive's bordeaux, so the image files stay neutral and the accent colour is six numbers.
- **♿ Accessibility** — a real focus trap in the shared modal, `aria-expanded` accordions, decorative art hidden from the tree, and an `ErrorBoundary` that never leaves a white screen.

> Each of these has a "why" behind it. The section below unfolds the ones that were actually hard.

---

## 🛠️ Technical Implementation

<details>
<summary><b>One JSON File Per Record</b></summary>
<br>

Every record is a separate file collected with `import.meta.glob(…, { eager: true })`, and its `id` is derived from the filename rather than stored inside. This is what makes the CMS safe for non-technical editors: adding a quote creates a new file instead of editing a shared array, so concurrent edits can't conflict and a malformed record can't take the rest of the collection down with it. It also removed manual numbering from the CMS entirely — the ordering key is the episode number, and identity is a generated slug.

</details>

<details>
<summary><b>Build-Time Index Generation</b></summary>
<br>

The home page needed six fields but was importing the episode and quote catalogues in full — around half a megabyte in the main bundle, blocking every image on the page behind a JS parse. `scripts/build-indexes.mjs` runs on `prebuild`/`predev` and derives exactly what's needed: a day-of-year table for the anniversary box (pre-resolved to the *oldest* episode on each month-day, skipping episodes flagged `noMafin`), the air-date list for the counters, and a filtered quote pool. A second index gives the Videos and Gallery pages episode titles and moods without the descriptions that make up three-quarters of the dataset.

</details>

<details>
<summary><b>Serving R2 Through the Worker</b></summary>
<br>

Binding the buckets to the Worker means media comes from the site's own origin and picks up Cloudflare's cache. Two details mattered more than expected: R2 populates `object.range` *even when no `Range` header was sent*, so checking it naively returned `206 Partial Content` for ordinary requests — the Worker inspects the **request** instead. And passing the request headers as `onlyIf` lets a conditional request answer `304` with an empty body, so repeat visitors re-download nothing.

</details>

<details>
<summary><b>Turnstile, Fail-Closed</b></summary>
<br>

The submission endpoint verifies the Turnstile token against `siteverify` and requires three things to match: `success`, the expected `action` (so a valid token minted on another page is rejected), and a **hostname from an allow-list held in Worker config** — never `localhost` in production. A network error or non-2xx from `siteverify` is treated as a failure, because letting an unverifiable request through is the same as having no protection at all. An invisible honeypot field catches unsophisticated bots first and answers `{ ok: true }` so they don't learn they were caught.

</details>

<details>
<summary><b>Timestamping in the Archive's Timezone</b></summary>
<br>

Submissions arrive from Spain, Latin America and Turkey, so stamping them in UTC meant two entries submitted in the same minute could land on different days. Dates are generated with `Intl.DateTimeFormat` in `Europe/Madrid` — not a fixed `+1`, because Spain shifts to `UTC+2` in summer and `Intl` already knows when. Storage stays ISO `YYYY-MM-DD` so it sorts lexicographically; every human-facing surface, the CMS included, renders `DD/MM/YYYY`.

</details>

<details>
<summary><b>Air Dates From a Public API, on a Schedule</b></summary>
<br>

The archive numbers episodes continuously, from one upwards; TVMaze files them by season and episode. The rule joining them was measured rather than assumed — *archive episode N is the Nth record in TVMaze's list* — and verified against all 611 records that carried a hand-entered date at the time. But that mapping depends on TVMaze's ordering: insert a record upstream and everything after it shifts by one, silently. So the script re-checks the dates it already has on every run and **writes nothing at all if more than five of them disagree**, exiting non-zero so the scheduled job goes red. A loud failure beats quietly rewriting six hundred dates.

It is deliberately not part of the build. Running at build time would mean the dates never reach git, never show up in a diff, and vanish from the site on the day TVMaze is down. It runs weekly instead of daily because only two things change — a date missing because someone added an episode through the CMS without one, and the season boundary table, which moves once a year — and a daily run would mostly have incremented a counter and triggered a pointless redeploy.

One detail from the workflow itself is worth keeping: the paths passed to `git diff --quiet` are written out literally rather than held in a variable. Unquoted `$PATHS` relies on the shell splitting words — bash does, zsh doesn't, and in the shell that doesn't, `git diff` checks one nonexistent path, reports no changes, and the job succeeds every week without ever committing anything.

</details>

<details>
<summary><b>One Home For Every Shared Value</b></summary>
<br>

CSS Modules scope by file, which is exactly what you want until several pages have to agree on something. Guía, Prensa and Fandom draw the same row, but their `.title` rules are not one class — they are namesakes in three files, hashed separately, so they drifted apart and the only way to notice was to see it. Matching them meant editing three files by hand, every time.

Eighteen custom properties now hold what pages share — the display-serif reading tier, the row typography, the two tab strips, the name switcher, the record counts — and twenty-five hard-coded declarations read from them instead. They are bound **by role, not by value**: `0.72rem` appears a dozen times across the site, but only the three that genuinely do the same job were tied together. Binding by number would have married the mood tags to the chapter count forever.

The same pass pulled the repeated markup out: one empty-list message instead of seven (which had quietly split into two different versions), one pill button, one stylesheet behind both tab strips, and one name switcher component for the three pages that had copied it twice. Each refactor was verified to render the identical pixel it replaced.

</details>

<details>
<summary><b>One Shared Collection Filter</b></summary>
<br>

The Guía and Vídeos pages applied the same three filters — season, search, moods — from two byte-identical copies, so adding a mood meant editing both and silently breaking whichever was missed. `lib/collection.js` now owns it, including the two **inverted** moods (`baby`, `cloe`) that *hide* matching records instead of showing them. Splitting inclusive from exclusive moods was also hoisted out of the loop: it had been allocating two throwaway arrays per record, on every keystroke, across the entire episode catalogue.

</details>

<details>
<summary><b>A Focus Trap That Survived an Inline Callback</b></summary>
<br>

The shared modal traps focus between the first and last focusable element and returns focus to whatever opened it. The subtle bug: `onClose` is defined inline at most call sites, so it's a new function identity on every render — with it in the effect's dependency array, the effect re-ran on each keystroke and threw focus back to the close button mid-sentence. The callback now lives in a ref that's updated on every render while the effect depends only on `open`.

</details>

---

## 🧰 Built With

- **React 18** — Context for language, route-level `lazy()` + `Suspense`, `useDeferredValue` on every search field
- **React Router 6** — SPA routing, deep links (`/videos?ep=186`) that open straight into the player
- **Vite 5** — dev server, build, content-hashed assets
- **CSS Modules** — scoped styles, SVG filters, `grid-template-rows` accordions, five breakpoints
- **Cloudflare Workers** — static assets + the media and submission API in one deployment
- **Cloudflare R2** — two buckets bound to the Worker; range requests, conditional GETs, long-lived cache
- **Cloudflare Turnstile** — server-side `siteverify` with action and hostname checks, fail-closed
- **Sveltia CMS** — headless editing at `/admin`, GitHub backend, R2 media library, self-hosted OAuth Worker
- **GitHub Contents API** — how fan submissions become reviewable commits
- **GitHub Actions** — a weekly job that syncs air dates from the TVMaze API and commits the result
- **`Intl.DateTimeFormat`** — DST-correct timestamps in the archive's own timezone
- **Node** — prebuild index generation, no runtime dependency beyond React and the router

---

## 💻 Running Locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

**One caveat worth knowing:** `/media/*` is served by the Cloudflare Worker from R2, not by Vite. Running `npm run dev` starts Vite alone, so those requests fall through to the SPA handler and return `index.html` — videos and gallery photos stay on their poster frames. Everything else works normally. To exercise media locally, run the Worker itself (`wrangler dev`), which binds the R2 buckets; otherwise test media against the deployed preview.

---

## 🤝 How This Was Built

I designed and built this archive myself, with **Claude Code** as a pair
programmer. The architecture, the data model and every product decision are
mine, including the ones that came from watching a real editor struggle, like
removing manual numbering from the CMS after a friend hit the
insert-in-the-middle problem. AI helped with implementation, refactors and
performance work; the measurements, the trade-offs and the review were mine.

The code is commented throughout, in Turkish for my own later reference, with
the reason behind every decision that is not obvious. Most of the explanations
in the section above come from those comments.

---

## ✍️ Author

- **LinkedIn:** [Elif Altındaş](https://www.linkedin.com/in/elifaltindas/)
- **Frontend Mentor:** [@altindaselif](https://www.frontendmentor.io/profile/altindaselif)
- **GitHub:** [@altindaselif](https://github.com/altindaselif)

---

_Disclaimer: This is a non-commercial fan archive. All stills, clips and photographs from_ Sueños de Libertad _belong to their respective rights holders; only short excerpts are shared, never full episodes._
