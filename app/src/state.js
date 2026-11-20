// Vice Cover Maker v3 — editor state. Plain data only; the renderer in
// cover.js turns a state into pixels, and the editor mutates the state and
// asks for a redraw. Uploaded photos live here as lightweight records
// ({ id, label }); their Image objects sit in the image map owned by main.js.

import { SAMPLES, DEFAULT_CAPTION, DEFAULT_SUB } from './config.js';

let uploadSeq = 0;

export function defaultPanel(index) {
  return { photoId: SAMPLES[index % SAMPLES.length].id, zoom: 1, ox: 0, oy: 0 };
}

export function createState() {
  return {
    caption: DEFAULT_CAPTION,
    sub: DEFAULT_SUB,
    grade: 'sunset',
    size: 'square',
    selected: 0,
    panels: SAMPLES.map((_, i) => defaultPanel(i)),
    uploads: [],
  };
}

export function registerUpload(state, label) {
  uploadSeq += 1;
  const record = { id: 'upload-' + uploadSeq, label: label || 'My photo ' + uploadSeq };
  state.uploads.push(record);
  return record;
}

// Every photo the picker can offer: the built-in samples first, then the
// visitor's own uploads in the order they were added.
export function photoChoices(state) {
  const builtin = SAMPLES.map((s) => ({ id: s.id, label: s.label }));
  return builtin.concat(state.uploads.map((u) => ({ id: u.id, label: u.label })));
}

export function selectedPanel(state) {
  return state.panels[state.selected];
}

export function setPanelPhoto(state, index, photoId) {
  state.panels[index].photoId = photoId;
}

export function resetPanel(state, index) {
  state.panels[index] = defaultPanel(index);
}

// Point every panel at one photo, keeping each panel's crop as it is.
export function fillAllPanels(state, photoId) {
  for (const panel of state.panels) panel.photoId = photoId;
}

// Rotate the panel photos by one slot (deterministic, so a screenshot of
// the result is reproducible) — the editor's "shuffle" is a rotation plus
// a reversal, which reads as a remix without any randomness.
export function shufflePanels(state) {
  const ids = state.panels.map((p) => p.photoId);
  ids.push(ids.shift());
  ids.reverse();
  state.panels.forEach((panel, i) => {
    panel.photoId = ids[i];
  });
}
