// Vice Cover Maker — the editor column.
// Builds one control card per panel (sample picker, photo upload, zoom
// slider) and turns drags on the cover itself into per-panel crop offsets.

import { SAMPLES, changed, setPanelPhoto, setPanelSample, state } from './state.js';
import { layoutFor } from './config.js';
import { fitRect, panelRect } from './cover.js';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

export function buildPanelCards(container, stage) {
  state.panels.forEach((panel, i) => {
    const card = el('div', 'panel-card');
    card.dataset.index = String(i);

    const head = el('div', 'panel-head');
    head.appendChild(el('span', 'panel-name', i === 0 ? 'Background' : `Panel ${i}`));
    head.appendChild(el('span', 'panel-badge', 'Empty'));
    card.appendChild(head);

    const select = el('select', 'panel-sample');
    select.appendChild(new Option('— sample photo —', ''));
    for (const s of SAMPLES) select.appendChild(new Option(s.label, s.id));
    select.addEventListener('change', () => {
      if (select.value) setPanelSample(i, select.value);
    });
    card.appendChild(select);

    const upload = el('label', 'panel-upload', 'Upload your photo');
    const file = el('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.hidden = true;
    file.addEventListener('change', () => {
      if (file.files && file.files[0]) readIntoPanel(i, file.files[0]);
      file.value = '';
    });
    upload.appendChild(file);
    card.appendChild(upload);

    const zoomRow = el('label', 'panel-zoom');
    zoomRow.appendChild(el('span', null, 'Zoom'));
    const zoom = el('input');
    zoom.type = 'range';
    zoom.min = '1';
    zoom.max = '2.6';
    zoom.step = '0.01';
    zoom.value = '1';
    zoom.addEventListener('input', () => {
      panel.zoom = Number(zoom.value);
      changed();
    });
    zoomRow.appendChild(zoom);
    card.appendChild(zoomRow);

    card.addEventListener('pointerdown', () => {
      state.selected = i;
      syncSelection();
    });
    container.appendChild(card);
  });
  wireCanvasDrag(stage);
  syncSelection();
}

// Read a visitor's photo file locally (nothing leaves the browser) and put
// it in the given panel.
export function readIntoPanel(index, file) {
  const reader = new FileReader();
  reader.onload = () => {
    setPanelPhoto(index, String(reader.result), file.name);
    state.selected = index;
    syncSelection();
  };
  reader.readAsDataURL(file);
}

export function refreshBadges() {
  document.querySelectorAll('.panel-card').forEach((card) => {
    const panel = state.panels[Number(card.dataset.index)];
    const badge = card.querySelector('.panel-badge');
    if (badge) badge.textContent = panel.img ? panel.name || 'Photo' : 'Empty';
  });
}

export function syncSelection() {
  document.querySelectorAll('.panel-card').forEach((card) => {
    card.classList.toggle('selected', Number(card.dataset.index) === state.selected);
  });
  refreshBadges();
}

// Which panel sits under a canvas point? Later panels draw over earlier
// ones, so the search runs from the front of the collage to the back.
function panelAt(stage, x, y) {
  const layout = layoutFor(state.sizeId);
  for (let i = layout.length - 1; i >= 0; i--) {
    const r = panelRect(layout, i, stage.width, stage.height);
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return 0;
}

// Dragging on the cover reframes the panel under the pointer: the drag
// distance is converted into the panel's crop offsets using the same
// cover-fit geometry the renderer draws with. Files dropped on the cover
// land in the panel under the drop point.
function wireCanvasDrag(stage) {
  let drag = null;
  const toCanvas = (e) => {
    const b = stage.getBoundingClientRect();
    return {
      x: ((e.clientX - b.left) * stage.width) / b.width,
      y: ((e.clientY - b.top) * stage.height) / b.height,
    };
  };
  stage.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    const i = panelAt(stage, p.x, p.y);
    state.selected = i;
    syncSelection();
    drag = { i, x: p.x, y: p.y };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = toCanvas(e);
    const panel = state.panels[drag.i];
    const rect = panelRect(layoutFor(state.sizeId), drag.i, stage.width, stage.height);
    if (panel.img && panel.img.naturalWidth > 0) {
      const f = fitRect(panel.img, rect, panel.zoom, panel.ox, panel.oy);
      if (f.w > rect.w) panel.ox = clamp(panel.ox + ((p.x - drag.x) * 2) / (f.w - rect.w), -1, 1);
      if (f.h > rect.h) panel.oy = clamp(panel.oy + ((p.y - drag.y) * 2) / (f.h - rect.h), -1, 1);
    }
    drag.x = p.x;
    drag.y = p.y;
    changed();
  });
  const end = () => { drag = null; };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('dragover', (e) => e.preventDefault());
  stage.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    readIntoPanel(panelAt(stage, toCanvas(e).x, toCanvas(e).y), file);
  });
}
