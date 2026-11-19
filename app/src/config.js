// Vice Cover Maker v2.1 — shared constants: samples, export sizes, grades.
// All assets are local files under app/; the app makes no network request.

export const SAMPLES = [
  { id: 'skyline', label: 'Skyline', file: 'samples/skyline.jpg' },
  { id: 'convertible', label: 'Convertible', file: 'samples/convertible.jpg' },
  { id: 'lifeguard', label: 'Lifeguard', file: 'samples/lifeguard.jpg' },
  { id: 'boulevard', label: 'Boulevard', file: 'samples/boulevard.jpg' },
  { id: 'pier', label: 'Pier', file: 'samples/pier.jpg' },
  { id: 'marina', label: 'Marina', file: 'samples/marina.jpg' },
];

export const SIZES = [
  { id: 'square', label: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide 1920 × 1080', w: 1920, h: 1080 },
];

export const GRADES = {
  sunset: {
    name: 'Sunset',
    sky: ['#ff5e7a', '#ff9a3d', '#7b2d8b'],
    tint: 'rgba(255, 90, 120, 0.20)',
    line: '#ff2e88',
    dot: 'rgba(255, 255, 255, 0.16)',
    captionShadow: '#ff2e88',
  },
  neon: {
    name: 'Neon',
    sky: ['#7b2ff7', '#00e5ff', '#ff2e88'],
    tint: 'rgba(80, 40, 255, 0.22)',
    line: '#00e5ff',
    dot: 'rgba(0, 229, 255, 0.18)',
    captionShadow: '#00e5ff',
  },
  midnight: {
    name: 'Midnight',
    sky: ['#0b1035', '#1b2a6b', '#3d1a5c'],
    tint: 'rgba(20, 30, 90, 0.28)',
    line: '#8fa8ff',
    dot: 'rgba(255, 255, 255, 0.10)',
    captionShadow: '#1b2a6b',
  },
};

export const DEFAULT_CAPTION = 'VICE CITY';
export const DEFAULT_SUB = 'A SUNSET STORY';
export const BADGE_TOP = 'EST. 2026';
export const BADGE_BOTTOM = 'LEONIDA';
export const PILL_TEXT = '6 PANELS \u2022 3 SIZES';

// Gutter between panels, in pixels, for a canvas of the given width.
export function gutterFor(width) {
  return Math.max(6, Math.round(width * 0.009));
}

export const EXPORT_PREFIX = 'vice-cover';

// Panel rectangles as fractions of the canvas: hero top-left, two stacked
// on the right, three across the bottom. Works for square, portrait and wide.
export const PANEL_LAYOUT = [
  { x: 0, y: 0, w: 0.611, h: 0.611 },
  { x: 0.611, y: 0, w: 0.389, h: 0.301 },
  { x: 0.611, y: 0.31, w: 0.389, h: 0.301 },
  { x: 0, y: 0.611, w: 0.333, h: 0.389 },
  { x: 0.333, y: 0.611, w: 0.334, h: 0.389 },
  { x: 0.667, y: 0.611, w: 0.333, h: 0.389 },
];
