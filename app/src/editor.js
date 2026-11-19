// Vice Cover Maker — editor: wires the DOM controls to the store and owns
// the pointer interaction on the preview canvas (drag a panel to pan its
// photo, wheel to zoom). It never draws: every change goes through the store
// and the renderer repaints.
import { LAYOUTS, GRADES, SIZES, SAMPLES } from './config.js';
import { exportCoverPNG } from './cover.js';

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load image: ' + src));
    img.src = src;
  });
}

// Load every photo slot's image (samples or uploaded data URLs) into a map
// slot -> HTMLImageElement. Slots that fail keep their previous image.
export async function loadSlotImages(state, previous = {}) {
  const images = { ...previous };
  for (const [slot, photo] of Object.entries(state.photos)) {
    if (!photo?.src) continue;
    if (previous[slot] && previous[slot].dataset.src === photo.src) continue;
    try {
      const img = await loadImage(photo.src);
      img.dataset.src = photo.src;
      images[slot] = img;
    } catch {
      // Keep the old image (or none) — a missing photo never kills the app.
    }
  }
  return images;
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function segmented(container, options, current, onPick) {
  container.innerHTML = '';
  for (const opt of options) {
    const btn = el('button', 'seg' + (opt.id === current ? ' on' : ''), opt.label);
    btn.type = 'button';
    btn.title = opt.hint || opt.label;
    btn.addEventListener('click', () => onPick(opt.id));
    container.appendChild(btn);
  }
}

export function buildEditor({ store, stage, onExported }) {
  const $ = (sel) => document.querySelector(sel);
  const layoutBox = $('#layoutBox');
  const sizeBox = $('#sizeBox');
  const gradeBox = $('#gradeBox');
  const photoBox = $('#photoBox');
  const captionInput = $('#captionInput');
  const subInput = $('#subInput');
  const posBox = $('#posBox');
  const gutterRange = $('#gutterRange');
  const grainToggle = $('#grainToggle');
  const halftoneToggle = $('#halftoneToggle');
  const vignetteToggle = $('#vignetteToggle');
  const exportBtn = $('#exportBtn');
  const resetBtn = $('#resetBtn');
  const toast = $('#toast');

  let activeSlot = 'hero';
  let images = {};

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function refreshControls(state) {
    segmented(layoutBox, Object.values(LAYOUTS), state.layout, (id) => store.update({ layout: id }));
    segmented(sizeBox, Object.values(SIZES), state.size, (id) => store.update({ size: id }));
    segmented(gradeBox, Object.values(GRADES), state.grade, (id) => store.update({ grade: id }));
    segmented(posBox, [
      { id: 'bottom', label: 'Caption ↓ bottom' },
      { id: 'top', label: 'Caption ↑ top' },
    ], state.captionPos, (id) => store.update({ captionPos: id }));
    if (captionInput.value !== state.caption) captionInput.value = state.caption;
    if (subInput.value !== state.subcaption) subInput.value = state.subcaption;
    gutterRange.value = String(state.gutter ?? 14);
    grainToggle.checked = !!state.grain;
    halftoneToggle.checked = !!state.halftone;
    vignetteToggle.checked = !!state.vignette;
    buildPhotoSlots(state);
  }

  function buildPhotoSlots(state) {
    const layout = LAYOUTS[state.layout] || LAYOUTS.trio;
    const panels = layout.panels(100, 100, 2);
    photoBox.innerHTML = '';
    for (const panel of panels) {
      const slot = panel.id;
      const photo = state.photos[slot] || {};
      const card = el('div', 'slot' + (slot === activeSlot ? ' active' : ''));
      card.appendChild(el('div', 'slot-name', 'PANEL ' + slot.toUpperCase()));
      card.appendChild(el('div', 'slot-photo', photo.name || '—'));
      const row = el('div', 'slot-row');
      const up = el('label', 'up-btn', 'Upload photo');
      const file = el('input');
      file.type = 'file';
      file.accept = 'image/*';
      file.hidden = true;
      file.addEventListener('change', async () => {
        const f = file.files?.[0];
        if (!f) return;
        const dataUrl = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.onerror = () => rej(new Error('read failed'));
          r.readAsDataURL(f);
        });
        store.setPhoto(slot, { src: dataUrl, name: f.name.slice(0, 18), zoom: 1.1, ox: 0, oy: 0 });
        showToast('Photo loaded into ' + slot.toUpperCase() + ' — drag to pan, scroll to zoom.');
      });
      up.appendChild(file);
      row.appendChild(up);
      const sampleBtn = el('button', 'mini', 'Sample ↻');
      sampleBtn.type = 'button';
      sampleBtn.addEventListener('click', () => {
        const keys = Object.keys(SAMPLES);
        const cur = photo.name;
        const next = SAMPLES[keys.find((k) => SAMPLES[k].label !== cur) || keys[0]];
        store.setPhoto(slot, { src: next.src, name: next.label, zoom: 1.15, ox: 0, oy: 0 });
      });
      row.appendChild(sampleBtn);
      card.appendChild(row);
      const zoom = el('input', 'zoom');
      zoom.type = 'range';
      zoom.min = '1';
      zoom.max = '2.5';
      zoom.step = '0.05';
      zoom.value = String(photo.zoom ?? 1);
      zoom.title = 'Zoom';
      zoom.addEventListener('input', () => store.setPhoto(slot, { zoom: Number(zoom.value) }));
      card.appendChild(zoom);
      card.addEventListener('click', (ev) => {
        if (ev.target === file || ev.target === up) return;
        activeSlot = slot;
        refreshControls(store.get());
      });
      photoBox.appendChild(card);
    }
  }

  // Drag on the preview pans the photo of the panel under the pointer;
  // wheel zooms it. Coordinates are mapped from the stage canvas back to
  // cover space, so pan works at any preview scale.
  function panelAt(state, px, py, W, H) {
    const layout = LAYOUTS[state.layout] || LAYOUTS.trio;
    const g = Math.round((state.gutter ?? 14) * (W / 1080));
    const panels = layout.panels(W, H, g);
    return panels.find((p) => px >= p.x && px < p.x + p.w && py >= p.y && py < p.y + p.h) || null;
  }

  let drag = null;
  stage.addEventListener('pointerdown', (ev) => {
    const rect = stage.getBoundingClientRect();
    const W = stage.width;
    const H = stage.height;
    const px = ((ev.clientX - rect.left) / rect.width) * W;
    const py = ((ev.clientY - rect.top) / rect.height) * H;
    const panel = panelAt(store.get(), px, py, W, H);
    if (!panel) return;
    activeSlot = panel.id;
    drag = { slot: panel.id, x: ev.clientX, y: ev.clientY, rect, W, H, panel };
    stage.setPointerCapture(ev.pointerId);
    refreshControls(store.get());
  });
  stage.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    const state = store.get();
    const photo = state.photos[drag.slot];
    if (!photo) return;
    const dx = (ev.clientX - drag.x) / drag.rect.width;
    const dy = (ev.clientY - drag.y) / drag.rect.height;
    store.setPhoto(drag.slot, {
      ox: (photo.ox ?? 0) + (dx * drag.W) / drag.panel.w,
      oy: (photo.oy ?? 0) + (dy * drag.H) / drag.panel.h,
    });
    drag.x = ev.clientX;
    drag.y = ev.clientY;
  });
  stage.addEventListener('pointerup', () => { drag = null; });
  stage.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const state = store.get();
    const photo = state.photos[activeSlot];
    if (!photo) return;
    const next = Math.min(2.5, Math.max(1, (photo.zoom ?? 1) - Math.sign(ev.deltaY) * 0.08));
    store.setPhoto(activeSlot, { zoom: next });
  }, { passive: false });

  captionInput.addEventListener('input', () => store.update({ caption: captionInput.value }));
  subInput.addEventListener('input', () => store.update({ subcaption: subInput.value }));
  gutterRange.addEventListener('input', () => store.update({ gutter: Number(gutterRange.value) }));
  grainToggle.addEventListener('change', () => store.update({ grain: grainToggle.checked }));
  halftoneToggle.addEventListener('change', () => store.update({ halftone: halftoneToggle.checked }));
  vignetteToggle.addEventListener('change', () => store.update({ vignette: vignetteToggle.checked }));
  resetBtn.addEventListener('click', () => {
    store.reset();
    showToast('Reset to the Sunset Heist preset.');
  });

  exportBtn.addEventListener('click', async () => {
    exportBtn.disabled = true;
    exportBtn.textContent = 'Exporting…';
    try {
      const state = store.get();
      const { blob, size } = await exportCoverPNG(state, images, state.size);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vice-cover-${size.id}-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast(`Exported ${size.w}×${size.h} PNG — check your downloads.`);
      onExported?.({ blob, size, url });
    } catch (err) {
      showToast('Export failed: ' + err.message);
    } finally {
      exportBtn.disabled = false;
      exportBtn.textContent = 'Export PNG';
    }
  });

  store.subscribe((state) => refreshControls(state));

  return {
    showToast,
    refreshControls,
    getImages: () => images,
    setImages: (next) => { images = next; },
    getActiveSlot: () => activeSlot,
  };
}

