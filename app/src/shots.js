// Vice Cover Maker v3 — screenshot scenes. The shot modes exist so the
// entry's screenshots are the app itself, drawn by its own renderer:
//   ?shot=cover&size=wide|square|portrait&caption=VICE%20CITY
//   ?shot=editor
//   ?shot=sizes
// A scene is finished when window.__shotReady flips true, after fonts and
// a double animation frame, so a headless browser can capture deterministically.

import { SIZES } from './config.js';
import { drawCover, drawSizesSheet } from './cover.js';

// Poll window.__shotReady until it flips or the timeout runs out.
export function waitShotReady(timeoutMs = 15000) {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (window.__shotReady) return resolve(true);
      if (Date.now() - started > timeoutMs) return resolve(false);
      setTimeout(tick, 50);
    };
    tick();
  });
}

// Shared finishing step for every scene: fonts settled, two frames
// painted, then the flag.
export async function markShotReady() {
  try {
    await document.fonts.ready;
  } catch {
    /* fonts are already awaited during boot; this is a belt-and-braces wait */
  }
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
  window.__shotReady = true;
}

// Set up a cover or sizes scene on the stage canvas and mark it ready.
// Returns false for ?shot=editor, which the caller builds with the real
// editor before marking readiness itself.
export async function runShotMode(params, state, images, canvas) {
  const mode = params.get('shot');
  if (mode === 'editor') return false;
  document.body.classList.add('shot');
  if (params.get('caption')) state.caption = params.get('caption');
  if (params.get('sub')) state.sub = params.get('sub');
  const ctx = canvas.getContext('2d');
  if (mode === 'sizes') {
    canvas.width = 1280;
    canvas.height = 720;
    drawSizesSheet(ctx, canvas.width, canvas.height, state, images);
  } else {
    const sizeId = params.get('size') || 'square';
    const size = SIZES[sizeId] || SIZES.square;
    state.size = sizeId in SIZES ? sizeId : 'square';
    canvas.width = size.w;
    canvas.height = size.h;
    drawCover(ctx, size.w, size.h, state, images);
  }
  await markShotReady();
  return true;
}
