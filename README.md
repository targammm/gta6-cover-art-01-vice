# Vice Cover Maker v2

A GTA-style cover art maker: turn photos and a caption into a six-panel
Vice City sunset poster, exported as a PNG to share. Open `app/index.html`
in desktop Chrome — the app is plain static files, works with no network,
and never uploads your photos.

## The cover

- **Six panels, six different photos** — one large hero panel plus five
  smaller ones in a mosaic, each with its own photo, crop and zoom.
- **Sunset halftone grade** — a pink-orange-purple sunset tint, halftone dots
  and film grain over every panel, with Neon and Midnight grades one tap away.
- **Bold caption lettering** — a big Anton caption across a gradient band,
  a letter-spaced sub-caption, and a circular `EST. 2026 • LEONIDA` badge.
- **Three post sizes** — `1080 × 1080`, `1080 × 1350` and `1920 × 1080`,
  exported as PNG at full resolution.

## How to use it

1. Pick a panel in the strip (or click it on the preview), then choose a
   sample photo, upload your own photo, or fill all six panels with one
   photo.
2. Crop the selected panel with the Zoom / Move X / Move Y sliders.
3. Type the caption, sub-caption and badge text; pick a grade and a size.
4. Press **Export PNG** — the cover downloads at the size you picked.

Shuffle re-deals the six sample photos across the panels for a fresh cover.
Clicking a panel on the preview selects it for cropping.

## Files

- `app/index.html` — the page; `app/style.css` — the dark Vice theme.
- `app/src/config.js` — sizes, samples, grades, panel layouts.
- `app/src/state.js` — the cover state (panels, caption, grade, size).
- `app/src/cover.js` — the renderer: mosaic, halftone, caption band, badge.
- `app/src/editor.js` — panel strip, sliders, upload, grade/size pickers.
- `app/src/main.js` — page wiring, export, screenshot scenes.
- `app/src/shots.js` — the four fixed `?shot=` scenes for screenshots.
- `app/samples/` — six photos: `skyline`, `convertible`, `lifeguard`,
  `boulevard`, `pier`, `marina`.
- `app/fonts/` — Anton and Archivo Black under the SIL Open Font License.
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes
  `dossier.json` with the vendored make.fun library.

## Screenshots

`screenshots/` holds four JPEGs, all rendered by the app itself:

1. `1-cover.jpg` — the exported square cover (1080 × 1080).
2. `2-editor.jpg` — the editor with photos loaded (1280 × 720).
3. `3-cover-portrait.jpg` — the exported portrait cover (1080 × 1350).
4. `4-sizes.jpg` — the three export sizes side by side (1280 × 720).

`shots.json` lists the `?shot=` scene behind each screenshot; serving the
app with `node serve.ts` and opening those URLs reproduces them.

## Photos and fonts

- The `boulevard` and `pier` samples are the kit starter photos. The
  `skyline`, `convertible`, `lifeguard` and `marina` photos were made for
  this entry with an image model and are free to use — no real person, no
  Rockstar artwork, no game asset.
- Fonts are Anton and Archivo Black, both under the SIL Open Font License
  (see `app/fonts/OFL.txt`). Nothing in this app is a Rockstar Games logo,
  wordmark, official artwork, character or font.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Hand the entry in (outside the grader, `MAKEFUN_OUTPUT_DIR` stands in for
`/output`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Running `main.ts` twice into two directories produces byte-identical output.
