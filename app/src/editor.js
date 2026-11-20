// Vice Cover Maker — the editor page.
// Wires the controls around the live canvas: words, grade, size, and
// per-panel photo choice with crop sliders. Every change repaints the
// one preview canvas from the one state object; the panel thumbnail
// strip repaints too, each thumb a miniature cover crop of its panel.

import { GRADES, SAMPLES, SIZES } from './config.js';
import { fillAll, loadStateImages, resetState, shufflePanels } from './state.js';
import { exportPng, panelRects, renderCover } from './cover.js';

const $ = (id) => document.getElementById(id);

export function initEditor(state) {
  const canvas = $('preview');
  const thumbs = $('thumbs');
  let images = new Map();
  let activePanel = 0;
  let ready = false;

  async function reloadImages() {
    images = await loadStateImages(state);
    ready = true;
    paint();
  }

  function paint() {
    if (!ready) return;
    renderCover(canvas, state, images);
    paintThumbs();
  }

  // Each thumbnail shows its panel's photo under the same crop the
  // cover uses, so the strip reads as a contact sheet of the layout.
  function paintThumbs() {
    thumbs.replaceChildren();
    const rects = panelRects(360, 360);
    state.panels.forEach((panel, i) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'thumb' + (i === activePanel ? ' active' : '');
      const mini = document.createElement('canvas');
      mini.width = 120;
      mini.height = 90;
      const ctx = mini.getContext('2d');
      const img = images.get(panel.custom || panel.src);
      if (img && img.naturalWidth) {
        const rect = { x: 0, y: 0, w: mini.width, h: mini.height };
        const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * panel.zoom;
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (rect.w - dw) / 2, (rect.h - dh) / 2, dw, dh);
      }
      const tag = document.createElement('span');
      tag.textContent = panel.role;
      cell.append(mini, tag);
      cell.addEventListener('click', () => selectPanel(i));
      thumbs.append(cell);
      void rects;
    });
  }

  function selectPanel(i) {
    activePanel = i;
    syncPanelControls();
    paintThumbs();
  }

  // ---- control wiring (part 2) -------------------------------------

  function syncPanelControls() {
    const panel = state.panels[activePanel];
    $('panel-photo').value = panel.custom ? 'custom' : panel.src;
    $('zoom').value = String(panel.zoom);
    $('offset-x').value = String(panel.offsetX);
    $('offset-y').value = String(panel.offsetY);
    syncReadouts();
  }

  function syncReadouts() {
    const panel = state.panels[activePanel];
    $('zoom-out').textContent = panel.zoom.toFixed(2) + '×';
    $('offset-x-out').textContent = panel.offsetX.toFixed(2);
    $('offset-y-out').textContent = panel.offsetY.toFixed(2);
    $('panel-name').textContent = panel.role;
  }

  function buildControls() {
    const photoSel = $('panel-photo');
    for (const s of SAMPLES) {
      const opt = document.createElement('option');
      opt.value = s.src;
      opt.textContent = s.label;
    photoSel.append(opt);
    }
    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = 'Your upload';
    photoSel.append(customOpt);

    const gradeRow = $('grades');
    for (const g of Object.values(GRADES)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = g.label;
      b.className = 'chip-btn' + (state.grade === g.id ? ' active' : '');
      b.addEventListener('click', () => {
        state.grade = g.id;
        gradeRow.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
        paint();
      });
      gradeRow.append(b);
    }

    const sizeRow = $('sizes');
    for (const s of Object.values(SIZES)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = `${s.label} ${s.width}×${s.height}`;
      b.className = 'chip-btn' + (state.size === s.id ? ' active' : '');
      b.addEventListener('click', () => {
        state.size = s.id;
        sizeRow.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
        paint();
      });
      sizeRow.append(b);
    }
  }

  function wireInputs() {
    $('caption').addEventListener('input', (e) => { state.caption = e.target.value; paint(); });
    $('sub-caption').addEventListener('input', (e) => { state.subCaption = e.target.value; paint(); });
    $('panel-photo').addEventListener('change', (e) => {
      const panel = state.panels[activePanel];
      if (e.target.value !== 'custom') { panel.src = e.target.value; panel.custom = null; }
      reloadImages();
    });
    $('upload').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.panels[activePanel].custom = String(reader.result);
        syncPanelControls();
        reloadImages();
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
    const bindSlider = (id, key) => {
      $(id).addEventListener('input', (e) => {
        state.panels[activePanel][key] = Number(e.target.value);
        syncReadouts();
        paint();
      });
    };
    bindSlider('zoom', 'zoom');
    bindSlider('offset-x', 'offsetX');
    bindSlider('offset-y', 'offsetY');
    $('fill-all').addEventListener('click', () => { fillAll(state); reloadImages(); });
    $('shuffle').addEventListener('click', () => { shufflePanels(state); reloadImages(); });
    $('reset').addEventListener('click', () => {
      resetState(state);
      $('caption').value = state.caption;
      $('sub-caption').value = state.subCaption;
      activePanel = 0;
      syncPanelControls();
      reloadImages();
    });
    $('export').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = exportPng(state, images);
      a.download = `vice-cover-${state.size}.png`;
      a.click();
    });
  }

  buildControls();
  wireInputs();
  syncPanelControls();
  // Repaint when the display fonts land: the first paint can beat
  // Anton to the canvas, and the caption must not stay in fallback.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => paint());
  }
  return reloadImages();
}
