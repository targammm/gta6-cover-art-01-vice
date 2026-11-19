// Vice Cover Maker v2.1 — editor state. Plain data, no DOM here, so the
// cover renderer can be driven from the editor, from a screenshot query,
// or from an export without touching the page.

import { SAMPLES, SIZES, GRADES, DEFAULT_CAPTION, DEFAULT_SUB } from './config.js';

// One panel: which photo it shows, and how the photo is cropped inside it.
// zoom 1 fits the photo to the panel; ox/oy shift the crop in panel units.
export function defaultPanels() {
  const order = ['skyline', 'convertible', 'lifeguard', 'boulevard', 'pier', 'marina'];
  return order.map((id) => ({ photo: id, zoom: 1, ox: 0, oy: 0 }));
}

export function createState() {
  return {
    panels: defaultPanels(),
    selected: 0,
    grade: 'sunset',
    size: 'square',
    caption: DEFAULT_CAPTION,
    sub: DEFAULT_SUB,
    // Uploaded photos, keyed by a generated id, with their object URL image.
    uploads: {},
    uploadSeq: 0,
  };
}

export function sizeOf(state) {
  return SIZES.find((s) => s.id === state.size) ?? SIZES[0];
}

export function gradeOf(state) {
  return GRADES[state.grade] ?? GRADES.sunset;
}

export function photoFile(state, panel) {
  const up = state.uploads[panel.photo];
  if (up) return up.url;
  const sample = SAMPLES.find((s) => s.id === panel.photo);
  return sample ? sample.file : SAMPLES[0].file;
}

export function photoLabel(state, panel) {
  const up = state.uploads[panel.photo];
  if (up) return up.label;
  const sample = SAMPLES.find((s) => s.id === panel.photo);
  return sample ? sample.label : panel.photo;
}

// All photo choices the picker offers: the six samples plus uploads.
export function photoChoices(state) {
  const choices = SAMPLES.map((s) => ({ id: s.id, label: s.label }));
  for (const [id, up] of Object.entries(state.uploads)) {
    choices.push({ id, label: up.label });
  }
  return choices;
}

// Reset one panel to its default photo and crop.
export function resetPanel(state, index) {
  const order = ['skyline', 'convertible', 'lifeguard', 'boulevard', 'pier', 'marina'];
  state.panels[index] = { photo: order[index % order.length], zoom: 1, ox: 0, oy: 0 };
}

// Point a panel at a photo and reset its crop.
export function setPanelPhoto(state, index, photoId) {
  state.panels[index].photo = photoId;
  state.panels[index].zoom = 1;
  state.panels[index].ox = 0;
  state.panels[index].oy = 0;
}
