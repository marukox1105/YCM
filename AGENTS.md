# AGENTS.md — YCM UI Prototype

This file is the working-agreement for any coding agent (or engineer) picking up this
repository. It restates and expands on the rules already established in
[CLAUDE.md](CLAUDE.md) — read that file too, it is the source of truth for scope and
process. This file adds the technical detail CLAUDE.md doesn't cover: stack, structure,
conventions, and concrete commands.

## Project purpose

YCM (product name "MUSE" / "YouCam Muse") is an AI music-video and song creation product.
**This repository is a UI prototype only** — it exists so the product owner can review
screens and flows in a browser, and so RD can copy components/CSS for the real frontend
later. It is explicitly **not**:
- production-ready code
- wired to any backend or API
- a place to build real authentication, payments, or data persistence

Every screen uses mock data and local component state to simulate behavior. Treat that as
permanent scope, not a temporary shortcut to clean up.

## Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- Plain CSS only — no Tailwind, no CSS-in-JS, no UI framework
- No router library — routing is manual `window.location.pathname` string-matching in
  [src/App.tsx](src/App.tsx)
- No state-management library — local component state (`useState`/`useRef`/`useEffect`) only
- No backend, no API calls, no data fetching
- The only runtime dependencies are `react` and `react-dom`. Do not add packages without the
  user's explicit, prior approval — this includes small utility libraries, icon packs, date
  libraries, animation libraries, etc.

## Project structure

```
src/
  pages/            One folder per route/screen. Large pages split into per-section
                     sub-files inside the same folder (e.g. HomePage/HeroBannerSection.tsx)
                     rather than one monolithic file. Each section still gets its own .css.
  components/        Shared/reusable UI. One folder per component: ComponentName/ComponentName.tsx
                     + ComponentName.css, no barrel index.ts files.
  layouts/            Page chrome shared across pages. Currently just AppLayout/
                     (Sidebar + Navbar/DetailNavbar slot + Footer + mobile chrome).
  data/               Mock data assembled from real asset files via import.meta.glob
                     (songs.ts, musicVideos.ts). No manual re-registration needed when new
                     asset folders are added that match the existing naming pattern.
  config/             layoutMode.ts — one flag (MOBILE_LAYOUT) controlling which mobile
                     chrome renders below the app-mobile breakpoint.
  styles/             tokens.css (design tokens, do not edit without explicit request) and
                     breakpoints.css (empty reference scaffolding for the six RWD tiers —
                     not actually imported; each component does its own media queries inline).
  assets/             backgrounds/, brand/, covers/ (albums, MVs, avatars, Top Picks Songs —
                     the largest folder), hero/, icons/ (ic_*.svg, monochrome, applied via
                     CSS mask so they can be tinted with currentColor).
  App.tsx             Manual pathname routing (no router lib).
  index.css           Global reset + body defaults, sourced from tokens.css.
```

Routing today (`src/App.tsx`): `/` or `/home*` → HomePage, `/mv-detail*` → MVDetailPage,
`/song-detail*` → SongDetailPage, `/song-create*` → SongCreatePage, `/components*` →
ComponentsPage (internal style-guide page, not part of the product), anything else → a
plain fallback placeholder. `vercel.json` rewrites all paths to `/index.html` so these
routes survive a hard refresh/deep link on Vercel.

## Coding and naming conventions

- **Components**: PascalCase folder + matching PascalCase filenames
  (`Button/Button.tsx`, `Button/Button.css`). Keep this 1:1 colocation for any new component.
- **CSS classes**: BEM-style, kebab-case, rooted in the component name
  (`.card__play-icon`, `.detail-navbar__back-button`, modifiers like
  `.mobile-tabbar__item--active`). Follow this exactly for new components — it is applied
  with no exceptions across the existing codebase.
- **CSS custom properties**: kebab-case, namespaced by category (see Design Tokens below).
- **Icon assets**: `ic_<name>.svg`, snake_case, monochrome, imported as a URL and applied
  via CSS `mask-image`/`-webkit-mask-image` (not `<img>`) so one asset can be recolored with
  `currentColor` per variant/state. Follow this pattern for any new icon — don't hand-draw
  SVG paths inline, and don't switch to `<img>` just because it's simpler.
- **Data files**: plural camelCase (`songs.ts`, `musicVideos.ts`) exporting
  `SCREAMING_SNAKE_CASE` constants (`SONGS`, `MUSIC_VIDEOS`), built from
  `import.meta.glob` over an asset folder rather than hand-written arrays. Follow this
  pattern if a new catalog of mock content is needed — don't hardcode a parallel list that
  can drift from the actual asset files.
- **Figma provenance comments**: components consistently cite the Figma node they were
  built from in a comment (e.g. `// Figma "List/List Item/dt" (node 1270:21039)`). Keep
  adding these — they're how visual fidelity is traced back to source designs, and the next
  agent/engineer will need them to re-check or extend a screen against Figma.
- Default to **no comments** otherwise, per general good practice — only the Figma
  provenance notes and genuine non-obvious "why" notes are the exception, matching what's
  already in the codebase.

## Existing reusable components (src/components/)

| Component | Purpose |
|---|---|
| Button | Pill CTA button — sizes Large/Medium/Small, variants Primary/PrimaryPayg/Secondary/Tertiary/Ghost, optional icon + credits badge |
| Card | Video/song grid card — Video (3:4 or 4:3) or Song (1:1), community vs. own-content variants, play/pause, favorite, badge |
| Chip | Small selectable pill (Genre/Mood/Vocal pickers on Song Create) |
| DetailNavbar | Sticky detail-page header — back button, credits, optional slotted second row for tabs |
| Footer | Site footer — brand/tagline + Studio/Company link columns (mock links) |
| IconButton | Icon-only button — sizes Large/Medium/Small/XSmall, variants Primary/Secondary/Tertiary/Ghost |
| ListItem | List row for songs — `variant="community"` (avatar/stats/actions) or `variant="song"` (subtitle + chevron, used in My Creations) |
| LoginModal | Mobile bottom-sheet / desktop dialog sign-in mock — Apple/Google buttons, mocked "signed in" success stage, no real auth |
| MobileHeader | Sticky app-style mobile top bar — only rendered when `MOBILE_LAYOUT === 'app'` |
| MobileTabBar | Bottom tab bar (Explore/Create/History) — only rendered when `MOBILE_LAYOUT === 'app'` |
| Navbar | Top marketing navbar — language picker (mock), login trigger |
| RoomNavbar | Simpler navbar for "Feature Room" pages (e.g. Song Create) — title + credit balance only |
| SectionHeader | Section title row — optional "See all" link, separate mobile-abbreviated title text |
| ShareDialog | Share dialog + `shareOrOpenDialog()` helper (prefers native Web Share API when available, falls back to the dialog) |
| Sidebar | Left nav rail — collapses to icon-only below 1024px |
| Tabs | Pill tab-bar switcher — controlled via `active`/`onChange` |
| ToggleSwitch | On/off switch (e.g. the Instrumental toggle on Song Create) |
| TopSongListItem | Song row specific to Song Detail's Top Songs list — larger type scale, own stats layout at ≥1920px |

Before building something new, check this list — CLAUDE.md's rule against over-splitting
components means a new shared component should only be created for UI that's genuinely
repeated across screens, and an existing one should be extended (e.g. via a new `variant`
prop, as `ListItem` already does) rather than duplicated.

## CSS tokens and responsive conventions

All design tokens live in [src/styles/tokens.css](src/styles/tokens.css). **Do not modify
this file unless the user explicitly asks you to.** Categories defined there:

- Primitive brand colors (`--pf-*`, each with alpha variants) and alpha neutrals (`--white-*`, `--black-*`)
- Dark/light neutral scales (`--neutral-dark-*`, `--neutral-light-*`)
- Mobile and web typography scales (`--font-mobile-*`, `--font-web-desktop-*`, `--font-web-mobile-*`)
- A simplified semantic typography set actually used day-to-day (`--font-display`,
  `--font-title-xl/l/m/s/xs`, `--font-body-l/m/s/xs`, `--font-label-m/s`, `--font-caption-m/s`)
  plus matching `--line-height-*` and `.type-*` utility classes
- Theme-aware semantic aliases (`--color-text-primary/secondary/tertiary/disabled`,
  `--color-bg-primary/secondary/tertiary`, `--color-border-primary/secondary`,
  `--color-action-primary/danger/success/warning`)
- Gradients (`--gradient-mv/song/story/shadow`) and matching `.color-gradient-*` classes
- A **"YCM Local Variables" section**, added 2026-07-27 and explicitly commented in-file as
  *not present in the original Figma token export*: `--purple-500`, `--color-accent-purple`,
  spacing scale `--spacing-4` through `--spacing-48`, radius scale `--radius-sm` through
  `--radius-pill`/`-full`, `--blur-glass`, `--opacity-disabled`, `--overlay-hover-dark`.
  These exist because the product's actual gradient/purple/spacing/radius values kept
  showing up in Figma frames with no matching token — prefer these over a new hardcoded
  value, but don't assume every needed value already has a token; check the file first.

Responsive tiers (per CLAUDE.md): **1920 (XL) · 1440 (L, primary design baseline) · 1024
(M) · 768 (S) · 375 (XS) · 320 (minimum supported)**. `src/styles/breakpoints.css` is an
empty reference scaffold listing these six breakpoints — it is not imported anywhere.
Every component instead writes its own `@media` rules inline in its own `.css` file. Follow
that existing pattern rather than introducing a shared breakpoints stylesheet or a
JS-based breakpoint system, unless asked to change the approach.

Rules that must hold at every tier (not just at 1440, the design baseline):
- No horizontal scrollbars
- Text wraps naturally, never truncated by a fixed layout
- Images/video support landscape, portrait, and square source material without stretching
- Layout re-flows (column count, nav treatment, component widths) — never just a scaled-down
  copy of the desktop layout

## Rules for modifying this project

These carry over directly from CLAUDE.md — they are not optional:

1. **Figma is the only source of visual truth.** This is a fidelity/reproduction job, not a
   redesign job. Don't beautify, simplify, "improve," or generalize a design because it
   looks more standard that way. Don't add elements that aren't in the Figma frame. Don't
   change spacing because a different value "looks more correct."
2. **Do not guess.** If a screen, state, or breakpoint isn't covered by a supplied Figma
   frame, list what's unconfirmed and ask — don't invent it and present it as done.
3. **Do not over-engineer.** No new abstractions, no premature component splitting, no
   speculative configuration, no state-management library, no backend/API wiring — ever,
   regardless of how the request is phrased. If a bug fix or small feature doesn't need a
   refactor, don't do one alongside it.
4. **Do not refactor unrelated code.** A change to one screen or component should not
   ripple into unrelated files "while we're in there." Keep diffs scoped to the request.
5. **Preserve existing UI and responsive behavior.** Don't change a working page's layout,
   spacing, or breakpoint behavior as a side effect of an unrelated change. If a shared
   component or token is touched, check the other screens that use it at all six widths
   before considering the change done.
6. **Do not declare a page "done" before the user confirms it.** The expected per-page loop
   is: read the full + partial Figma references → analyze layout/sizing/spacing/type/
   alignment/media ratios → list anything unconfirmed → wait for the user → build the main
   layout first → a second pass corrects sizing/spacing/typography/color/border/radius/image
   handling → compare the result against Figma and list remaining discrepancies → only then
   is it "done," and only the user says so.
7. **Do not create a git commit before the user explicitly confirms it**, and do not push
   unless explicitly asked to push. (In practice this session's history shows large batches
   of work going uncommitted for a while, then committed and pushed together once the user
   said so explicitly — that pattern is fine; committing preemptively is not.)
8. **No new npm packages without explicit prior approval.**
9. **The user is a designer** — fluent in HTML/CSS, a beginner with React/TypeScript/npm/
   Git. After any change, explain in plain terms: which files changed, what each file is
   for, and which on-screen area the changed React code corresponds to.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start the Vite dev server (localhost, default port 5173)
npm run build     # type-check (tsc -b) then production build — this is the real "does it compile" check
npm run preview   # preview the production build locally
npm run lint      # run oxlint
```

There is no test suite in this repository (no test runner configured, no `*.test.*` /
`*.spec.*` files). Verification is: `npm run build` must succeed with no TypeScript errors,
then manually check the affected page(s) in a browser at each of the six responsive widths
listed above, and check the browser console for errors before considering a change verified.
