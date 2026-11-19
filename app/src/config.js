// Vice Cover Maker — central tuning: every number the cover renderer and the
// editor UI share lives here, so a tweak in one place moves the whole app.
// Layouts are functions of (W, H, gutter) returning panel rects; grades are
// gradient stops + blend modes the renderer applies per panel.
export const APP_NAME = 'VICE COVER MAKER';
export const APP_TAG = 'GTA-style cover art studio · offline · multi-panel';

export const SIZES = {
  square: { id: 'square', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  portrait: { id: 'portrait', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  wide: { id: 'wide', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
};

export const PALETTE = {
  ink: '#0b0b12',
  panelGap: '#0b0b12',
  paper: '#f5efe4',
  magenta: '#ff2e88',
  cyan: '#00e5ff',
  amber: '#ffb300',
  sunset: '#ff7a18',
  violet: '#7b2fff',
  lime: '#b6ff2e',
};

// A layout maps the cover box to named panel rects. Panel ids are stable:
// the editor binds one photo slot per panel id, and the renderer draws them
// in order, so adding a layout never renumbers the photo slots.
export const LAYOUTS = {
  trio: {
    id: 'trio',
    label: 'Vice Trio',
    hint: '1 hero + 2 street panels',
    panels: (W, H, g) => {
      const heroH = Math.round(H * 0.58);
      const half = (W - g) / 2;
      return [
        { id: 'hero', x: 0, y: 0, w: W, h: heroH },
        { id: 'left', x: 0, y: heroH + g, w: half, h: H - heroH - g },
        { id: 'right', x: half + g, y: heroH + g, w: half, h: H - heroH - g },
      ];
    },
  },
  duo: {
    id: 'duo',
    label: 'Split Duo',
    hint: '2 tall panels, side by side',
    panels: (W, H, g) => {
      const half = (W - g) / 2;
      return [
        { id: 'hero', x: 0, y: 0, w: half, h: H },
        { id: 'left', x: half + g, y: 0, w: half, h: H },
      ];
    },
  },
  quad: {
    id: 'quad',
    label: 'Neon Quad',
    hint: '2 × 2 grid, four moments',
    panels: (W, H, g) => {
      const cw = (W - g) / 2;
      const ch = (H - g) / 2;
      return [
        { id: 'hero', x: 0, y: 0, w: cw, h: ch },
        { id: 'left', x: cw + g, y: 0, w: cw, h: ch },
        { id: 'right', x: 0, y: ch + g, w: cw, h: ch },
        { id: 'far', x: cw + g, y: ch + g, w: cw, h: ch },
      ];
    },
  },
  hero: {
    id: 'hero',
    label: 'Full Bleed',
    hint: 'one photo, full cover',
    panels: (W, H) => [{ id: 'hero', x: 0, y: 0, w: W, h: H }],
  },
};

// Colour grades: a vertical wash laid over each panel with the blend mode
// named here, plus a caption accent colour. Sunset is the default Vice City
// look; neon is the night-strip look; noir is a hard high-contrast print.
export const GRADES = {
  sunset: {
    id: 'sunset',
    label: 'Vice Sunset',
    stops: ['#ff7a18', '#ff2e63', '#7b2fff'],
    blend: 'soft-light',
    strength: 0.85,
    caption: '#ffb300',
    captionStroke: '#12041f',
  },
  neon: {
    id: 'neon',
    label: 'Neon Night',
    stops: ['#00e5ff', '#ff2e88', '#7b2fff'],
    blend: 'overlay',
    strength: 0.8,
    caption: '#00e5ff',
    captionStroke: '#12041f',
  },
  gold: {
    id: 'gold',
    label: 'Gold Hour',
    stops: ['#ffd166', '#ff7a18', '#c1121f'],
    blend: 'soft-light',
    strength: 0.8,
    caption: '#ffd166',
    captionStroke: '#1a0b00',
  },
  noir: {
    id: 'noir',
    label: 'Noir Print',
    stops: ['#e8e8e8', '#5a5a6a', '#0b0b12'],
    blend: 'overlay',
    strength: 0.55,
    caption: '#f5efe4',
    captionStroke: '#000000',
  },
};

export const SAMPLES = {
  boulevard: { label: 'Boulevard', src: 'samples/boulevard.jpg' },
  pier: { label: 'Pier', src: 'samples/pier.jpg' },
};

// Deterministic grain: the same seed always draws the same speckles, so the
// exported PNG is byte-stable for a given state.
export function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const DEFAULT_STATE = {
  layout: 'trio',
  size: 'wide',
  grade: 'sunset',
  caption: 'SUNSET HEIST',
  subcaption: 'VICE CITY · 2026',
  captionPos: 'bottom',
  gutter: 14,
  grain: true,
  halftone: false,
  vignette: true,
  // One photo slot per panel id; a slot holds { src, name, zoom, ox, oy, focus }.
  // ox/oy are the pan offsets as fractions of the panel (0 = anchored).
  // focus 'top' keeps faces in frame on the short wide panels.
  photos: {
    hero: { src: 'samples/pier.jpg', name: 'Pier', zoom: 1.15, ox: 0, oy: 0, focus: 'top' },
    left: { src: 'samples/boulevard.jpg', name: 'Boulevard', zoom: 1.2, ox: 0.05, oy: 0, focus: 'top' },
    right: { src: 'samples/pier.jpg', name: 'Pier', zoom: 1.35, ox: -0.06, oy: 0, focus: 'top' },
    far: { src: 'samples/boulevard.jpg', name: 'Boulevard', zoom: 1.1, ox: 0, oy: 0, focus: 'top' },
  },
};

