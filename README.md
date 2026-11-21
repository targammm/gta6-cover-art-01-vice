# Vice Cover Maker

A small, fully offline web app that turns your own photos and a caption into
cover art in the style of a GTA 6 poster: a six-panel collage — one full-bleed
background photo plus five framed windows — under a Vice City sunset or neon
colour grade, with bold poster lettering across the top or bottom.

## Run it

```
node serve.ts
```

then open http://localhost:8080. Or serve the `app/` folder with any static
file server. There is no build step and no network use: photos are read
locally in the browser and never uploaded anywhere.

For the make.fun hand-in, `node main.ts` copies `app/` and `screenshots/`
into the output directory (`/output`, or `$MAKEFUN_OUTPUT_DIR`) and writes
`dossier.json` there.

## Features

- **Six-panel composition** — a full-bleed background plus five framed
  collage windows, with layouts tuned per aspect ratio.
- **Any photo in any panel** — pick from the six bundled Vice City samples or
  upload your own photo per panel (file picker or drag-and-drop onto the
  cover). One photo can fill several panels, or each panel gets its own.
- **Reframe by hand** — per-panel zoom sliders, and drag a panel directly on
  the cover to choose its crop.
- **Poster lettering** — an editable caption in Anton with a thick outline,
  warm gradient fill and soft shadow, plus a letterspaced Archivo Black
  subtitle; caption position (top/bottom) and size are adjustable.
- **Four colour grades** — Sunset, Neon Nights, Dusk and Clean, each a photo
  filter plus a soft-light wash, foot shade and vignette.
- **Full-size PNG export** — 1080 × 1080, 1080 × 1350 and 1920 × 1080,
  rendered from the same canvas composition as the preview.

The six sample photos are original drawings generated for this app, and the
poster fonts are Anton and Archivo Black under the SIL Open Font License 1.1
(see `app/fonts/OFL.txt`).

## License

MIT — see `LICENSE`. A fan-made toy for your own photos; not affiliated with
Rockstar Games or Take-Two Interactive.
