// Vice Cover Maker — page wiring.
// Connects the control column to the state, keeps the stage canvas at the
// export size, re-renders on every change, and handles the ?shot= demo
// scenes the screenshots are taken from.

import { GRADES, SIZES, sizeById } from './config.js';
import { changed, onChange, state } from './state.js';
import { downloadCover, renderCover } from './cover.js';
import { buildPanelCards, refreshBadges } from './editor.js';
import { applyScene } from './shots.js';

const stage = document.getElementById('stage');
const ctx = stage.getContext('2d');
const ui = {};
let queued = false;

function render() {
  const size = sizeById(state.sizeId);
  if (stage.width !== size.w) stage.width = size.w;
  if (stage.height !== size.h) stage.height = size.h;
  renderCover(ctx, state, size.w, size.h);
}

function scheduleRender() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    render();
    syncControls();
  });
}

function syncControls() {
  if (ui.caption && document.activeElement !== ui.caption) ui.caption.value = state.caption;
  if (ui.subtitle && document.activeElement !== ui.subtitle) ui.subtitle.value = state.subtitle;
  if (ui.captionSize) ui.captionSize.value = String(state.captionSize);
  document.querySelectorAll('#posSeg button').forEach((b) => {
    b.classList.toggle('on', b.dataset.pos === state.captionPos);
  });
  document.querySelectorAll('.swatch').forEach((b) => {
    b.classList.toggle('on', b.dataset.grade === state.gradeId);
  });
  document.querySelectorAll('#sizes button').forEach((b) => {
    b.classList.toggle('on', b.dataset.size === state.sizeId);
  });
  refreshBadges();
}

function buildControls() {
  ui.caption = document.getElementById('caption');
  ui.subtitle = document.getElementById('subtitle');
  ui.captionSize = document.getElementById('captionSize');
  ui.caption.addEventListener('input', () => { state.caption = ui.caption.value; changed(); });
  ui.subtitle.addEventListener('input', () => { state.subtitle = ui.subtitle.value; changed(); });
  ui.captionSize.addEventListener('input', () => {
    state.captionSize = Number(ui.captionSize.value);
    changed();
  });
  document.querySelectorAll('#posSeg button').forEach((b) => {
    b.addEventListener('click', () => { state.captionPos = b.dataset.pos; changed(); });
  });

  const gradesBox = document.getElementById('grades');
  for (const g of GRADES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.dataset.grade = g.id;
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.style.background = `linear-gradient(180deg, ${g.wash[0]}, ${g.wash[1]} 50%, ${g.wash[2]})`;
    const name = document.createElement('span');
    name.textContent = g.label;
    b.appendChild(chip);
    b.appendChild(name);
    b.addEventListener('click', () => { state.gradeId = g.id; changed(); });
    gradesBox.appendChild(b);
  }

  const sizesBox = document.getElementById('sizes');
  for (const s of SIZES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.size = s.id;
    b.textContent = s.label;
    b.addEventListener('click', () => { state.sizeId = s.id; changed(); });
    sizesBox.appendChild(b);
  }

  document.querySelectorAll('[data-export]').forEach((b) => {
    b.addEventListener('click', async () => {
      state.sizeId = b.dataset.export;
      changed();
      await downloadCover(state, `vice-cover-${b.dataset.export}.png`);
    });
  });
}

// Screenshot scenes (?shot=cover|editor|portrait|square) load a demo scene
// and, for the pure cover shots, hide the studio chrome. __shotReady flips
// once every panel photo and both poster fonts are in, so the camera never
// catches a half-loaded cover.
function markReadyWhenLoaded() {
  const check = () => {
    const imgsDone = state.panels.every(
      (p) => !p.img || (p.img.complete && p.img.naturalWidth > 0),
    );
    if (imgsDone && document.fonts && document.fonts.status === 'loaded') {
      render();
      window.__shotReady = true;
    } else {
      setTimeout(check, 120);
    }
  };
  check();
}

function init() {
  buildControls();
  buildPanelCards(document.getElementById('panels'), stage);
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    applyScene(shot);
    if (shot !== 'editor') document.body.classList.add('shot-cover');
    markReadyWhenLoaded();
  } else {
    applyScene('editor');
  }
  onChange(scheduleRender);
  render();
  syncControls();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render());
}

init();
