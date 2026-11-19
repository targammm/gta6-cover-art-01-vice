// Vice Cover Maker — screenshot presets: ?shot=cover|editor|portrait|sizes
// drives the app into a fixed, photo-loaded state so the screenshots are
// deterministic and show the app exactly as a user would see it. The cover
// presets export through the same exportCoverPNG the Export button uses and
// display the PNG the app wrote — never a mock-up.
import { SIZES } from './config.js';
import { exportCoverPNG, renderCover } from './cover.js';
import { loadSlotImages } from './editor.js';

function setBodyMode(mode) {
  document.body.dataset.shot = mode;
  document.title = 'Vice Cover Maker — ' + mode;
}

function showExportedPNG(blob, size, label) {
  const url = URL.createObjectURL(blob);
  document.body.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.style.cssText = 'margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0b0b12;';
  const img = document.createElement('img');
  img.src = url;
  img.alt = label;
  img.style.cssText = 'max-width:100vw;max-height:100vh;object-fit:contain;display:block;';
  img.dataset.exported = 'true';
  img.dataset.size = `${size.w}x${size.h}`;
  wrap.appendChild(img);
  document.body.appendChild(wrap);
  return img;
}

// Wait until the named webfonts are actually loaded: a screenshot taken
// before Anton arrives would show fallback lettering.
export async function waitForFonts() {
  try {
    await Promise.all([
      document.fonts.load('400 80px Anton'),
      document.fonts.load("400 40px 'Archivo Black'"),
    ]);
    await document.fonts.ready;
  } catch {
    // Fallback lettering is still legible; never block on fonts.
  }
}

export async function applyShotMode(store, images) {
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (!shot) return null;
  const caption = params.get('caption');
  const photo = params.get('photo');
  if (caption) store.update({ caption: decodeURIComponent(caption) });
  if (photo) {
    const src = photo === 'pier' ? 'samples/pier.jpg' : 'samples/boulevard.jpg';
    const name = photo === 'pier' ? 'Pier' : 'Boulevard';
    store.update({
      photos: {
        hero: { src, name, zoom: 1.15, ox: 0, oy: 0, focus: 'top' },
        left: { src: 'samples/boulevard.jpg', name: 'Boulevard', zoom: 1.2, ox: 0.05, oy: 0, focus: 'top' },
        right: { src, name, zoom: 1.35, ox: -0.06, oy: 0, focus: 'top' },
      },
    });
    // The preset swapped photos after boot loaded the defaults: reload so
    // the export uses the preset's images, not the stale ones.
    images = await loadSlotImages(store.get(), images);
  }
  if (shot === 'cover' || shot === 'portrait') {
    const sizeId = shot === 'portrait' ? 'portrait' : (params.get('size') || store.get().size);
    store.update({ size: sizeId });
    setBodyMode(shot);
    await waitForFonts();
    const { blob, size } = await exportCoverPNG(store.get(), images, sizeId);
    const img = showExportedPNG(blob, size, `Exported ${size.w}x${size.h} cover`);
    await new Promise((res) => { img.onload = res; img.onerror = res; });
    return shot;
  }
  if (shot === 'sizes') {
    setBodyMode('sizes');
    await waitForFonts();
    await renderSizeSheet(store, images);
    return shot;
  }
  if (shot === 'editor') {
    setBodyMode('editor');
    await waitForFonts();
    return shot;
  }
  return null;
}

// The sizes sheet: the same cover rendered at all three export sizes, side
// by side, with their dimensions labelled — the "fast and easy" criterion in
// one frame.
async function renderSizeSheet(store, images) {
  const state = store.get();
  const sheet = document.createElement('div');
  sheet.className = 'size-sheet';
  sheet.appendChild(Object.assign(document.createElement('h2'), { textContent: 'One cover · three post sizes · one click' }));
  const row = document.createElement('div');
  row.className = 'size-row';
  for (const size of Object.values(SIZES)) {
    const cell = document.createElement('figure');
    const canvas = document.createElement('canvas');
    canvas.width = size.w;
    canvas.height = size.h;
    renderCover(canvas.getContext('2d'), state, images, size.w, size.h);
    const cap = document.createElement('figcaption');
    cap.textContent = `${size.label}`;
    cell.append(canvas, cap);
    row.appendChild(cell);
  }
  sheet.appendChild(row);
  const main = document.querySelector('main');
  main.innerHTML = '';
  main.appendChild(sheet);
}
