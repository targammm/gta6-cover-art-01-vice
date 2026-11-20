// Vice Cover Maker v3 — shared constants: export sizes, built-in photos,
// panel roles, cover grades and the six-panel layout. Everything the app
// loads is a local file; nothing here points at the network.

export const SIZES = {
  square: { id: 'square', w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { id: 'portrait', w: 1080, h: 1350, label: '1080 × 1350' },
  wide: { id: 'wide', w: 1920, h: 1080, label: '1920 × 1080' },
};
export const SIZE_ORDER = ['square', 'portrait', 'wide'];

export const SAMPLES = [
  { id: 'skyline', src: 'samples/skyline.jpg', label: 'Sunset skyline' },
  { id: 'convertible', src: 'samples/convertible.jpg', label: 'Coast convertible' },
  { id: 'lifeguard', src: 'samples/lifeguard.jpg', label: 'Lifeguard tower' },
  { id: 'boulevard', src: 'samples/boulevard.jpg', label: 'Palm boulevard' },
  { id: 'pier', src: 'samples/pier.jpg', label: 'Old pier' },
  { id: 'marina', src: 'samples/marina.jpg', label: 'Marina yachts' },
];

export const ROLES = ['HERO', 'CHASE', 'HEIST', 'VICE', 'CREW', 'GETAWAY'];

export const DEFAULT_CAPTION = 'VICE CITY';
export const DEFAULT_SUB = 'A SUNSET STORY';
export const BADGE_TOP = 'EST. 2026';
export const BADGE_BOTTOM = 'LEONIDA';
export const PILL_TEXT = '6 PANELS • 3 SIZES';
export const MICRO_TEXT = 'LEONIDA • VICE CITY • 2026';
export const EXPORT_PREFIX = 'vice-cover';

// Whole-cover colour grades. Each grade is a translucent wash laid over the
// panels (top / middle / bottom stops), an accent line colour for panel
// borders and the pill, a halftone dot colour, and the glow colour behind
// the caption lettering.
export const GRADES = {
  sunset: {
    name: 'Sunset',
    wash: ['rgba(255, 84, 138, 0.30)', 'rgba(255, 138, 61, 0.20)', 'rgba(110, 44, 190, 0.32)'],
    line: '#ff5c8a',
    dot: 'rgba(255, 190, 120, 0.5)',
    glow: '#ff2e7e',
    chip: 'rgba(24, 6, 30, 0.62)',
  },
  neon: {
    name: 'Neon',
    wash: ['rgba(124, 58, 237, 0.32)', 'rgba(255, 46, 150, 0.20)', 'rgba(14, 116, 233, 0.30)'],
    line: '#22d3ee',
    dot: 'rgba(103, 232, 249, 0.5)',
    glow: '#e0218a',
    chip: 'rgba(10, 6, 34, 0.62)',
  },
  midnight: {
    name: 'Midnight',
    wash: ['rgba(16, 24, 72, 0.36)', 'rgba(23, 42, 110, 0.26)', 'rgba(6, 8, 30, 0.42)'],
    line: '#7aa2ff',
    dot: 'rgba(168, 196, 255, 0.45)',
    glow: '#3b82f6',
    chip: 'rgba(4, 8, 26, 0.66)',
  },
  palm: {
    name: 'Palm',
    wash: ['rgba(20, 184, 166, 0.26)', 'rgba(255, 120, 170, 0.20)', 'rgba(12, 90, 110, 0.32)'],
    line: '#2dd4bf',
    dot: 'rgba(153, 246, 228, 0.5)',
    glow: '#fb7185',
    chip: 'rgba(4, 30, 30, 0.62)',
  },
};
export const GRADE_ORDER = ['sunset', 'neon', 'midnight', 'palm'];

// The six panels as fractions of the cover: a hero at top-left, two stacked
// panels at top-right, and a row of three along the bottom. The renderer
// insets each cell by half the gutter on every side.
export const PANEL_CELLS = [
  { x0: 0.0, y0: 0.0, x1: 0.61, y1: 0.61 },
  { x0: 0.61, y0: 0.0, x1: 1.0, y1: 0.305 },
  { x0: 0.61, y0: 0.305, x1: 1.0, y1: 0.61 },
  { x0: 0.0, y0: 0.61, x1: 0.3333, y1: 1.0 },
  { x0: 0.3333, y0: 0.61, x1: 0.6666, y1: 1.0 },
  { x0: 0.6666, y0: 0.61, x1: 1.0, y1: 1.0 },
];
