# 1031f.com — project context

Ben Mitchell's personal site and project archive. Static HTML, CSS, and vanilla
JS. **No build step, no bundler, no dependencies, no package.json.** What is in
the repo is exactly what is served.

`.github/workflows/static.yml` pushes the whole repository to GitHub Pages on
every commit to `master`. There is no build stage to hide a mistake in — a bad
commit is live.

## Layout

```
├─ index.html              # the bento grid — most of the site is this one file
├─ css/style.css           # the only shared stylesheet
├─ js/main.js              # filter, modal, deep links, lightbox, N-Queens
├─ img/                    # all media, one folder per project
├─ race.html               # Night Circuit (self-contained — see below)
├─ RaceRoomController.java # companion backend for race.html, not deployed anywhere
└─ .github/workflows/static.yml
```

Pages styled by `css/style.css`: `index`, `resume`, `journey-to-180`,
`workout-plan`, `halftone-converter`, `chess`, `privacy-policy`,
`terms-of-service`.

Pages that carry their own `<style>` block and share nothing: `bandits-bark`,
`race`, `sermon`. Changing `css/style.css` does not affect them.

`chess.html`, `race.html`, and `sermon.html` are not linked from anywhere. They
are live but reachable only by direct URL. That is the current state, not
necessarily the intent.

## The homepage is a repeating pattern

Adding a project means copying an `<article>`. The structure is load-bearing:

```html
<article class="bento-card span-1x2" data-category="software" data-id="scribebot"
         tabindex="0" role="button" aria-label="Open Scribebot project">
  <div class="card-visual">          <!-- the grid tile -->
    <img src="..." loading="lazy">
    <div class="card-overlay">…</div>
  </div>
  <div class="card-detail" hidden>   <!-- cloned into the modal on click -->
    …
  </div>
</article>
```

`js/main.js` reads this markup and nothing else. It does not own a data model —
**`index.html` is the data model.** There is no JSON of projects to edit.

**The five category names are hardcoded in three places:** the filter buttons in
`index.html`, and `tagClasses` and `tagLabels` in `js/main.js`. A sixth category
means touching all three, plus a `.tag-*` rule and a `:root` accent token in
`css/style.css`. Miss one and the card renders with an unstyled, unlabelled tag.

`data-id` is the deep-link slug — `index.html#scribebot` opens that card. The
modal's "Copy link" button hands out exactly that URL, so **changing a
`data-id` breaks every link anyone has already shared.** Treat them as
permanent.

## The two things that are easy to break

**1. The URL is the source of truth for the modal.** `syncModalToUrl()` reads
`window.location.hash`, looks it up in `cardsById`, and opens or closes the
modal to match. It runs on `popstate` and once on load. Every path that changes
which card is open must go through the URL, not through `openModal` directly —
otherwise the Back button and the share link disagree with the screen.

Note the existing wart: `closeModal` *pushes* a history entry rather than
popping one, so Back reopens the card you just closed. Fixing that is a known
open item; don't add a second mechanism alongside it.

**2. Images inside `.card-detail` are still downloaded.** The block is `hidden`
(`display: none`), but browsers fetch `<img src>` inside a `display:none`
subtree regardless. Only `loading="lazy"` defers them. Today those tags lack it
and the homepage pulls roughly 180 MB on first load. **Any new `<img>` or
`<iframe>` inside a `.card-detail` must carry `loading="lazy"`.**

`img/` is over 260 MB of unresized camera originals — several are 5760×3840, one JPEG
is 23 MB. Resize before adding anything new; do not commit a file straight off a
camera or phone.

## Theming

Every colour, radius, gap, and font is a custom property in the `:root` block at
the top of `css/style.css`. Nothing below that block should hardcode a value.
Retheming the site = editing those tokens.

The five category accents — `--lime`, `--coral`, `--sky`, `--amber`, `--violet` —
map to `software`, `builds`, `random`, `goals`, `venture` in that order.

## Sharing previews

Every page except `sermon.html` carries a `<!-- Social sharing -->` block before
`</head>`: `canonical`, `og:type`, `og:site_name`, `og:url`, `og:title`,
`og:description`, `og:image` (+ `width`, `height`, `alt`), and
`twitter:card="summary_large_image"`.

**New pages must get one.** Copy the block from a page with the same `og:type` —
`article` for writing, `website` for everything else.

Two rules that are easy to get wrong:

- **`og:url` and `og:image` must be absolute** — `https://1031f.com/…`.
  Unfurlers do not resolve relative paths. `og:url` and `canonical` must agree.
- **There are no `twitter:title` / `twitter:description` / `twitter:image`
  tags, deliberately.** X falls back to the `og:` equivalents, so duplicating
  them just doubles what has to stay in sync.

Preview images live in `img/og/`, are exactly 1200×630, and are generated from
existing art rather than hand-cropped. `og-default.jpg` is the fallback for any
page without its own.

Because the deep links are `#hash` fragments, **a shared card can never be
per-project** — the fragment is never sent to the server and unfurlers do not run
`js/main.js`. `index.html#scribebot` unfurls as the site card. Per-card previews
would need real per-card URLs (a page each, or a prerender step), which would end
the no-build-step property.

Unfurl caches are sticky. After changing a tag, re-scrape via Facebook's Sharing
Debugger or LinkedIn's Post Inspector; Slack re-fetches on its own but takes a
while, and appending `?v=2` forces a fresh card for a test.

## Night Circuit (`race.html`)

Multiplayer race game. One host opens a room, everyone else joins with a
four-letter code from their own device, host drops the lights, cars run, random
winner gets a celebration. Self-contained single file by deliberate choice — if
that stops being true, it should be a decision, not a drift.

**The sync seam.** All multiplayer goes through one adapter interface:

```
createRoom(code)
getRoom(code)  -> { meta, cars: [...], state } | null
putCar(code, car)
clearCars(code)
putState(code, state)
```

Three drivers implement it — `LocalNet` (localStorage + BroadcastChannel,
same-browser only), `RestNet` (needs `CONFIG.apiBase`), `ArtifactNet` (Claude
artifact storage). Driver is auto-selected at load; the header pill shows which.
Anything new (WebSocket, SSE, Firebase) implements these five methods and
nothing else in the app changes. Do not let game logic reach past this seam and
touch `fetch` or `localStorage` directly.

`CONFIG.apiBase` is currently `''`, so the deployed page runs LocalNet and
cross-device play does not work. `RaceRoomController.java` is the drop-in Spring
Boot implementation, but it is not deployed — it just sits in the repo (and
therefore gets served as a static file).

**The race is deterministic, not simulated.** When the host hits Lights out, it
rolls `finishTime`, `amp`, `waves`, `phase` per car **once**, writes them into
shared state, and every client integrates the identical pace curve
(`buildCurve` / `progressAt`) from a shared `startAt` timestamp. That's why all
screens show the same overtakes and the same winner with no server tick.

If you ever call `Math.random()` inside the animation loop, or recompute the
grid client-side, the screens desync. The randomness lives in `startRace()` only.

`progressAt` integrates a strictly-positive speed function so progress never
reverses — cars must not appear to drive backwards. Keep `amp < 1`.

Car colours are the `LIVERIES` array — eight entries, one per lane, and eight is
the hard cap because that's how many lanes fit the track geometry. The lane paths
are stadium shapes whose start point is always `x = 300` regardless of inset,
which is why the start/finish line can be a straight vertical bar. Don't change
`stadium()` without rechecking that.

Race-specific open items:

- Four-letter room codes are guessable. Public deploy wants a rate limit on
  `PUT /rooms/{code}` or codes get squatted.
- Polling is 1.8s, so joiners take a beat to show on the host's grid.
  WebSocket/STOMP would fix it and fits the existing adapter shape.
- `startAt` is wall-clock, so a device with a badly wrong clock races desynced.
  Serving a time offset from the backend would harden it.
- Rooms are in-memory with a 6h sweep. Restart drops live races. Fine for now.
- CORS in the controller is pinned to 1031f.com.

## Site-wide open items

- About 21 MB across ~20 images in `img/` are referenced by nothing and still get
  deployed, since the workflow uploads `path: '.'`.
- No favicon, `robots.txt`, `sitemap.xml`, or `404.html`.
- No `CNAME` in the repo. The workflow uploads `path: '.'`, so a custom domain
  set only in repo settings can get dropped on deploy. Link previews now depend
  on that domain resolving (see below), so this got sharper.
- `race.html` falls back to the default portrait card; a real screenshot of the
  game would be better.
- `sermon.html` is the one page with no sharing tags — it is an unlinked church
  form, so it is neither previewed nor explicitly excluded from search.
- `resume.html` uses a bare `<embed>` for the PDF — blank on mobile Safari and
  Chrome for Android. The PDF is still the 2024 version.
- The filter bar is an ARIA `tablist` with no `tabpanel`s. These are toggle
  buttons; `aria-pressed` would be correct.
- Card titles are `h3` with no `h2` above them.
- `chess.html` loads React *development* builds plus Babel standalone from a CDN
  and compiles JSX in the browser on every page view.
- Header and footer navs are hand-copied into every page. They agree today;
  nothing enforces that.

## Conventions

- Copy is sentence case, active voice, no exclamation marks. Buttons name the
  thing that happens ("Lights out", "Run it again").
- Reduced motion is respected; keyboard focus is visible. Keep it that way.
- Every image gets real alt text.
- Files are CRLF in the working tree, LF in the repo (`core.autocrlf=true`).
  `index.html` and `resume.html` have no trailing newline. Scripted edits that
  rewrite line endings produce enormous, unreviewable diffs — check `git diff
  --stat` after any `sed -i` or `awk` pass.
