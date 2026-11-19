// Vice Cover Maker v2 — configuration: export sizes, sample photos, colour
// grades and the six-panel mosaic layouts. Nothing here touches the network:
// every sample is a file under app/samples/ and every font a file under
// app/fonts/.

/** The three post sizes the cover exports to, in pixels. */
export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
  landscape: { w: 1920, h: 1080, label: '1920 × 1080' },
};

/** Sample photos shipped with the app. The first six are the default panel
 *  assignment, in panel order: hero, top-right 1, top-right 2, bottom 1-3.
 *  boulevard and pier are the kit starter samples; the other four were made
 *  for this entry with an image model and are free to use. */
export const SAMPLES = [
  { id: 'skyline', file: 'samples/skyline.jpg', label: 'Skyline dusk' },
  { id: 'convertible', file: 'samples/convertible.jpg', label: 'Convertible' },
  { id: 'lifeguard', file: 'samples/lifeguard.jpg', label: 'Lifeguard tower' },
  { id: 'boulevard', file: 'samples/boulevard.jpg', label: 'Boulevard' },
  { id: 'pier', file: 'samples/pier.jpg', label: 'Pier' },
  { id: 'marina', file: 'samples/marina.jpg', label: 'Marina' },
];

/** Font family names, matching the @font-face rules in style.css. */
export const FONTS = {
  display: 'Anton',
  body: '"Archivo Black"',
};

/** Colour grades. Each grade tints the photos, paints the caption band and
 *  sets the halftone strength, so one tap re-grades the whole cover. */
export const GRADES = {
  sunset: {
    label: 'Sunset',
    tintTop: 'rgba(255, 122, 61, 0)',
    tintBottom: 'rgba(194, 39, 124, 0.55)',
    band: ['#ff7a3d', '#c2277c', '#3b1d5e'],
    halftone: 0.5,
    accent: '#ffd166',
  },
  neon: {
    label: 'Neon',
    tintTop: 'rgba(0, 229, 255, 0)',
    tintBottom: 'rgba(255, 0, 128, 0.5)',
    band: ['#00e5ff', '#7b2ff7', '#ff0080'],
    halftone: 0.65,
    accent: '#00e5ff',
  },
  midnight: {
    label: 'Midnight',
    tintTop: 'rgba(20, 20, 80, 0)',
    tintBottom: 'rgba(10, 10, 50, 0.6)',
    band: ['#2b2d6e', '#14143a', '#050514'],
    halftone: 0.35,
    accent: '#b388ff',
  },
};

/**
 * Six-panel mosaic, as fractions of the cover. Returns the six photo rects
 * plus the caption band rect, in panel order: hero, top-right 1, top-right 2,
 * bottom 1, bottom 2, bottom 3. The mosaic changes shape with the size so
 * the hero always dominates and no panel is ever a sliver.
 */
export function layoutFor(sizeKey) {
  if (sizeKey === 'landscape') {
    return {
      panels: [
        { x: 0, y: 0, w: 0.44, h: 0.78 },
        { x: 0.44, y: 0, w: 0.1867, h: 0.39 },
        { x: 0.6267, y: 0, w: 0.1867, h: 0.39 },
        { x: 0.8133, y: 0, w: 0.1867, h: 0.39 },
        { x: 0.44, y: 0.39, w: 0.28, h: 0.39 },
        { x: 0.72, y: 0.39, w: 0.28, h: 0.39 },
      ],
      band: { x: 0, y: 0.78, w: 1, h: 0.22 },
    };
  }
  if (sizeKey === 'portrait') {
    return {
      panels: [
        { x: 0, y: 0, w: 0.66, h: 0.56 },
        { x: 0.66, y: 0, w: 0.34, h: 0.28 },
        { x: 0.66, y: 0.28, w: 0.34, h: 0.28 },
        { x: 0, y: 0.56, w: 0.3333, h: 0.2 },
        { x: 0.3333, y: 0.56, w: 0.3333, h: 0.2 },
        { x: 0.6666, y: 0.56, w: 0.3334, h: 0.2 },
      ],
      band: { x: 0, y: 0.76, w: 1, h: 0.24 },
    };
  }
  return {
    panels: [
      { x: 0, y: 0, w: 0.66, h: 0.6 },
      { x: 0.66, y: 0, w: 0.34, h: 0.3 },
      { x: 0.66, y: 0.3, w: 0.34, h: 0.3 },
      { x: 0, y: 0.6, w: 0.3333, h: 0.2 },
      { x: 0.3333, y: 0.6, w: 0.3333, h: 0.2 },
      { x: 0.6666, y: 0.6, w: 0.3334, h: 0.2 },
    ],
    band: { x: 0, y: 0.8, w: 1, h: 0.2 },
  };
}
