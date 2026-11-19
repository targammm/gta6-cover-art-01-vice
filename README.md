# gta6-cover-art-01-vice

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/targammm/gta6-cover-art-01-vice/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/targammm/gta6-cover-art-01-vice/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover Maker — turn your photos into multi-panel GTA-style cover art: pick a layout (Vice Trio, Split Duo, Neon Quad, Full Bleed), drop a photo into each panel, drag to pan, scroll to zoom, write a bold caption, pick a sunset or neon grade, and export a PNG in 1080×1080, 1080×1350 or 1920×1080. Fully offline — photos never leave your machine.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Upload photos per panel (or use the two bundled samples), choose a layout, grade and size, and hit **Export PNG**.

## How it is built

- `app/index.html` + `app/style.css` — the editor shell (dark booth, neon accents).
- `app/src/config.js` — layouts, grades, sizes, palette, defaults (all tuning in one place).
- `app/src/state.js` — the single store every control and the renderer share.
- `app/src/cover.js` — the canvas renderer: panels, grade wash, bold caption lettering, grain/vignette/halftone finish, PNG export.
- `app/src/editor.js` — controls, per-panel upload, drag-to-pan and scroll-to-zoom.
- `app/src/shots.js` — deterministic `?shot=` presets for the screenshots.
- `app/src/main.js` — bootstrap and the live preview loop.
- `app/fonts/` — Anton and Archivo Black under the SIL Open Font License.
- `main.ts` — hands `app/` + `screenshots/` in via the vendored `buildDossier`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
