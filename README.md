# Vice Cover Maker v2.1

A six-panel sunset cover maker for the make.fun "Make GTA 6 Cover Art"
competition. Pick a photo for each of six panels, set a bold caption, pick
a grade and an export size, and download a PNG — all offline, in the
browser. No photo ever leaves your machine.

## What it makes

A cover built from six different photos: one large hero panel, two stacked
panels on the right, and three panels across the bottom. A sunset wash,
halftone dots, fine grain and a neon outline grade the whole cover. The
hero carries a bold caption (default `VICE CITY`) and sub-caption
(`A SUNSET STORY`), a circular `EST. 2026 • LEONIDA` badge, and a
`6 PANELS • 3 SIZES` pill.

## Features

- Six photo panels, each with its own photo, zoom and crop offset.
- Six built-in sample photos (Vice City style, made with an image model),
  plus upload-your-own-photo per panel (read locally with FileReader).
- Caption and sub-caption editing, three grades (Sunset, Neon, Midnight).
- Fill-all, shuffle and per-panel reset.
- Export PNG at 1080 × 1080, 1080 × 1350 or 1920 × 1080.

## How to use

Serve the app and open it in a desktop browser:

```
node serve.ts
# open http://localhost:8080
```

1. Click a panel thumbnail under the preview to select that panel.
2. Pick its photo from the dropdown, or upload your own.
3. Crop with the zoom and offset sliders.
4. Type a caption and sub-caption, pick a grade and an export size.
5. Press **Export PNG** — the file downloads at the chosen size.

## Screenshots

`shots.json` lists the four screenshots (the first by name is the cover):
`1-cover.jpg` is the exported square cover, `2-editor.jpg` the editor,
`3-cover-portrait.jpg` the portrait cover, `4-sizes.jpg` the three sizes.

## Fonts and licence

- Anton and Archivo Black, under the SIL Open Font License 1.1 — see
  `app/fonts/OFL.txt`. Both font files live under `app/fonts/`.
- Sample photos were made with an image model for this entry and are free
  to use. The app works fully offline: no network request is made.

## Build

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to `/output` and writes `/output/dossier.json`. Run it twice to check the
output is byte-identical:

```
MAKEFUN_OUTPUT_DIR=out node main.ts
MAKEFUN_OUTPUT_DIR=out2 node main.ts
diff -r out out2
```
