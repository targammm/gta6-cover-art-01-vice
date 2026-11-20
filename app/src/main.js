// Vice Cover Maker v3 — boot. Loads the built-in photos and the two display
// fonts first (the renderer draws text with them), then routes: a ?shot=
// query goes to the screenshot scenes, anything else opens the editor.

import { SAMPLES } from './config.js';
import { createState } from './state.js';
import { initEditor } from './editor.js';
import { runShotMode, markShotReady } from './shots.js';

const images = {};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + src));
    img.src = src;
  });
}

async function boot() {
  await Promise.all(
    SAMPLES.map(async (sample) => {
      images[sample.id] = await loadImage(sample.src);
    }),
  );
  try {
    await document.fonts.load('120px Anton');
    await document.fonts.load('48px "Archivo Black"');
    await document.fonts.ready;
  } catch {
    /* the canvas falls back to sans-serif if a font face fails */
  }

  const state = createState();
  const params = new URLSearchParams(location.search);
  const canvas = document.getElementById('stage');

  if (params.get('shot') === 'editor') {
    document.body.classList.add('shot-editor');
    initEditor(state, images);
    await markShotReady();
    return;
  }
  if (params.has('shot')) {
    await runShotMode(params, state, images, canvas);
    return;
  }
  initEditor(state, images);
}

boot();
