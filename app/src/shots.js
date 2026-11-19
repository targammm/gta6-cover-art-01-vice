// Vice Cover Maker v2.1 — fixed scenes for screenshots.
// ?shot=cover shows the cover alone, ?shot=editor shows the page with a
// sample photo, ?shot=sizes shows the three export sizes side by side.
// window.__shotReady is set once the scene has painted.

import { drawSizesSheet } from './cover.js';
import { initEditor } from './editor.js';

export async function runShot(shot, query, ctx) {
  const { state, images, canvas, sizesCanvas, draw } = ctx;
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    draw();
  } else if (shot === 'sizes') {
    document.body.classList.add('shot-sizes');
    canvas.hidden = true;
    sizesCanvas.hidden = false;
    drawSizesSheet(sizesCanvas, state, images);
  } else {
    initEditor(state, images, draw);
    draw();
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}

// Pollable readiness for screenshot automation: resolves once the scene
// has painted and window.__shotReady is set, or rejects on timeout.
export function waitShotReady(timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.__shotReady) return resolve(true);
      if (Date.now() - start > timeoutMs) return reject(new Error('shot not ready'));
      setTimeout(tick, 50);
    };
    tick();
  });
}
