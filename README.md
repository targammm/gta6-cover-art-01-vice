[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/targammm/gta6-cover-art-01-vice/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/targammm/gta6-cover-art-01-vice/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Cover Maker

Vice Cover Maker is a little cover-art studio that runs entirely in your
browser. Drop in a handful of photos, type a headline, and it arranges
everything into a poster modelled on GTA 6's key art: a grid of framed
panels over one big backdrop shot, washed in a Vice City sunset or neon
grade and finished with heavy display lettering. Nothing is installed,
nothing is uploaded — the whole thing is plain static files and your
pictures never leave the machine.

Entered in the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun.

## Features

- **Six-panel collage** — one full-bleed background image behind five
  framed windows, with the grid reshaped to suit each export ratio.
- **Frame every panel by hand** — each window has its own zoom control,
  and you can drag a panel around on the canvas to pick the exact crop.
- **Your photos or ours** — fill panels from the six bundled Vice City
  sample pictures, or bring your own through the file picker or by
  dropping files straight onto the cover. Mix and match freely: one
  photo everywhere, or a different one in every frame.
- **Anton poster lettering** — your caption is set in Anton with a chunky
  outline, gradient fill and drop shadow, backed by a letterspaced
  Archivo Black subtitle; move it between the top and bottom of the
  cover and scale it to taste.
- **Four colour grades** — Sunset, Neon Nights, Dusk and Clean, each
  pairing a photo filter with a soft-light wash, a shade along the foot
  of the cover and a gentle vignette.
- **PNG export in three post sizes** — download the finished cover at
  1080 × 1080, 1080 × 1350 or 1920 × 1080, rendered from the same canvas
  you preview.
- **Fully offline** — no build step, no server calls, no tracking; open
  it once and it works with the network cable pulled.

## Run it

Start the bundled local server from the repository root:

```
node serve.ts
```

then open http://localhost:8080 in a browser. Any static file server
pointed at the `app/` folder does the same job.

The entry program is `main.ts`. Running

```
MAKEFUN_OUTPUT_DIR=out node main.ts
```

copies `app/` and `screenshots/` into the output directory (`out` in
this example, `/output` when the variable is not set) and writes a
`dossier.json` there describing the entry — that folder is the package
handed in for judging.

## License

The code is released under the MIT License — see `LICENSE` in this
repository.

The bundled fonts, Anton and Archivo Black, are licensed separately
under the SIL Open Font License 1.1; the full text ships with them in
`app/fonts/OFL.txt`. The six sample pictures are original artwork drawn
for this project.

A fan-made toy for your own photos — not affiliated with Rockstar Games
or Take-Two Interactive.
