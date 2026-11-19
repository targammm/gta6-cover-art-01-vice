// Vice Cover Maker v2.1 — the editor: panel strip, photo picker, sliders,
// grade/size pickers, upload, fill-all, shuffle and PNG export.
// All work happens locally; no photo ever leaves the browser.

import { SIZES, GRADES, EXPORT_PREFIX } from './config.js';
import { photoChoices, photoLabel, setPanelPhoto, resetPanel, sizeOf } from './state.js';
import { drawCover } from './cover.js';

function el(id) {
  return document.getElementById(id);
}

function thumbFor(state, images, panel) {
  const img = images[panel.photo] ?? null;
  const up = state.uploads[panel.photo];
  const sample = !up;
  const src = sample
    ? (images[`samples/${panel.photo}.jpg`] ? `samples/${panel.photo}.jpg` : null)
    : up.url;
  return { img, src };
}

export function initEditor(state, images, draw) {
  const strip = el('strip');
  const captionInput = el('caption');
  const subInput = el('sub');
  const zoomInput = el('zoom');
  const oxInput = el('ox');
  const oyInput = el('oy');
  const photoSelect = el('photo');
  const panelLabel = el('panelLabel');
  const zoomVal = el('zoomVal');
  const oxVal = el('oxVal');
  const oyVal = el('oyVal');

  function renderStrip() {
    strip.innerHTML = '';
    state.panels.forEach((panel, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'thumb' + (state.selected === i ? ' sel' : '');
      b.setAttribute('aria-label', `Panel ${i + 1}: ${photoLabel(state, panel)}`);
      const im = document.createElement('img');
      const up = state.uploads[panel.photo];
      im.src = up ? up.url : `samples/${panel.photo}.jpg`;
      im.alt = photoLabel(state, panel);
      const tag = document.createElement('span');
      tag.textContent = `${i + 1} · ${photoLabel(state, panel)}`;
      b.append(im, tag);
      b.addEventListener('click', () => {
        state.selected = i;
        syncControls();
        draw();
        renderStrip();
      });
      strip.append(b);
    });
  }

  function syncControls() {
    const panel = state.panels[state.selected];
    panelLabel.textContent = `Panel ${state.selected + 1} — ${photoLabel(state, panel)}`;
    captionInput.value = state.caption;
    subInput.value = state.sub;
    zoomInput.value = String(panel.zoom);
    oxInput.value = String(panel.ox);
    oyInput.value = String(panel.oy);
    zoomVal.textContent = `${panel.zoom.toFixed(2)}×`;
    oxVal.textContent = panel.ox.toFixed(2);
    oyVal.textContent = panel.oy.toFixed(2);
    photoSelect.innerHTML = '';
    for (const c of photoChoices(state)) {
      const o = document.createElement('option');
      o.value = c.id;
      o.textContent = c.label;
      if (c.id === panel.photo) o.selected = true;
      photoSelect.append(o);
    }
    document.querySelectorAll('[data-grade]').forEach((b) => {
      b.classList.toggle('on', b.dataset.grade === state.grade);
    });
    document.querySelectorAll('[data-size]').forEach((b) => {
      b.classList.toggle('on', b.dataset.size === state.size);
    });
  }

  captionInput.addEventListener('input', () => {
    state.caption = captionInput.value;
    draw();
  });
  subInput.addEventListener('input', () => {
    state.sub = subInput.value;
    draw();
  });

  photoSelect.addEventListener('change', () => {
    setPanelPhoto(state, state.selected, photoSelect.value);
    syncControls();
    draw();
    renderStrip();
  });

  el('upload').addEventListener('click', () => el('uploadFile').click());
  el('uploadFile').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.readAsDataURL(file);
    });
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = url;
    });
    const id = `up${++state.uploadSeq}`;
    state.uploads[id] = { label: file.name.replace(/\.[^.]+$/, ''), url };
    images[url] = img;
    setPanelPhoto(state, state.selected, id);
    syncControls();
    draw();
    renderStrip();
  });

  function bindSlider(input, label, apply) {
    input.addEventListener('input', () => {
      apply(Number(input.value));
      syncControls();
      draw();
    });
  }
  bindSlider(zoomInput, zoomVal, (v) => {
    state.panels[state.selected].zoom = v;
  });
  bindSlider(oxInput, oxVal, (v) => {
    state.panels[state.selected].ox = v;
  });
  bindSlider(oyInput, oyVal, (v) => {
    state.panels[state.selected].oy = v;
  });

  document.querySelectorAll('[data-grade]').forEach((b) => {
    b.addEventListener('click', () => {
      state.grade = b.dataset.grade;
      syncControls();
      draw();
    });
  });
  document.querySelectorAll('[data-size]').forEach((b) => {
    b.addEventListener('click', () => {
      state.size = b.dataset.size;
      syncControls();
      draw();
    });
  });

  el('fillall').addEventListener('click', () => {
    const photo = state.panels[state.selected].photo;
    state.panels.forEach((p) => {
      p.photo = photo;
      p.zoom = 1;
      p.ox = 0;
      p.oy = 0;
    });
    syncControls();
    draw();
    renderStrip();
  });

  el('shuffle').addEventListener('click', () => {
    const ids = photoChoices(state).map((c) => c.id);
    state.panels.forEach((p) => {
      p.photo = ids[Math.floor(Math.random() * ids.length)];
      p.zoom = 1;
      p.ox = 0;
      p.oy = 0;
    });
    syncControls();
    draw();
    renderStrip();
  });

  el('reset').addEventListener('click', () => {
    resetPanel(state, state.selected);
    syncControls();
    draw();
    renderStrip();
  });

  el('export').addEventListener('click', () => {
    const s = sizeOf(state);
    const off = document.createElement('canvas');
    off.width = s.w;
    off.height = s.h;
    drawCover(off, state, images);
    off.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${EXPORT_PREFIX}-${s.id}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    }, 'image/png');
  });

  syncControls();
  renderStrip();
}
