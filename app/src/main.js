// Vice Cover Maker v2 — the page wiring: loads the six sample photos and the
// two local fonts, repaints the preview on every edit, exports the PNG, and
// serves the fixed ?shot= scenes the screenshots are taken from.
import { SAMPLES, SIZES, FONTS, layoutFor } from './config.js';
import { defaultState, stateFromQuery } from './state.js';
import { drawCover, renderCoverToCanvas, drawSizesSheet } from './cover.js';
import { createEditor } from './editor.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const state = defaultState();
const uploads = [null, null, null, null, null, null];
const sampleImages = {};

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

let editor = null;

function redraw() {
  const size = SIZES[state.size];
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  const images = editor ? editor.getImages() : state.panels.map((p) => sampleImages[p.photo] || null);
  drawCover(canvas.getContext('2d'), size.w, size.h, state, images);
}

/** Clicking the preview selects the panel under the cursor. */
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const fx = (event.clientX - rect.left) / rect.width;
  const fy = (event.clientY - rect.top) / rect.height;
  const layout = layoutFor(state.size);
  const hit = layout.panels.findIndex((p) => fx >= p.x && fx < p.x + p.w && fy >= p.y && fy < p.y + p.h);
  if (hit >= 0 && editor) {
    state.selected = hit;
    editor.refreshStrip();
    editor.syncCropInputs();
    redraw();
  }
});

document.getElementById('export').addEventListener('click', () => {
  const size = SIZES[state.size];
  const images = editor.getImages();
  const out = renderCoverToCanvas(state, images, state.size);
  out.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    status.textContent = `Saved vice-cover-${size.w}x${size.h}.png`;
  }, 'image/png');
});

async function boot() {
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  const shotState = shot ? stateFromQuery(query) : null;
  if (shotState) Object.assign(state, shotState);
  await Promise.all(SAMPLES.map(async (s) => {
    try { sampleImages[s.id] = await loadImage(s.file); } catch (e) { sampleImages[s.id] = null; }
  }));
  try {
    await document.fonts.load(`400 100px ${FONTS.display}`);
    await document.fonts.load(`400 40px ${FONTS.body}`);
    await document.fonts.ready;
  } catch (e) { /* fall back to system fonts if a local font fails */ }

  editor = createEditor({
    elements: {
      strip: document.getElementById('panelStrip'),
      caption: document.getElementById('caption'),
      subcaption: document.getElementById('subcaption'),
      badge: document.getElementById('badge'),
      zoom: document.getElementById('zoom'),
      offsetX: document.getElementById('offsetX'),
      offsetY: document.getElementById('offsetY'),
      zoomVal: document.getElementById('zoomVal'),
      offsetXVal: document.getElementById('offsetXVal'),
      offsetYVal: document.getElementById('offsetYVal'),
      photoFile: document.getElementById('photoFile'),
      fillAll: document.getElementById('fillAll'),
      shuffle: document.getElementById('shuffle'),
      gradeButtons: [...document.querySelectorAll('[data-grade]')],
      sizeButtons: [...document.querySelectorAll('[data-size]')],
    },
    state,
    sampleImages,
    uploads,
    onChange: redraw,
  });
  document.getElementById('caption').value = state.caption;
  document.getElementById('subcaption').value = state.subcaption;
  document.getElementById('badge').value = state.badge;
  document.querySelector(`[data-grade="${state.grade}"]`)?.classList.add('active');
  document.querySelector(`[data-size="${state.size}"]`)?.classList.add('active');
  redraw();
  if (shot) {
    runShot(shot, query, state, editor, redraw, { drawSizesSheet });
  } else {
    window.__shotReady = true;
  }
}

boot();
