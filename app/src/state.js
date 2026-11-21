// Vice Cover Maker — application state.
// One plain object the whole app reads: editor.js mutates it, cover.js draws
// from it, and a tiny listener set re-renders the preview on every change.

import { PANEL_COUNT } from './config.js';

export const SAMPLES = [
  { id: 'boulevard', label: 'Boulevard Palms', file: 'samples/boulevard.jpg' },
  { id: 'pier', label: 'The Pier', file: 'samples/pier.jpg' },
  { id: 'convertible', label: 'Convertible', file: 'samples/convertible.jpg' },
  { id: 'lifeguard', label: 'Lifeguard Tower', file: 'samples/lifeguard.jpg' },
  { id: 'marina', label: 'Marina Boats', file: 'samples/marina.jpg' },
  { id: 'skyline', label: 'Vice Skyline', file: 'samples/skyline.jpg' },
];

export function sampleById(id) {
  return SAMPLES.find((s) => s.id === id) || null;
}

function blankPanel() {
  return { sampleId: null, img: null, zoom: 1, ox: 0, oy: 0, name: '' };
}

export const state = {
  sizeId: 'square',
  gradeId: 'sunset',
  caption: 'VICE CITY',
  subtitle: 'EST. 1986 · LEONIDA',
  captionPos: 'bottom', // 'top' | 'bottom'
  captionSize: 1, // multiplier, 0.6 .. 1.5
  selected: 0,
  panels: Array.from({ length: PANEL_COUNT }, blankPanel),
};

const listeners = new Set();

export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function changed() {
  for (const fn of listeners) fn(state);
}

// Load a bundled sample into a panel. The Image is kept on the panel so the
// renderer can draw it synchronously once it has arrived.
export function setPanelSample(index, sampleId) {
  const panel = state.panels[index];
  const sample = sampleById(sampleId);
  panel.sampleId = sampleId;
  panel.name = sample ? sample.label : '';
  panel.img = null;
  if (sample) {
    const img = new Image();
    img.onload = () => { if (panel.img === img) changed(); };
    img.src = sample.file;
    panel.img = img;
  }
  changed();
}

// Load a visitor's own photo (already read as a data URL by editor.js).
export function setPanelPhoto(index, dataUrl, name) {
  const panel = state.panels[index];
  panel.sampleId = null;
  panel.name = name || 'Your photo';
  const img = new Image();
  img.onload = () => { if (panel.img === img) changed(); };
  img.src = dataUrl;
  panel.img = img;
  changed();
}
