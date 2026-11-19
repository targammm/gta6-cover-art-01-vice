// Vice Cover Maker v2 — the editor: panel strip, crop sliders, photo upload,
// grade and size pickers. It mutates the shared state and calls onChange so
// the preview repaints; it never draws the cover itself (cover.js owns that).
import { SAMPLES, GRADES, SIZES } from './config.js';
import { clampCrop, fillAllPanels, shufflePanels } from './state.js';

/**
 * Wires the editor controls. `sampleImages` maps sample id to a loaded
 * Image; `uploads` is the caller-owned array of per-panel uploaded Images
 * (or null). Returns helpers the page uses to refresh the strip and to read
 * the six images the cover should paint, uploads winning over samples.
 */
export function createEditor({ elements, state, sampleImages, uploads, onChange }) {
  const el = elements;

  function refreshStrip() {
    el.strip.innerHTML = '';
    state.panels.forEach((panel, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'thumb' + (state.selected === i ? ' selected' : '');
      b.setAttribute('aria-label', `Panel ${i + 1}: ${panel.photo}`);
      const img = document.createElement('img');
      img.alt = '';
      const src = uploads[i] ? uploads[i].src : sampleImages[panel.photo];
      if (src) img.src = src instanceof Image ? src.src : src;
      const tag = document.createElement('span');
      tag.textContent = `${i + 1} · ${uploads[i] ? 'uploaded' : panel.photo}`;
      b.append(img, tag);
      b.addEventListener('click', () => {
        state.selected = i;
        syncCropInputs();
        refreshStrip();
        onChange();
      });
      el.strip.appendChild(b);
    });
  }

  function syncCropInputs() {
    const p = state.panels[state.selected];
    el.zoom.value = p.zoom;
    el.offsetX.value = p.offsetX;
    el.offsetY.value = p.offsetY;
    el.zoomVal.textContent = `${p.zoom.toFixed(2)}×`;
    el.offsetXVal.textContent = `${Math.round(p.offsetX * 100)}%`;
    el.offsetYVal.textContent = `${Math.round(p.offsetY * 100)}%`;
  }

  function getImages() {
    return state.panels.map((panel, i) => uploads[i] || sampleImages[panel.photo] || null);
  }

  el.caption.addEventListener('input', () => { state.caption = el.caption.value; onChange(); });
  el.subcaption.addEventListener('input', () => { state.subcaption = el.subcaption.value; onChange(); });
  el.badge.addEventListener('input', () => { state.badge = el.badge.value; onChange(); });

  el.zoom.addEventListener('input', () => {
    state.panels[state.selected].zoom = Number(el.zoom.value);
    clampCrop(state.panels[state.selected]);
    syncCropInputs();
    onChange();
  });
  el.offsetX.addEventListener('input', () => {
    state.panels[state.selected].offsetX = Number(el.offsetX.value);
    clampCrop(state.panels[state.selected]);
    syncCropInputs();
    onChange();
  });
  el.offsetY.addEventListener('input', () => {
    state.panels[state.selected].offsetY = Number(el.offsetY.value);
    clampCrop(state.panels[state.selected]);
    syncCropInputs();
    onChange();
  });

  el.photoFile.addEventListener('change', () => {
    const file = el.photoFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        uploads[state.selected] = img;
        refreshStrip();
        onChange();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    el.photoFile.value = '';
  });

  el.fillAll.addEventListener('change', () => {
    if (!el.fillAll.value) return;
    fillAllPanels(state, el.fillAll.value);
    uploads.fill(null);
    refreshStrip();
    onChange();
    el.fillAll.value = '';
  });

  el.shuffle.addEventListener('click', () => {
    shufflePanels(state);
    refreshStrip();
    onChange();
  });

  el.gradeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.grade = btn.dataset.grade;
      el.gradeButtons.forEach((b) => b.classList.toggle('active', b === btn));
      onChange();
    });
  });

  el.sizeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.size = btn.dataset.size;
      el.sizeButtons.forEach((b) => b.classList.toggle('active', b === btn));
      onChange();
    });
  });

  const sampleOptions = SAMPLES.map((s) => `<option value="${s.id}">${s.label}</option>`).join('');
  el.fillAll.innerHTML = `<option value="">Fill all panels with…</option>${sampleOptions}`;
  refreshStrip();
  syncCropInputs();

  return { refreshStrip, syncCropInputs, getImages };
}
