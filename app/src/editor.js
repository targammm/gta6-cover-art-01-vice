// Vice Cover Maker v3 — the editor: every DOM control wired to the state,
// with a live canvas preview and a strip of panel thumbnails. All drawing
// goes through cover.js; this module only moves data between the page and
// the state.

import { SIZES, GRADE_ORDER, EXPORT_PREFIX } from './config.js';
import {
  photoChoices, selectedPanel, setPanelPhoto, registerUpload,
  resetPanel, fillAllPanels, shufflePanels,
} from './state.js';
import { drawCover, renderCoverCanvas } from './cover.js';

const $ = (id) => document.getElementById(id);

// A thumbnail is just the panel's photo cover-fitted into a small canvas.
function drawThumb(canvas, img) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#24102f';
  ctx.fillRect(0, 0, w, h);
  if (!img || !img.naturalWidth) return;
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export function initEditor(state, images) {
  const canvas = $('stage');
  const ctx = canvas.getContext('2d');
  const thumbsEl = $('thumbs');

  function redraw() {
    const size = SIZES[state.size];
    if (canvas.width !== size.w || canvas.height !== size.h) {
      canvas.width = size.w;
      canvas.height = size.h;
    }
    drawCover(ctx, size.w, size.h, state, images);
    [...thumbsEl.children].forEach((btn, i) => {
      btn.classList.toggle('active', i === state.selected);
      drawThumb(btn.querySelector('canvas'), images[state.panels[i].photoId]);
    });
  }

  // --- panel thumbnails -------------------------------------------------
  state.panels.forEach((panel, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb';
    const c = document.createElement('canvas');
    c.width = 144;
    c.height = 108;
    btn.appendChild(c);
    const tag = document.createElement('span');
    tag.textContent = 'Panel ' + (i + 1);
    btn.appendChild(tag);
    btn.addEventListener('click', () => {
      state.selected = i;
      syncPanelControls();
      redraw();
    });
    thumbsEl.appendChild(btn);
  });

  // --- control synchronisation ------------------------------------------
  const photoSelect = $('photo');
  function rebuildPhotoOptions() {
    const current = selectedPanel(state).photoId;
    photoSelect.innerHTML = '';
    for (const choice of photoChoices(state)) {
      const opt = document.createElement('option');
      opt.value = choice.id;
      opt.textContent = choice.label;
      photoSelect.appendChild(opt);
    }
    photoSelect.value = current;
  }

  function syncPanelControls() {
    const panel = selectedPanel(state);
    $('panelName').textContent = 'Panel ' + (state.selected + 1) + ' of 6';
    photoSelect.value = panel.photoId;
    $('zoom').value = panel.zoom;
    $('ox').value = panel.ox;
    $('oy').value = panel.oy;
    $('zoomVal').textContent = Number(panel.zoom).toFixed(2) + '×';
    $('oxVal').textContent = Number(panel.ox).toFixed(2);
    $('oyVal').textContent = Number(panel.oy).toFixed(2);
  }

  function syncToggleButtons() {
    document.querySelectorAll('#grades [data-grade]').forEach((b) =>
      b.classList.toggle('active', b.dataset.grade === state.grade),
    );
    document.querySelectorAll('#sizes [data-size]').forEach((b) =>
      b.classList.toggle('active', b.dataset.size === state.size),
    );
  }

  // --- events -------------------------------------------------------------
  $('caption').addEventListener('input', (e) => {
    state.caption = e.target.value;
    redraw();
  });
  $('sub').addEventListener('input', (e) => {
    state.sub = e.target.value;
    redraw();
  });
  document.querySelectorAll('#grades [data-grade]').forEach((b) =>
    b.addEventListener('click', () => {
      state.grade = b.dataset.grade;
      syncToggleButtons();
      redraw();
    }),
  );
  document.querySelectorAll('#sizes [data-size]').forEach((b) =>
    b.addEventListener('click', () => {
      state.size = b.dataset.size;
      syncToggleButtons();
      redraw();
    }),
  );
  photoSelect.addEventListener('change', () => {
    setPanelPhoto(state, state.selected, photoSelect.value);
    redraw();
  });

  const bindSlider = (id, key, valId, format) => {
    $(id).addEventListener('input', (e) => {
      selectedPanel(state)[key] = parseFloat(e.target.value);
      $(valId).textContent = format(selectedPanel(state)[key]);
      redraw();
    });
  };
  bindSlider('zoom', 'zoom', 'zoomVal', (v) => v.toFixed(2) + '×');
  bindSlider('ox', 'ox', 'oxVal', (v) => v.toFixed(2));
  bindSlider('oy', 'oy', 'oyVal', (v) => v.toFixed(2));

  $('fillAll').addEventListener('click', () => {
    fillAllPanels(state, selectedPanel(state).photoId);
    redraw();
  });
  $('shuffle').addEventListener('click', () => {
    shufflePanels(state);
    syncPanelControls();
    redraw();
  });
  $('resetPanel').addEventListener('click', () => {
    resetPanel(state, state.selected);
    syncPanelControls();
    redraw();
  });

  // Upload: read the file locally, keep the object URL in the image map,
  // and point the selected panel at it. Nothing leaves the machine.
  $('uploadBtn').addEventListener('click', () => $('file').click());
  $('file').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const record = registerUpload(state, file.name.replace(/\.[^.]+$/, '') || 'My photo');
      images[record.id] = img;
      setPanelPhoto(state, state.selected, record.id);
      rebuildPhotoOptions();
      syncPanelControls();
      redraw();
    };
    img.src = url;
    e.target.value = '';
  });

  $('export').addEventListener('click', () => {
    const out = renderCoverCanvas(state, images);
    out.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${EXPORT_PREFIX}-${out.width}x${out.height}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  });

  // First paint.
  rebuildPhotoOptions();
  syncPanelControls();
  syncToggleButtons();
  redraw();
}
