# PROJECT_CONTEXT.md — YCM UI Prototype

Working notes on *why* the project looks the way it does, not just what's in the repo.
For stack/structure/conventions, see [AGENTS.md](AGENTS.md). For process rules, see
[CLAUDE.md](CLAUDE.md).

## Product background and purpose

YCM (shown in-app as "MUSE" / "YouCam Muse") is a planned AI product for generating music
videos and songs. This repository is **a UI prototype, not the production frontend**. Its
two audiences are:
1. The product owner, reviewing screens and flows directly in a browser (desktop app
   deployed to Vercel for this purpose — see Deployment below).
2. RD engineers, who may copy individual components/CSS out of this repo into the real
   frontend later.

Nothing here talks to a backend. Every song, video, cover, and stat on screen is either a
static mock value or a real local media asset (audio/video/image files committed to
`src/assets/`) wired up to look like generated content.

## Deployment

The repo is pushed to `git@github.com:marukox1105/YCM.git` (`main` branch) and deployed to
Vercel for the product owner to review without needing a local dev environment.
`vercel.json` does a catch-all SPA rewrite to `/index.html` since routing is manual
pathname-matching with no server-side route awareness (see AGENTS.md).

## Pages and features completed

**HomePage** (`/` or `/home`) — landing page:
- Hero banner: auto-rotating video/thumbnail carousel with "Create Music Video" CTA.
  Desktop version has a clickable thumbnail rail that now auto-scrolls to keep the active
  thumbnail in view (fixed 2026-07-29 — see Handoff Log). Mobile has a separate
  fully-custom infinite draggable carousel (fixed 272×153 cards, single clone on each side,
  drag-to-navigate, auto-rotate).
- Tool selector, New Music Videos, Top Picks Songs, New Songs sections.
- Looping colorflow background video — **Home-only**, per an explicit global rule (see
  Design Decisions below); every other page has a plain dark background.

**MVDetailPage** (`/mv-detail`) — "See All Music Videos" page:
- Two sections (Top Picks Music Videos, Newly Released Music Video) drawing from one
  shared catalog (`src/data/musicVideos.ts`), reordered per section.
- Justified-gallery grid layout: rows fully fill available width before wrapping, row
  height flexes within a tuned range rather than every row being a fixed height.
- No "See all" links anywhere on this page — it's the deepest level in this flow.
- Uses the same video/cover catalog as Home's New Music Videos section, so clicking a
  cover on either page corresponds to the same clip.

**SongDetailPage** (`/song-detail`) — song player + lyrics page:
- Now Playing panel (art, transport controls, seekable progress, like/share/lyrics),
  synced lyric-line highlighting, Top Songs list.
- DetailNavbar and the page's Tabs bar are merged into one sticky header box (no visible
  seam between them).

**SongCreatePage** (`/song-create`) — "AI Song — Feature Room", the newest and most
elaborate flow, reachable from Home's "AI Song Composer" card and the Sidebar's "AI Song"
link:
- **Simple** mode: idea textarea + Instrumental toggle + Idea (suggestion) button + char
  count; **Custom** mode: lyrics textarea + Idea/Lyrics generate buttons + Genre/Mood/Vocal
  chip pickers + Song Length slider (instrumental only) + optional Song Title field.
- Both textareas grow an Enhance ("polish this text") button and a Clear (×) button once
  they have a value, matching a specific Figma micro-state (node 1357:30384).
- "Create Song" CTA (disabled until valid input in Simple mode; always enabled in Custom).
- **My Creations** side panel, using the shared `ListItem` component's `variant="song"` —
  this was originally built with the wrong Figma component variant (see Design Decisions).
- **Processing stage**: "Composing Your Song" screen — animated equalizer wave, progress
  bar that now actually reaches 100% (see Handoff Log), rotating status text, "View Later"
  button. My Creations is hidden entirely during this stage and the panel is centered full-
  width (fixed 2026-07-29).
- **Result stage**: a real song is picked from the mock catalog to stand in as "the
  generated song" — real cover, real audio, real (mock) lyrics. Player UI mirrors
  SongDetailPage's Now Playing (art, transport, seekable progress, like/share/lyrics) plus
  two CTAs: "Use in Music Video" (links to `/mv-detail`) and "Recreate" (returns to the
  form). My Creations stays visible on desktop at this stage, hidden on mobile.
- **Lyrics bottom sheet**: mic/lyrics button opens synced, line-highlighted lyrics —
  mobile-native bottom sheet, becomes a centered dialog on desktop (same convention as
  LoginModal), reusing the exact highlight logic already built for SongDetailPage.

**Sign-in (LoginModal component, used globally)**:
- Redesigned to remove email/password entirely — logo, headline, subtitle, Apple/Google
  buttons only (no real OAuth). Mobile uses the exact Figma bottom-sheet frame directly;
  desktop reuses the existing centered-dialog convention (no separate desktop Figma frame
  was supplied for this one).
- A "Signed in successfully!" success stage appears after clicking either provider button,
  auto-closes after ~1.8s.

**ComponentsPage** (`/components`) — internal style-guide/showcase page (Button/Pill, Icon
Button, Card variants). Dev reference only, not part of the product.

## Current implementation status

All five routed pages render and are navigable via the Sidebar and in-page links. Sidebar
active-state highlighting is pathname-based (not hardcoded to Home). `npm run build` (which
runs `tsc -b`) passes clean as of the last commit. No automated tests exist; verification
throughout this project has been manual — browser checks at 1920/1440/1024/768/375/320px
plus console-error checks.

Latest commit on `main`: `470146e` — "Add Song Create Room, rework MV Detail/Home hero,
redesign Sign In flow" (60 files changed). This single commit represents a large amount of
work that had accumulated **uncommitted** across a long session before being pushed all at
once on 2026-07-29 — see the Handoff Log for what shipped in it.

## Important design decisions from this project's history

- **`import.meta.glob` for mock catalogs.** `src/data/songs.ts` and `src/data/musicVideos.ts`
  both auto-discover asset files from folder conventions (`Top Picks Songs/<song>/cover.*` +
  `song.mp3` + `title.json`; `New Music Videos/mv_NN_<slug>.<ext>` cover+video pairs) instead
  of hand-maintained arrays. Adding a new mock song/MV means adding files in the matching
  pattern, not editing the data file.
- **One shared video/cover catalog for MVs across pages.** Home's New Music Videos section
  and MVDetailPage were deliberately pointed at the same `MUSIC_VIDEOS` data source so a
  cover always corresponds to the same clip everywhere it appears — this was an explicit
  user request after the two pages briefly had mismatched sources.
- **Justified-gallery algorithm (MVDetailPage).** Rows pack greedily until the *next* item
  would push row height below a minimum threshold (not until it crosses a maximum) — the
  first implementation had this backwards and left rows under-filled with a visible gap.
  Only the true trailing row is allowed to clamp outside the target height range.
- **`ListItem` gained a `variant` prop instead of a new component.** The Song Create "My
  Creations" list was first built using the *wrong* Figma component variant (a
  Community-style row with stats/actions) instead of the correct Song-type variant
  (subtitle + chevron, no stats). Once caught, the fix extended the existing `ListItem`
  component with `variant="song"` rather than creating a parallel component — consistent
  with CLAUDE.md's "don't over-split components" rule.
- **Global rule: colorflow background is Home-only.** `AppLayout` gained a `showBackground`
  prop (default `false`); only `HomePage` passes `showBackground`. Every other page —
  including the new Song Create Room — has a plain dark background. This was an explicit,
  retroactive rule applied mid-project, not part of any single page's original Figma spec.
- **Global rule: large CTA buttons don't stretch full-width on desktop.** Buttons like
  "Create Song" and the Result screen's two CTAs use `min-width: 230px` + `padding: 0 16px`
  and are centered under their container on desktop (≥1024px); **mobile is explicitly
  unaffected** and keeps the original full-width design. This rule was corrected once
  mid-project (an initial version used `padding: 0 48px` with left-alignment before the
  user asked for the centered/16px version) — if asked to touch any other large button in
  the future, apply this same treatment rather than reinventing it.
- **Hero thumbnail rail: no infinite-scroll illusion.** An earlier implementation rendered
  the thumbnail row three times back-to-back and silently recentered scroll position to
  fake an infinite loop — this had a padding-math bug that could show up as a visible gap
  during the silent recenter jump. It was replaced with a single real copy of the row plus
  a `scrollIntoView` on the active thumbnail whenever selection changes (including the
  wrap from last item back to first). Do not reintroduce the copy-and-recenter trick.
- **Figma access requires the user to re-authorize the MCP connection.** During the Song
  Result build, Figma's Dev Mode MCP was unavailable (needs interactive OAuth via `/mcp`).
  `SongResult`'s layout was built by closely mirroring the already-Figma-verified
  SongDetailPage "Now Playing" component instead of guessing — flagged to the user as
  something to visually double check once Figma access is restored.

## Known issues / unfinished work

- **`SongResult` and its Lyrics sheet have not been re-verified pixel-for-pixel against
  Figma** (nodes 50:84, 881:19546, and desktop reference 1611:23120) — they were built by
  reusing SongDetailPage's already-verified player pattern while Figma access was down.
  This is the single highest-priority thing to check once Figma MCP access is restored.
- **`ComponentsPage`** exists purely as an internal showcase and predates most of the
  conventions used elsewhere (e.g. it may not reflect the latest Button/Card states) — treat
  it as a reference, not a page that needs to stay in lockstep with product pages.
- **`src/styles/breakpoints.css`** is an empty scaffold that is not imported anywhere. It
  exists only as a documented list of the six RWD tiers. Don't assume it does anything.
- **`README.md`** is still the unedited default Vite template — it does not describe this
  project. (This may be intentionally out of scope; AGENTS.md/PROJECT_CONTEXT.md are meant
  to be the actual onboarding docs going forward.)
- No automated tests exist. All verification has been manual browser checks.
- Stray `.DS_Store` files exist in several `src/assets` subfolders (harmless, gitignored,
  but worth a cleanup pass if the next agent wants a tidy diff sometime).

## Recommended next steps

1. Once Figma MCP access is re-authorized, do a pixel-diff pass on `SongResult` /
   `SongResultLyrics` against nodes 50:84 / 881:19546 / 1611:23120, per CLAUDE.md's normal
   "compare against Figma, list discrepancies" workflow.
2. Confirm with the product owner whether `SongCreatePage`'s "Recreate" button and "Use in
   Music Video" link's destinations are the intended long-term behavior, or placeholders.
3. If new pages are added, follow the same catalog pattern as `songs.ts`/`musicVideos.ts`
   (asset-folder convention + `import.meta.glob`) rather than hand-writing new mock arrays.
4. Before adding any new large CTA button, reuse the desktop non-stretch / mobile
   full-width pattern already established (see Design Decisions above) instead of asking
   the user to re-specify it.
5. Keep using Figma node-ID comments in new components — this is how the project traces
   fidelity back to source designs, and it's the fastest way for a new agent to re-verify
   a screen later.

## Handoff Log — 2026-07-29

- Fixed the Home hero desktop thumbnail rail: the active thumbnail could drift completely
  off-screen during auto-rotation because the row never scrolled to follow selection.
  Replaced the old 3x-copy "infinite scroll" illusion (which had a padding-math bug) with a
  single-copy row that scrolls the active thumbnail into view on every selection change,
  including the last-to-first wrap. Scrollbar is now hidden.
- Reworked the Song Create "Processing" stage: the My Creations side panel is no longer
  shown at all while composing (previously shown on desktop); the form panel now expands to
  full width and centers the processing UI in that space instead.
- Standardized large desktop CTA buttons (Create Song; Result screen's "Use in Music Video"
  / "Recreate") to `min-width: 230px`, `padding: 0 16px`, centered under their parent on
  desktop — replacing an earlier `padding: 0 48px` + left-aligned version. Mobile is
  unchanged (still full-width).
- Completed and verified the Song Result player screen and its Lyrics bottom sheet
  (previously in progress) — wired the Processing → Result stage transition, added a real
  song pick from the mock catalog, synced lyric highlighting, and all associated CSS.
  Verified via `tsc -b` and manual browser checks at 1440px and 375px.
- Committed and pushed **all accumulated work from this session** in one commit
  (`470146e`) — this includes the entire Song Create Room feature, the MV Detail justified
  gallery rework, the Sign In redesign (including the success stage), navbar gradient
  background fixes, and the global "background/CTA" rules described above. Nothing from
  this session was committed incrementally; it had all been sitting uncommitted until this
  push, per the user's explicit go-ahead.
- Created this file and [AGENTS.md](AGENTS.md) to hand the project off to a different
  coding agent going forward.
