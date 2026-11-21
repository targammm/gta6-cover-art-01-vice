// Vice Cover Maker — shared configuration.
// Canvas sizes, colour grades and panel layouts live here so the renderer
// (cover.js) and the editor (editor.js) never hard-code a number twice.

export const SIZES = [
  { id: 'square', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: 'landscape', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
];

export function sizeById(id) {
  return SIZES.find((s) => s.id === id) || SIZES[0];
}

// A grade is a photo filter plus a three-stop light wash laid over the whole
// cover, a shade strength for the foot of the poster and a vignette weight.
export const GRADES = [
  {
    id: 'sunset', label: 'Sunset',
    filter: 'saturate(1.28) contrast(1.08) brightness(1.03)',
    wash: ['rgba(255, 94, 98, 0.55)', 'rgba(255, 176, 102, 0.12)', 'rgba(64, 16, 96, 0.55)'],
    shade: 0.34, vignette: 0.30,
  },
  {
    id: 'neon', label: 'Neon Nights',
    filter: 'saturate(1.55) contrast(1.16) brightness(1.0) hue-rotate(-10deg)',
    wash: ['rgba(255, 0, 128, 0.40)', 'rgba(0, 60, 120, 0.10)', 'rgba(0, 229, 255, 0.38)'],
    shade: 0.42, vignette: 0.38,
  },
  {
    id: 'dusk', label: 'Dusk',
    filter: 'saturate(0.88) contrast(1.12) brightness(0.93)',
    wash: ['rgba(40, 60, 140, 0.45)', 'rgba(90, 40, 120, 0.12)', 'rgba(8, 8, 32, 0.60)'],
    shade: 0.46, vignette: 0.44,
  },
  {
    id: 'clean', label: 'Clean',
    filter: 'saturate(1.06) contrast(1.03) brightness(1.01)',
    wash: ['rgba(255, 255, 255, 0.10)', 'rgba(255, 255, 255, 0.0)', 'rgba(20, 20, 40, 0.22)'],
    shade: 0.18, vignette: 0.16,
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

// Panel layouts, as fractions of the canvas. Panel 0 is the full-bleed
// background; panels 1..5 are the collage windows laid over it. The renderer
// insets every window by half the gap so neighbours share one seam.
export const PANEL_COUNT = 6;
export const GAP = 0.006; // gap between panels, as a fraction of canvas width

const FULL = { x: 0, y: 0, w: 1, h: 1 };

export const LAYOUTS = {
  square: [
    FULL,
    { x: 0.040, y: 0.330, w: 0.300, h: 0.430 },
    { x: 0.660, y: 0.045, w: 0.300, h: 0.300 },
    { x: 0.660, y: 0.660, w: 0.300, h: 0.295 },
    { x: 0.375, y: 0.395, w: 0.250, h: 0.250 },
    { x: 0.040, y: 0.795, w: 0.585, h: 0.160 },
  ],
  portrait: [
    FULL,
    { x: 0.050, y: 0.150, w: 0.420, h: 0.235 },
    { x: 0.530, y: 0.150, w: 0.420, h: 0.235 },
    { x: 0.050, y: 0.420, w: 0.900, h: 0.215 },
    { x: 0.050, y: 0.670, w: 0.420, h: 0.235 },
    { x: 0.530, y: 0.670, w: 0.420, h: 0.235 },
  ],
  landscape: [
    FULL,
    { x: 0.030, y: 0.170, w: 0.215, h: 0.660 },
    { x: 0.275, y: 0.090, w: 0.200, h: 0.370 },
    { x: 0.275, y: 0.540, w: 0.200, h: 0.370 },
    { x: 0.505, y: 0.540, w: 0.200, h: 0.370 },
    { x: 0.735, y: 0.170, w: 0.235, h: 0.660 },
  ],
};

export function layoutFor(sizeId) {
  return LAYOUTS[sizeId] || LAYOUTS.square;
}
