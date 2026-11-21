// Vice Cover Maker — the canvas renderer.
// Draws the six-panel composition, the colour grade and the poster lettering
// onto any 2D context at the requested size, and turns the result into a
// downloadable PNG. The editor preview and the PNG export are the same
// drawing at the same size, so what you see is exactly what you save.

import { GAP, gradeById, layoutFor, sizeById } from './config.js';

// Where a panel's window lands on a W×H canvas, inset by half the gap so
// neighbouring windows share a single seam of background.
export function panelRect(layout, index, W, H) {
  const r = layout[index];
  if (index === 0) return { x: 0, y: 0, w: W, h: H };
  const gx = GAP * W;
  const gy = GAP * W;
  return {
    x: r.x * W + gx / 2,
    y: r.y * H + gy / 2,
    w: r.w * W - gx,
    h: r.h * H - gy,
  };
}

// Cover-fit geometry: scale the image so it fills the window, then let the
// panel's zoom and drag offsets choose which part of the excess shows.
export function fitRect(img, rect, zoom, ox, oy) {
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const x = rect.x + (rect.w - w) / 2 + (ox * (w - rect.w)) / 2;
  const y = rect.y + (rect.h - h) / 2 + (oy * (h - rect.h)) / 2;
  return { x, y, w, h };
}

// An empty panel still shows the house style: a sunset wash and its name.
function placeholder(ctx, rect, label, W) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, '#2b1055');
  g.addColorStop(0.55, '#7597de');
  g.addColorStop(1, '#ff7e5f');
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.font = `400 ${Math.max(13, W * 0.017)}px 'Archivo Black', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((label || 'DROP A PHOTO').toUpperCase(), rect.x + rect.w / 2, rect.y + rect.h / 2);
}

function drawPanel(ctx, panel, rect, grade, W) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (panel.img && panel.img.complete && panel.img.naturalWidth > 0) {
    const f = fitRect(panel.img, rect, panel.zoom, panel.ox, panel.oy);
    ctx.filter = grade.filter;
    ctx.drawImage(panel.img, f.x, f.y, f.w, f.h);
    ctx.filter = 'none';
  } else {
    placeholder(ctx, rect, panel.name, W);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(2, W * 0.0035);
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

// The grade's light over the finished collage: a soft-light wash in the
// grade's three colours, a shade pooling at the foot, and a vignette.
function applyGrade(ctx, grade, W, H) {
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, grade.wash[0]);
  wash.addColorStop(0.5, grade.wash[1]);
  wash.addColorStop(1, grade.wash[2]);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  const shade = ctx.createLinearGradient(0, H * 0.5, 0, H);
  shade.addColorStop(0, 'rgba(10, 4, 24, 0)');
  shade.addColorStop(1, `rgba(10, 4, 24, ${grade.shade})`);
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, H);
  const vig = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.36,
    W / 2, H / 2, Math.max(W, H) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, `rgba(5, 2, 16, ${grade.vignette})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Shrink a font size until the text fits the cover's width.
function fitFont(ctx, text, family, startPx, maxWidth) {
  let px = startPx;
  while (px > 10) {
    ctx.font = `${px}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    px -= 2;
  }
  return px;
}

// Poster lettering: the caption in Anton with a thick dark outline, a warm
// gradient fill and a soft drop shadow; the subtitle in letterspaced
// Archivo Black underneath it.
function drawLettering(ctx, st, W, H) {
  const caption = (st.caption || '').toUpperCase();
  const subtitle = (st.subtitle || '').toUpperCase();
  if (!caption) return;
  const top = st.captionPos === 'top';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const px = fitFont(ctx, caption, `'Anton', sans-serif`, H * 0.118 * st.captionSize, W * 0.92);
  ctx.font = `${px}px 'Anton', sans-serif`;
  const y = top ? H * 0.055 + px : H * 0.9;
  const fill = ctx.createLinearGradient(0, y - px, 0, y);
  fill.addColorStop(0, '#ffffff');
  fill.addColorStop(0.7, '#ffe9c4');
  fill.addColorStop(1, '#ffb36b');
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = px * 0.1;
  ctx.shadowOffsetY = px * 0.045;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#180a2c';
  ctx.lineWidth = px * 0.16;
  ctx.strokeText(caption, W / 2, y);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = fill;
  ctx.fillText(caption, W / 2, y);
  if (subtitle) {
    const spx = px * 0.3;
    ctx.font = `${spx}px 'Archivo Black', sans-serif`;
    try { ctx.letterSpacing = `${Math.round(spx * 0.22)}px`; } catch { /* older canvas */ }
    const sy = y + spx * 1.55;
    ctx.lineWidth = spx * 0.14;
    ctx.strokeStyle = 'rgba(24, 10, 44, 0.9)';
    ctx.strokeText(subtitle, W / 2, sy);
    ctx.fillStyle = '#ffe9c9';
    ctx.fillText(subtitle, W / 2, sy);
    try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
  }
  ctx.restore();
}

// Draw the whole cover described by state `st` onto ctx at W×H: background
// first, collage windows over it, then the grade's light, a trim line like
// the printed poster's edge, and the lettering on top of everything.
export function renderCover(ctx, st, W, H) {
  const grade = gradeById(st.gradeId);
  const layout = layoutFor(st.sizeId);
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < layout.length; i++) {
    drawPanel(ctx, st.panels[i], panelRect(layout, i, W, H), grade, W);
  }
  applyGrade(ctx, grade, W, H);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = Math.max(3, W * 0.005);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
  drawLettering(ctx, st, W, H);
}

// Render the current state onto a fresh canvas at the state's own size and
// hand back the PNG blob.
export function exportPNG(st) {
  const size = sizeById(st.sizeId);
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  renderCover(canvas.getContext('2d'), st, size.w, size.h);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

// Save the current cover as a PNG download in the browser.
export async function downloadCover(st, filename) {
  const blob = await exportPNG(st);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
