# Vice Cover Maker

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/targammm/gta6-cover-art-01-vice/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/targammm/gta6-cover-art-01-vice/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

A six-panel cover studio in the browser. Drop in your own photos, pick a
grade, and export a sunset-drenched, Leonida-style game cover at full
resolution — no uploads, no server, no build step.

## Features

- **Six-panel layout** — a big hero panel, two stacked panels and a
  three-panel strip, on a deep plum field with thin gutters.
- **Any photo, every panel** — six bundled Vice City-mood samples, plus
  per-panel upload of your own photos (read locally with FileReader;
  nothing ever leaves the page).
- **Per-panel crop control** — zoom from 0.8× to 2.5× and X/Y offsets
  per panel, with a clickable thumbnail strip to pick the panel you are
  editing.
- **Four colour grades** — Sunset, Neon, Midnight and Palm, each a wash,
  accent, halftone ink and caption glow mixed over the whole cover.
- **Full cover dressing** — auto-fit gradient caption in Anton, a
  letterspaced sub-caption, an EST. 2026 / LEONIDA badge, role chips on
  every panel (HERO, CHASE, HEIST, VICE, CREW, GETAWAY), a deterministic
  barcode with microtext, halftone dots, seeded grain and a vignette.
- **Three export sizes** — PNG at 1080×1080, 1080×1350 and 1920×1080,
  rendered deterministically: the same state always paints the same
  cover, byte for byte.
- **Fill all, shuffle, reset** — one click to restock every panel.

## How to run

You need Node 22 or newer. From the repository root:

```
node serve.ts
```

Then open http://localhost:8080 in a browser. The app is fully static
and works offline once loaded; there is nothing to install and nothing
to build.

To package the entry the way the make.fun scorer sees it:

```
MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into the output directory and
writes its `dossier.json` with the vendored `buildDossier`.

## Screenshots

- `screenshots/1-cover.jpg` — the wide cover, straight from the renderer.
- `screenshots/2-editor.jpg` — the editor page with a live cover.
- `screenshots/3-cover-portrait.jpg` — the portrait cover.
- `screenshots/4-sizes.jpg` — all three export sizes side by side.

Each was captured from the app's own `?shot=` modes (see `shots.json`).

## Fonts and licence

The app code is MIT-licensed (see `LICENSE`). The two display fonts are
vendored under `app/fonts/` and are **not** MIT: Anton by Vernon Adams
and Archivo Black by Omnibus-Type are licensed under the SIL Open Font
License 1.1, whose full text sits beside them in `app/fonts/OFL.txt`.
The sample photos were generated for this entry.

## Build notes

- Plain ES modules under `app/src/` (`config`, `state`, `cover`,
  `editor`, `shots`, `main`) — no framework, no bundler, no network.
- Rendering is deterministic: grain, barcode and shuffle all draw from
  seeded streams, never from `Math.random` or the clock.
- Round 2 rebuild: the whole entry was re-authored in a fresh recorded
  session for the make.fun gta6-cover-art-01 competition.

---

Entered on [make.fun](https://make.fun/?ref=c5ppnbr2) — Vice Cover Maker,
for the gta6-cover-art-01 bounty.
