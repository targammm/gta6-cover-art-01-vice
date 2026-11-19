// Vice Cover Maker v2.1 — boot: load samples and fonts, build state,
// wire the editor, and handle screenshot modes (?shot=cover|editor|sizes).

import { createState, sizeOf } from './state.js';
import { SAMPLES, SIZES } from './config.js';
import { drawCover } from './cover.js';
import { initEditor } from './editor.js';
import { runShot } from './shots.js';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load ${src}`));
    img.src = src;
  });
}

async function boot() {
  const state = createState();
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot') || '';
  if (query.get('caption')) state.caption = query.get('caption');
  if (query.get('sub')) state.sub = query.get('sub');
  if (query.get('grade') && ['sunset', 'neon', 'midnight'].includes(query.get('grade'))) {
    state.grade = query.get('grade');
  }
  if (query.get('size') && SIZES.some((s) => s.id === query.get('size'))) {
    state.size = query.get('size');
  }
  if (query.get('photo')) state.panels[0].photo = query.get('photo');

  const images = {};
  await Promise.all(
    SAMPLES.map(async (s) => {
      images[s.file] = await loadImage(s.file);
    }),
  );
  try {
    await document.fonts.load('100px Anton');
    await document.fonts.load('100px "Archivo Black"');
    await document.fonts.ready;
  } catch {
    // Fall back to system fonts if the local TTFs cannot load.
  }

  const canvas = document.getElementById('cover');
  const sizesCanvas = document.getElementById('sizes');
  const draw = () => {
    const s = sizeOf(state);
    if (canvas.width !== s.w || canvas.height !== s.h) {
      canvas.width = s.w;
      canvas.height = s.h;
    }
    drawCover(canvas, state, images);
  };

  if (shot) {
    await runShot(shot, query, { state, images, canvas, sizesCanvas, draw });
  } else {
    initEditor(state, images, draw);
    draw();
  }
}

boot().catch((err) => {
  console.error(err);
  document.body.dataset.error = String(err?.message ?? err);
});

// Small version handle for the UI footer and for screenshot automation.
export function viceVersion() {
  return '2.1.0';
}
