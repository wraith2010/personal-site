# 1031F — Ben Mitchell

The source for [1031f.com](https://1031f.com): a dark-themed personal site and
project archive. Static HTML, CSS, and vanilla JS. No build step, no bundler,
no dependencies.

## Running it

Open `index.html` in a browser. That's it.

The one caveat is the "Copy link" button on project cards: `navigator.clipboard`
needs a secure context, so over `file://` it falls back to `document.execCommand`.
If you want the real path, serve the folder:

```
python -m http.server 8000
```

## Deploying

`.github/workflows/static.yml` publishes the whole repository to GitHub Pages on
every push to `master`. There is no build stage — what is in the repo is what is
served, including `RaceRoomController.java` and `illustrator-files/`.

## Layout

```
├─ index.html              # the bento grid — most content lives here
├─ css/style.css           # the only shared stylesheet
├─ js/main.js              # filter, modal, deep links, lightbox, N-Queens
├─ img/                    # all media, grouped one folder per project
└─ .github/workflows/static.yml
```

### Pages

Sharing `css/style.css`:

| Page | What it is |
|---|---|
| `index.html` | Bento grid of every project. The site. |
| `resume.html` | PDF embed of the resume |
| `journey-to-180.html` | Weight-loss dashboard; photo data in `img/journey-to-180/photos-data.js` |
| `workout-plan.html` | Gym training split |
| `halftone-converter.html` | Halftone Studio — converts an image to an SVG halftone |
| `chess.html` | Playable chess board (React + Babel, compiled in-browser from CDN) |
| `privacy-policy.html`, `terms-of-service.html` | Legal |

Self-contained, own `<style>` block, not styled by `css/style.css`:

| Page | What it is |
|---|---|
| `bandits-bark.html` | Blog written in the voice of a rat terrier |
| `race.html` | Night Circuit — multiplayer race game. See `CLAUDE.md`. |
| `sermon.html` | Sermon candidate evaluation form |

`chess.html`, `race.html`, and `sermon.html` are not linked from anywhere on the
site — they are live but reachable only by direct URL.

## How index.html works

Everything on the homepage is one pattern, so adding a project means copying an
`<article>` and changing the contents.

```html
<article class="bento-card span-1x2" data-category="software" data-id="scribebot"
         tabindex="0" role="button" aria-label="Open Scribebot project">
  <div class="card-visual">          <!-- the tile you see in the grid -->
    <img src="..." loading="lazy">
    <div class="card-overlay">...</div>
  </div>
  <div class="card-detail" hidden>   <!-- cloned into the modal on click -->
    ...
  </div>
</article>
```

- **`data-category`** drives the filter bar. One of `software`, `builds`,
  `random`, `goals`, `venture` — these five names are hardcoded in three places:
  the filter buttons in `index.html`, and `tagClasses` / `tagLabels` in
  `js/main.js`. Adding a sixth means touching all three.
- **`data-id`** is the deep-link slug. `index.html#scribebot` opens that card's
  modal on load, and the modal's "Copy link" button hands out that URL.
- **`.card-detail`** is `hidden` in the grid and its `innerHTML` is cloned into
  the modal when the card is opened. It is ordinary markup — galleries
  (`.detail-gallery`), YouTube embeds (`.detail-video`), link rows
  (`.detail-links`), lists (`.detail-list`).
- **`span-2x2` / `span-1x2`** size the tile in the grid. Cards without a span
  class take one cell.

`.detail-gallery img` gets a click handler wired up at modal-open time and
opens in the lightbox. Escape closes the lightbox first, then the modal.

The `goals` and `venture` categories additionally live inside
`<section class="card-section">` blocks below the grid, which have their own row
layout and hide themselves when the active filter empties them.

## Theming

Every colour, radius, gap, and font is a custom property in the `:root` block at
the top of `css/style.css`. Nothing below that block should hardcode a value.
Retheming the site means editing those tokens.

The five category accents — `--lime`, `--coral`, `--sky`, `--amber`, `--violet` —
map to `software`, `builds`, `random`, `goals`, `venture` in that order, and are
consumed by the `.tag-*` rules.

## Accessibility

Worth preserving:

- Keyboard focus is visible everywhere (`*:focus-visible`).
- `prefers-reduced-motion` is honoured.
- The modal traps Tab, restores focus to the card that opened it on close, and
  is labelled by its title.
- Every image has real alt text.

## Known open items

- **The homepage downloads roughly 180 MB on load.** The `<img>` tags inside
  `.card-detail` have no `loading="lazy"`, and browsers fetch images inside a
  `display:none` subtree anyway. `img/` is over 260 MB of unresized camera
  originals — several are 5760×3840.
- About 21 MB across ~20 images in `img/` are referenced by nothing and still get
  deployed. The workflow uploads `path: '.'`, so unused files ship too.
- No favicon, `robots.txt`, `sitemap.xml`, or `404.html`.
- No `CNAME` file in the repo. The workflow uploads `path: '.'`, so if the
  custom domain is only set in repo settings it can get dropped on deploy.
  Every `og:image` and `og:url` is an absolute `https://1031f.com/…`, so if the
  domain ever drops, link previews break with it.
- `race.html` shares the default portrait card because there is no screenshot of
  the game. A real one would be better.
- `sermon.html` has no sharing tags and is not indexed-or-excluded either way.
- `resume.html` uses a bare `<embed>` for the PDF, which does not render on
  mobile Safari or Chrome for Android — the page is blank there. The PDF is also
  still the 2024 version.
- Closing a project modal pushes a second history entry, so the Back button
  reopens the card you just closed.
- The filter bar is marked up as an ARIA `tablist` with no `tabpanel`s. These
  are toggle buttons; `aria-pressed` would be correct.
- Card titles are `h3` with no `h2` above them.
- `chess.html` loads React *development* builds plus Babel standalone from a CDN
  and compiles JSX on every page view.
- The header and footer navs are hand-copied into each page. They agree today;
  nothing enforces that.
