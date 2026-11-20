# Vice Cover Maker

[![make.fun — gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/targammm/gta6-cover-art-01-vice/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/targammm/gta6-cover-art-01-vice/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Vice Cover Maker turns your photos into a GTA-style six-panel cover poster.
One big hero panel, two stacked panels at the top-right and three along the
bottom — each with its own photo, crop and role label (HERO, CHASE, HEIST,
VICE, CREW, GETAWAY) — finished with a colour grade, halftone dots, film
grain, a gold EST. 2026 • LEONIDA seal, a barcode, and a giant gradient
caption in Anton. Export a PNG at 1080 × 1080, 1080 × 1350 or 1920 × 1080.

## Features

- Six photo panels, each independently cropped with zoom and X/Y offsets.
- Six built-in Vice City sample photos, plus upload-your-own per panel —
  photos are read locally and never leave your machine.
- Four whole-cover grades: Sunset, Neon, Midnight and Palm.
- Editable caption and sub-caption, auto-fitted to the hero panel.
- Fill-all, shuffle and per-panel reset; live preview on every change.
- One-click PNG export in the three common post sizes.
- Fully static and offline: no build step, no network requests at runtime.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. Pick a panel from the
thumbnail strip, choose or upload its photo, steer the crop with the
sliders, set your caption, and press **Export PNG**.

## Screenshots

- `screenshots/1-cover.jpg` — the exported wide cover (1920 × 1080 design),
  showing all six panels, the gradient caption, seal, pill and barcode.
- `screenshots/2-editor.jpg` — the editor with the samples loaded.
- `screenshots/3-cover-portrait.jpg` — the portrait cover (1080 × 1350 design).
- `screenshots/4-sizes.jpg` — one cover at all three export sizes.

The screenshots are the app itself, captured from its own `?shot=` scenes
listed in `shots.json`.

## Fonts and licence

The app ships two fonts under `app/fonts/`, both under the SIL Open Font
License 1.1 (full text in `app/fonts/OFL.txt`): **Anton** by Vernon Adams
and **Archivo Black** by Omnibus-Type. The built-in sample photos were made
with an image model for this entry and are free to use. The code in this
repository is released under the MIT License (see `LICENSE`).

## Build

`main.ts` (Node 22, standard library only) hands the entry in: it copies
`app/` and `screenshots/` into the output directory (`MAKEFUN_OUTPUT_DIR`,
default `/output`) and writes `dossier.json` there with the kit's
`buildDossier` from `vendor/makefun-app.ts`. The renderer is deterministic,
so two runs of the program produce byte-identical output.

---

Entered on [make.fun](https://make.fun/?ref=c5ppnbr2) for the
“Make GTA 6 Cover Art” bounty.
