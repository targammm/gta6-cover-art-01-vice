// Vice Cover Maker — static configuration.
// Everything the renderer and editor need that never changes at runtime:
// the six panels, the bundled sample photos, the export sizes and the
// four colour grades. No network, no clock, no randomness in here.

export const PANELS = [
  { id: 'hero', role: 'HERO', sample: 'samples/boulevard.jpg' },
  { id: 'chase', role: 'CHASE', sample: 'samples/convertible.jpg' },
  { id: 'heist', role: 'HEIST', sample: 'samples/marina.jpg' },
  { id: 'vice', role: 'VICE', sample: 'samples/skyline.jpg' },
  { id: 'crew', role: 'CREW', sample: 'samples/pier.jpg' },
  { id: 'getaway', role: 'GETAWAY', sample: 'samples/lifeguard.jpg' },
];

export const SAMPLES = [
  { id: 'boulevard', label: 'Boulevard', src: 'samples/boulevard.jpg' },
  { id: 'convertible', label: 'Convertible', src: 'samples/convertible.jpg' },
  { id: 'marina', label: 'Marina', src: 'samples/marina.jpg' },
  { id: 'skyline', label: 'Skyline', src: 'samples/skyline.jpg' },
  { id: 'pier', label: 'Pier', src: 'samples/pier.jpg' },
  { id: 'lifeguard', label: 'Lifeguard', src: 'samples/lifeguard.jpg' },
];

export const SIZES = {
  square: { id: 'square', label: 'Square', width: 1080, height: 1080 },
  portrait: { id: 'portrait', label: 'Portrait', width: 1080, height: 1350 },
  wide: { id: 'wide', label: 'Wide', width: 1920, height: 1080 },
};

// The four grades. Each one is a small recipe the renderer mixes over
// every panel: a translucent colour wash, a bright accent for rules and
// chips, a halftone ink colour and the glow colour behind the caption.
export const GRADES = {
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    wash: 'rgba(255, 94, 154, 0.20)',
    washDeep: 'rgba(124, 44, 168, 0.28)',
    accent: '#ffb03a',
    halftone: 'rgba(255, 120, 90, 0.55)',
    glow: '#ff2e88',
    captionFrom: '#ff5e9c',
    captionTo: '#ffb03a',
  },
  neon: {
    id: 'neon',
    label: 'Neon',
    wash: 'rgba(122, 44, 255, 0.22)',
    washDeep: 'rgba(20, 10, 70, 0.30)',
    accent: '#37e6ff',
    halftone: 'rgba(255, 62, 178, 0.50)',
    glow: '#37e6ff',
    captionFrom: '#c86bff',
    captionTo: '#37e6ff',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    wash: 'rgba(18, 42, 110, 0.30)',
    washDeep: 'rgba(4, 10, 34, 0.38)',
    accent: '#7fb2ff',
    halftone: 'rgba(90, 140, 255, 0.45)',
    glow: '#3a6bff',
    captionFrom: '#8fc2ff',
    captionTo: '#3a6bff',
  },
  palm: {
    id: 'palm',
    label: 'Palm',
    wash: 'rgba(16, 160, 140, 0.20)',
    washDeep: 'rgba(6, 60, 66, 0.30)',
    accent: '#ffd166',
    halftone: 'rgba(255, 110, 160, 0.50)',
    glow: '#ff6ea0',
    captionFrom: '#5eead4',
    captionTo: '#ff6ea0',
  },
};

export const DEFAULTS = {
  caption: 'VICE CITY',
  subCaption: 'A SUNSET STORY',
  grade: 'sunset',
  size: 'square',
  zoomMin: 0.8,
  zoomMax: 2.5,
  offsetMin: -0.5,
  offsetMax: 0.5,
  background: '#2a0e2e',
  gutterRatio: 0.012,
};
