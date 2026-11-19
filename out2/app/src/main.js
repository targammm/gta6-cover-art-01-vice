// Vice Cover Maker — bootstrap: loads the sample photos, paints the live
// preview on every state change, and hands screenshot presets to shots.js.
// The preview canvas always renders at the selected export size, scaled by
// CSS, so what you see is what the PNG will be.
import { SIZES } from './config.js';
import { createStore } from './state.js';
import { renderCover } from './cover.js';
import { buildEditor, loadSlotImages } from './editor.js';
import { applyShotMode, waitForFonts } from './shots.js';

const stage = document.getElementById('stage');
const stageWrap = document.getElementById('stageWrap');
const sizeNote = document.getElementById('sizeNote');

const store = createStore();
store.restore();

const editor = buildEditor({
  store,
  stage,
  onExported: () => {},
});

let images = {};
let painting = false;

async function repaint() {
  if (painting) return;
  painting = true;
  try {
    const state = store.get();
    images = await loadSlotImages(state, images);
    editor.setImages(images);
    const size = SIZES[state.size] || SIZES.wide;
    if (stage.width !== size.w || stage.height !== size.h) {
      stage.width = size.w;
      stage.height = size.h;
    }
    const ctx = stage.getContext('2d');
    renderCover(ctx, state, images, size.w, size.h);
    sizeNote.textContent = `Preview ${size.w} × ${size.h} — live · drag a panel to pan, scroll to zoom`;
  } finally {
    painting = false;
  }
}

store.subscribe(() => { void repaint(); });

async function boot() {
  await waitForFonts();
  // Photos first: the cover and sizes presets export with these images, so
  // they must be loaded before any preset runs.
  images = await loadSlotImages(store.get(), images);
  editor.setImages(images);
  const shot = await applyShotMode(store, images);
  if (shot === 'cover' || shot === 'portrait') {
    // The exported PNG already fills the page; nothing else to paint.
    stageWrap?.remove();
    return;
  }
  await repaint();
  if (shot === 'sizes') {
    // The sheet replaced <main>; the stage is gone with it.
    return;
  }
  editor.refreshControls(store.get());
}

boot().catch((err) => {
  const note = document.getElementById('sizeNote');
  if (note) note.textContent = 'Could not start the editor: ' + err.message;
});
