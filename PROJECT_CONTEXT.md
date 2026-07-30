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
Button, Card variants, and now a `ListItem` showcase — see below). Dev reference only, not
part of the product.

**AI Music Video flow** (new since the last handoff) — reachable from Home's "Create Music
Video" CTA and the Sidebar's "AI Music Video" link (previously `href="#"`, now wired to
`/mv-create`):
- **MVCreatePage** (`/mv-create`) — "AI MV — Feature Room": MV type selector (Singing/
  Storytelling/Hybrid, real preview clips from `src/assets/create-mv/type/`, static by
  default and playing only on desktop hover / mobile press — never more than one at once),
  Choose a Song (Song Library sheet with My Songs/Sample Songs tabs, real audio preview
  playback with a live play/pause icon per row, Import Audio), a video-idea textarea with
  Templates/Idea buttons and an Enhance button, character photo upload (Primary/Tertiary
  Active circular add buttons, an uploaded-photo state with delete + editable name), a
  Settings sheet (aspect/quality with icons, MV title/author, Subtitle/Watermark toggles —
  Watermark is now a real, operable toggle, not a locked upsell placeholder), and a "How
  would you like to create?" mode-choice sheet (Storyboard-first vs. Direct).
- **MVStoryboardPage** (`/mv-storyboard`) — opens on a ~3s mock "Crafting Your Storyboard"
  processing screen (progress %, ETA, "View Later"), then reveals the editable storyboard:
  read-only Visual Style/Story cards, 4 editable Scene textareas (char count + Enhance),
  Character Image, MV Song preview, synced Lyrics.
  - **MVResultPage** (`/mv-result`) — single component that switches between a portrait and
  landscape layout depending on the draft's aspect setting; "Edit MV" quick action.
- **MVEditPage** (`/mv-edit`) — 7-clip storyboard strip + scrubbable preview player, Scene
  editor, Cover Image + prompt + Recreate, MV Title/Author Name, Subtitle/Watermark toggles,
  Delete Project/Merge MV.
- A new **Trim Audio** step now sits between picking a song and it actually being applied:
  clicking "Use" on a song row opens a Trim Audio sheet (real audio duration, a decorative-
  but-draggable waveform with two trim handles) — confirming there is what actually commits
  the song choice. No real audio trimming happens (mock UI only, per project scope).
- A new **Select a Template** sheet opens from the video-idea textarea's "Templates" button:
  5 named style templates (J-Pop, Midnight Static, Paper Wonderland, Pastel Film, Alice in
  Wonderland), each previewed with its actual video (not a static image) at its real
  portrait/landscape ratio; picking one + confirming fills the idea textarea with that
  template's description.
- A new shared **`useEnhance` hook** (`src/hooks/useEnhance.ts`) drives every "Enhance"
  button across the whole app (MV Create's idea box, Song Create's idea/lyrics boxes,
  Storyboard's 4 scene boxes, Edit MV's 2 prompt boxes): clicking it dims/disables the rest
  of that input box, spins the icon (ic_refresh, counter-clockwise) for ~1s, then swaps in
  new text.
- **`ListItem` was substantially rebuilt** this pass (see Design Decisions) — its Community
  variant now has a real narrow/wide container-query layout, Song variant has correct
  album-art sizing, and both variants share one borderless, hover-highlighted treatment
  instead of Community having its own extra card border.
- **Desktop popup convention changed globally** for every sheet on the AI Music Video page
  (see Design Decisions) — close (X) moved to the top-right and a bottom Cancel/Confirm
  button row replaced the header checkmark, on desktop only. Mobile is unchanged.

## Current implementation status

All routed pages (Home, MV Detail, Song Detail, Song Create, the 4 new AI Music Video
pages, Components) render and are navigable via the Sidebar and in-page links. Sidebar
active-state highlighting is pathname-based (not hardcoded to Home). `npm run build` (which
runs `tsc -b` then a production Vite build) passes clean as of this handoff. No automated
tests exist; verification throughout this project has been manual — browser checks at
1920/1440/1024/768/375/320px plus console-error checks (this pass's UI-heavy work was
spot-checked mainly at 1440px/375px via direct DOM/JS assertions, since the browser
screenshot tool was unreliable for parts of this session — see Known issues).

Latest commit on `main` before this handoff: `33f47ee` — "Add AGENTS.md and
PROJECT_CONTEXT.md for agent handoff". This handoff's own commit (see the log below) adds
the entire AI Music Video flow described above on top of that.

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
- **Desktop popup convention (new, this pass).** Every sheet on the AI Music Video page
  (Settings, Choose Song, Select a Template, Trim Audio, Mode Choice) shares one `.mv-sheet`
  shell. Figma's own desktop "Popup Dialog" component (node 1641:31755) put the close (X)
  button top-right with a Cancel/Confirm button row at the bottom, whereas its mobile bottom
  sheets put X top-left with a checkmark top-right and no bottom row — those are two
  genuinely different header conventions per device, not the same design scaled down. This
  is implemented with a single `@media (min-width: 768px)` block that reorders the existing
  header children via CSS `order` (no JSX duplication) and reveals a `.mv-sheet__footer` row
  that's `display: none` by default. Sheets whose content has no real "confirm a pending
  choice" step (Choose Song, Mode Choice) only get the X repositioned — no footer was added
  to them, since Figma's own reference for those doesn't show one either.
- **Template/song "Use" flow needed extra steps that weren't there before.** Two flows that
  used to be a single click were both split into an extra intermediate sheet once the
  correct Figma frames were checked: picking a song's "Use" now opens Trim Audio before the
  song is actually applied; the Templates button now opens a picker sheet instead of
  directly inserting random suggestion text. Both follow the same "select in a
  presentational sheet, confirm to commit" shape as the rest of this page.
- **`useEnhance` hook extracted once several pages needed the identical "processing" state**
  (dim the input, spin the Enhance icon ~1s, then swap the text) — added to
  `src/hooks/useEnhance.ts` and reused by MV Create, Song Create, MV Storyboard, and MV Edit
  rather than reimplementing the same timer/disabled-state logic four times.

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
- **`src/assets/covers/Ｘ/` (fullwidth-X folder name) exists on disk, untracked, and must
  stay that way.** It's a set of ~29 duplicate/orphaned cover PNGs (the same
  `album_*.png`/`mv_*.png` files already live, correctly, under `covers/New Music Videos/`
  and are the only copies actually referenced via `import.meta.glob`) that the product owner
  moved into this folder themselves as a manual "trash" step — they are **not** ready to be
  deleted from the repo yet. Do not `git add` this folder, do not delete it, and do not
  restore/duplicate these files elsewhere without the user's explicit go-ahead.
- **Trim Audio doesn't actually trim anything.** The sheet has a real audio duration, a
  real draggable two-handle selection over a (decorative, Figma-sourced) waveform, and
  Confirm really does commit the song choice — but no audio processing happens; this is
  visual/interaction fidelity only, consistent with the rest of the app's mock-data scope.
- **MV Result / Storyboard / Edit MV were built once each, not yet re-verified against a
  fresh Figma pull in this same pass** the way MV Create's individual pieces were (Storyboard
  Processing, Templates sheet, Trim Audio, and the desktop popup convention were all built
  from freshly-fetched Figma nodes and spot-checked in-browser this pass) — if the product
  owner has newer Figma frames for Result/Edit MV specifically, treat those two pages as due
  for a fresh comparison pass.
- **`HeroBannerSection.css` has an uncommitted-turned-committed padding fix** (moving
  horizontal padding from the outer `.hero-banner` container onto `.hero-banner__top` and
  `.hero-banner__thumbnails` individually, so the thumbnail rail's own padding scrolls as
  part of its content instead of being a fixed offset) that predates this pass's own session
  record — it type-checked and was included in this handoff's commit, but hasn't been
  re-eyeballed at all six widths within this specific pass. Worth a quick visual check on
  Home's hero thumbnail rail if anything there looks off.
- Screenshot-based visual verification was flaky for part of this session (the Browser
  pane's screenshot tool intermittently rendered at the wrong scale/crop). Where that
  happened, verification fell back to direct DOM/computed-style assertions via JS instead of
  screenshots — functionally reliable, but means less has been eyeballed visually this pass
  than usual. Worth a plain visual pass over the new AI Music Video pages before calling them
  fully done.

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
6. Do a plain visual (not just DOM-assertion) pass over MV Create/Storyboard/Result/Edit at
   all six widths — this pass leaned more than usual on JS/DOM checks instead of screenshots
   (see Known issues), so a fresh pair of eyes on the actual rendered pages is worthwhile.
7. Ask the product owner before touching or clearing `src/assets/covers/Ｘ/` — it's their
   own in-progress cleanup, not the agent's to resolve.
8. If newer Figma frames exist for MV Result / MV Edit specifically, treat them as not yet
   re-verified in this pass (unlike MV Create's sub-flows, which were freshly re-checked).

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

## Handoff Log — 2026-07-30

- Built the entire **AI Music Video flow**: `MVCreatePage` (`/mv-create`), `MVStoryboardPage`
  (`/mv-storyboard`, including a new ~3s mock Processing stage), `MVResultPage`
  (`/mv-result`), and `MVEditPage` (`/mv-edit`), wired into `src/App.tsx` and the Sidebar's
  "AI Music Video" link (previously `href="#"`).
- Rebuilt the shared **`ListItem`** component (Community narrow/wide container-query
  layout, correct Song-variant album-art sizing, unified borderless hover treatment) and
  added a `ListItemShowcase` to `/components` demonstrating it in isolation before it was
  applied to real pages.
- Added a shared **`useEnhance` hook** (`src/hooks/useEnhance.ts`) and switched every
  "Enhance" button in the app (MV Create, Song Create ×2, MV Storyboard ×4, MV Edit ×2) over
  to it, fixing the spin direction (now counter-clockwise, matching the icon) and the
  button's color (purple background / white icon, matching Figma — it had been white
  background / black icon).
- Replaced MV Create's 3 style-type videos with real clips (default static, plays only on
  desktop hover / mobile press, never more than one at once) and removed the description
  text under them per feedback.
- Fixed MV Create's Settings sheet: added missing icons to the Aspect Ratio/Quality
  options, made Show Watermark a real operable toggle instead of a locked placeholder, and
  made the collapsed Settings summary's chips dim/brighten based on whether their field is
  actually filled in/on, not a hardcoded "locked" state.
- Rebuilt MV Create's Upload Character Photo buttons to the correct Primary/Tertiary Active
  circular styles (previously a plain Ghost icon) and rebuilt the uploaded-photo state to
  match Figma: delete (X) top-right, an editable name field + edit pencil bottom row.
- Added a **Select a Template** sheet (previously the Templates button just inserted random
  text directly) — 5 named templates, each previewed with its real video at its real
  portrait/landscape ratio rather than a static cropped image.
- Added real audio interaction to the Choose Song sheet: clicking a row plays/pauses that
  song's audio via a single shared `<audio>` element, with the thumbnail's icon reflecting
  play/pause state live; added My Songs/Sample Songs tabs; the "Use" pill on each row now
  only appears once that row is active (desktop hover, mobile tap) instead of always.
- Added a new **Trim Audio** sheet between picking a song and it being applied: real audio
  duration, a draggable two-handle waveform selection (Figma's own mock waveform data,
  reused verbatim), Confirm is what actually commits the song choice.
- Changed the **desktop popup convention for every sheet on this page** to match Figma's
  dedicated desktop dialog component (node 1641:31755): close (X) moved from top-left to
  top-right, and a bottom Cancel/Confirm button row replaced the header checkmark — desktop
  only; mobile's original X-left/checkmark-right bottom-sheet header is untouched.
- Restored ~29 cover PNG files under `src/assets/covers/` that had been deleted in the
  working tree (moved into an untracked `Ｘ/` folder by the product owner as their own
  in-progress manual cleanup) — **do not delete or re-stage those deletions**; see Known
  issues above. Confirmed via `grep` that nothing in `src/data/*.ts` references the
  top-level copies (only the `New Music Videos`/`Top Picks Songs` subfolder copies are used).
- Verified via `tsc -b` + a full `npm run build` (production build, no errors) plus a mix of
  in-browser manual checks and direct DOM/computed-style JS assertions (screenshots were
  intermittently unreliable this session — see Known issues) at 1440px and 375px.
- This handoff's commit stages only the AI Music Video feature work, the `ListItem`/
  `useEnhance` refactors, the Sidebar/App.tsx routing changes, and this documentation
  update — it deliberately excludes the cover-image deletions (restored, not staged) and
  does not touch the untracked `Ｘ/` folder.
