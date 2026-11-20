// Vice Cover Maker — screenshot modes.
// The editor is the app; the shots are how the app presents itself to
// the gallery. A ?shot= parameter swaps the page into a fixed,
// full-bleed composition and, once fonts and photos are in and two
// animation frames have painted, raises window.__shotReady so the
// capture script knows the frame is final.

import { SIZES } from './config.js';
import { createState, loadStateImages } from './state.js';
import { renderCover } from './cover.js';

// Resolve once the cover for the requested mode has been painted and
// the browser has had its two frames. Capture tools await this.
export function waitShotReady() {
  return new Promise((resolve) => {
    if (window.__shotReady) return resolve(true);
    const started = Date.now();
    const tick = () => {
      if (window.__shotReady) return resolve(true);
      if (Date.now() - started > 20000) return resolve(false);
      requestAnimationFrame(tick);
    };
    tick();
  });
}

function coverState(params) {
  const state = createState();
  const size = params.get('size');
  if (size && SIZES[size]) state.size = size;
  const caption = params.get('caption');
  if (caption) state.caption = caption;
  const sub = params.get('sub');
  if (sub) state.subCaption = sub;
  const grade = params.get('grade');
  if (grade) state.grade = grade;
  return state;
}

function fullBleed(canvas) {
  document.body.classList.add('shot-mode');
  const stage = document.getElementById('shot-stage');
  stage.hidden = false;
  stage.replaceChildren(canvas);
  canvas.classList.add('shot-canvas');
}

// The sizes shot: the same cover rendered at all three export sizes,
// side by side on a plum stage, each with its pixel dimensions labelled.
async function paintSizesShot() {
  const stage = document.getElementById('shot-stage');
  document.body.classList.add('shot-mode');
  stage.hidden = false;
  stage.replaceChildren();
  const base = createState();
  const images = await loadStateImages(base);
  for (const key of ['square', 'portrait', 'wide']) {
    const state = createState();
    state.size = key;
    const cell = document.createElement('figure');
    cell.className = 'size-cell';
    const canvas = document.createElement('canvas');
    renderCover(canvas, state, images);
    const label = document.createElement('figcaption');
    const s = SIZES[key];
    label.textContent = `${s.label} — ${s.width} × ${s.height}`;
    cell.append(canvas, label);
    stage.append(cell);
  }
}

// Entry point for shot mode. Returns true when a shot was requested
// (the editor then stays hidden), false for a normal visit.
export async function runShotMode(params) {
  const shot = params.get('shot');
  if (!shot) return false;
  // Fonts first: canvas type painted before Anton arrives would be
  // stuck in a fallback face for the whole shot.
  try {
    await Promise.all([
      document.fonts.load('100px Anton'),
      document.fonts.load('40px "Archivo Black"'),
    ]);
    await document.fonts.ready;
  } catch { /* fall through and paint with what we have */ }
  if (shot === 'sizes') {
    await paintSizesShot();
  } else if (shot === 'cover') {
    const state = coverState(params);
    const images = await loadStateImages(state);
    const canvas = document.createElement('canvas');
    renderCover(canvas, state, images);
    fullBleed(canvas);
  } else {
    return false; // ?shot=editor is the plain editor, framed by CSS
  }
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
  window.__shotReady = true;
  return true;
}
