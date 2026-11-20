// Vice Cover Maker — editor state.
// One plain object holds the whole cover: the words, the grade, the
// export size and, per panel, which photo is in it and how it is
// cropped. Rendering reads this object and nothing else, so a given
// state always paints the same cover.

import { PANELS, SAMPLES, DEFAULTS } from './config.js';

// A tiny deterministic random source (mulberry32). The grain, the
// barcode and the shuffle all draw from seeded streams like this one,
// never from Math.random, so renders are reproducible byte for byte.
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function defaultPanelState(panel) {
  return {
    id: panel.id,
    role: panel.role,
    src: panel.sample,
    custom: null, // data URL of a visitor upload, when one is set
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  };
}

export function createState() {
  return {
    caption: DEFAULTS.caption,
    subCaption: DEFAULTS.subCaption,
    grade: DEFAULTS.grade,
    size: DEFAULTS.size,
    panels: PANELS.map(defaultPanelState),
  };
}

// Put one sample photo in every panel, in catalogue order.
export function fillAll(state) {
  state.panels.forEach((panel, i) => {
    panel.src = SAMPLES[i % SAMPLES.length].src;
    panel.custom = null;
  });
  return state;
}

// Deterministically shuffle which sample sits in which panel. The seed
// is fixed, so the shuffle button always lands on the same arrangement
// from the same starting point — a shuffle, but a reproducible one.
export function shufflePanels(state, seed = 2026) {
  const rand = seededRandom(seed);
  const order = SAMPLES.map((s) => s.src);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  state.panels.forEach((panel, i) => {
    panel.src = order[i % order.length];
    panel.custom = null;
    panel.zoom = 1;
    panel.offsetX = 0;
    panel.offsetY = 0;
  });
  return state;
}

export function resetState(state) {
  const fresh = createState();
  state.caption = fresh.caption;
  state.subCaption = fresh.subCaption;
  state.grade = fresh.grade;
  state.size = fresh.size;
  state.panels = fresh.panels;
  return state;
}

// Load every distinct photo the state references. Uploads arrive as
// data URLs; samples as relative paths. Resolves to a Map from the
// state's src string to a loaded HTMLImageElement.
export function loadStateImages(state) {
  const wanted = new Map();
  for (const panel of state.panels) {
    const key = panel.custom || panel.src;
    if (!wanted.has(key)) wanted.set(key, key);
  }
  const jobs = [...wanted.keys()].map(
    (key) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve([key, img]);
        img.onerror = () => reject(new Error('could not load image: ' + key.slice(0, 64)));
        img.src = key;
      }),
  );
  return Promise.all(jobs).then((pairs) => new Map(pairs));
}
