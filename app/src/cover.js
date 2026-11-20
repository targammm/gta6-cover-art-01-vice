// Vice Cover Maker v3 — the cover renderer. Pure canvas drawing from a
// state object plus an image map (photoId -> HTMLImageElement). Rendering
// is deterministic: the grain, halftone and barcode all come from a seeded
// PRNG, so the same state always produces the same pixels — the entry
// program's two runs and every screenshot depend on that.

import {
  PANEL_CELLS, ROLES, GRADES, SIZES, SIZE_ORDER,
  BADGE_TOP, BADGE_BOTTOM, PILL_TEXT, MICRO_TEXT,
} from './config.js';

// Small seeded PRNG (mulberry32): fast, stable across browsers and runs.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromText(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Panel rectangles in pixels for a cover of w x h: each layout cell inset
// by half the gutter, so neighbouring panels share one clean gap.
export function panelRects(w, h) {
  const g = Math.max(4, Math.round(Math.min(w, h) * 0.011));
  return PANEL_CELLS.map((c) => {
    const left = c.x0 > 0 ? g / 2 : 0;
    const right = c.x1 < 1 ? g / 2 : 0;
    const top = c.y0 > 0 ? g / 2 : 0;
    const bottom = c.y1 < 1 ? g / 2 : 0;
    return {
      x: Math.round(c.x0 * w + left),
      y: Math.round(c.y0 * h + top),
      w: Math.round((c.x1 - c.x0) * w - left - right),
      h: Math.round((c.y1 - c.y0) * h - top - bottom),
    };
  });
}

// One photo into one panel: cover-fit, then the panel's zoom and offsets
// steer the crop. Offsets are fractions of the overflow, so -0.5..0.5 pans
// from one edge of the photo to the other.
function drawPanelPhoto(ctx, rect, img, panel) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (!img || !img.naturalWidth) {
    const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    grad.addColorStop(0, '#3b1152');
    grad.addColorStop(1, '#170722');
    ctx.fillStyle = grad;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    return;
  }
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(rect.w / iw, rect.h / ih) * panel.zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + panel.ox * (dw - rect.w);
  const dy = rect.y + (rect.h - dh) / 2 + panel.oy * (dh - rect.h);
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

// The grade wash: a translucent three-stop gradient laid over every panel
// so six different photos still read as one poster.
function drawWash(ctx, w, h, grade) {
  const grad = ctx.createLinearGradient(0, 0, w * 0.25, h);
  grad.addColorStop(0, grade.wash[0]);
  grad.addColorStop(0.52, grade.wash[1]);
  grad.addColorStop(1, grade.wash[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// Halftone dots over the hero's lower band, growing as they descend —
// the printed-poster texture of the genre.
function drawHalftone(ctx, hero, grade) {
  const spacing = Math.max(9, hero.w * 0.027);
  const bandTop = hero.y + hero.h * 0.52;
  ctx.save();
  ctx.beginPath();
  ctx.rect(hero.x, bandTop, hero.w, hero.y + hero.h - bandTop);
  ctx.clip();
  ctx.fillStyle = grade.dot;
  ctx.globalAlpha = 0.5;
  for (let row = 0, y = bandTop + spacing / 2; y < hero.y + hero.h; row++, y += spacing) {
    const t = (y - bandTop) / (hero.h * 0.48);
    const r = 0.6 + t * spacing * 0.4;
    const offset = row % 2 ? spacing / 2 : 0;
    for (let x = hero.x + offset + spacing / 2; x < hero.x + hero.w; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Fine deterministic grain across the whole cover.
function drawGrain(ctx, w, h) {
  const rand = mulberry32(20261120);
  const count = Math.min(9000, Math.round((w * h) / 420));
  ctx.save();
  for (let i = 0; i < count; i++) {
    const v = rand();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(rand() * w, rand() * h, 1.5, 1.5);
  }
  ctx.restore();
}

// A soft dark edge so the poster feels printed, not pasted.
function drawVignette(ctx, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const grad = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.36, cx, cy, Math.max(w, h) * 0.74);
  grad.addColorStop(0, 'rgba(8,0,14,0)');
  grad.addColorStop(1, 'rgba(8,0,14,0.40)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// The role chip in a panel's top-left corner: HERO, CHASE, HEIST…
function drawRoleChip(ctx, rect, role, grade, scaleRef) {
  const fontSize = Math.max(11, Math.round(scaleRef * 0.021));
  ctx.save();
  ctx.font = `${fontSize}px "Archivo Black", sans-serif`;
  const textW = ctx.measureText(role).width;
  const padX = fontSize * 0.62;
  const chipW = textW + padX * 2;
  const chipH = fontSize * 1.72;
  const x = rect.x + Math.round(scaleRef * 0.012);
  const y = rect.y + Math.round(scaleRef * 0.012);
  ctx.beginPath();
  ctx.roundRect(x, y, chipW, chipH, chipH * 0.28);
  ctx.fillStyle = grade.chip;
  ctx.fill();
  ctx.fillStyle = grade.line;
  ctx.fillRect(x, y + chipH * 0.18, Math.max(2, fontSize * 0.16), chipH * 0.64);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(role, x + padX, y + chipH / 2 + 1);
  ctx.restore();
}

// Scrim + caption + sub-caption across the hero's lower half. The caption
// is Anton, auto-fitted to the hero, filled with a pink-to-orange gradient,
// outlined dark and thrown against a soft neon glow.
function drawHeroText(ctx, hero, state, grade) {
  const bottom = hero.y + hero.h;
  const scrimH = hero.h * 0.54;
  const scrim = ctx.createLinearGradient(0, bottom - scrimH, 0, bottom);
  scrim.addColorStop(0, 'rgba(12,2,20,0)');
  scrim.addColorStop(1, 'rgba(12,2,20,0.84)');
  ctx.fillStyle = scrim;
  ctx.fillRect(hero.x, bottom - scrimH, hero.w, scrimH);

  const caption = (state.caption || '').trim().toUpperCase() || 'VICE CITY';
  let size = hero.w * 0.185;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const setFont = (s) => {
    ctx.font = `${s}px Anton, sans-serif`;
  };
  setFont(size);
  while (size > 12 && ctx.measureText(caption).width > hero.w * 0.9) {
    size *= 0.94;
    setFont(size);
  }
  const cx = hero.x + hero.w / 2;
  const captionBase = bottom - hero.h * 0.155;
  const fill = ctx.createLinearGradient(0, captionBase - size, 0, captionBase);
  fill.addColorStop(0, '#ff5c8a');
  fill.addColorStop(0.55, '#ff2e7e');
  fill.addColorStop(1, '#ff9a3d');
  ctx.save();
  ctx.shadowColor = grade.glow;
  ctx.shadowBlur = size * 0.24;
  ctx.lineWidth = Math.max(2, size * 0.05);
  ctx.strokeStyle = 'rgba(22,2,28,0.92)';
  ctx.strokeText(caption, cx, captionBase);
  ctx.fillStyle = fill;
  ctx.fillText(caption, cx, captionBase);
  ctx.fillText(caption, cx, captionBase);
  ctx.restore();

  const sub = (state.sub || '').trim().toUpperCase();
  if (sub) {
    const subSize = Math.max(11, Math.round(size * 0.205));
    ctx.save();
    ctx.font = `${subSize}px "Archivo Black", sans-serif`;
    try {
      ctx.letterSpacing = `${Math.round(subSize * 0.32)}px`;
    } catch {
      /* letterSpacing is a progressive enhancement only */
    }
    ctx.fillStyle = '#ffd7e8';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = subSize * 0.3;
    ctx.fillText(sub, cx, bottom - hero.h * 0.052);
    ctx.restore();
  }
}

// The circular seal at the hero's top-right: gold ring, EST. 2026 over
// LEONIDA, like a stamp on the poster.
function drawBadge(ctx, hero, scaleRef) {
  const r = Math.min(hero.w, hero.h) * 0.115;
  const cx = hero.x + hero.w - r - scaleRef * 0.018;
  const cy = hero.y + r + scaleRef * 0.018;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(16,4,26,0.80)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.strokeStyle = '#ffd76a';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, r * 0.025);
  ctx.strokeStyle = 'rgba(255,215,106,0.6)';
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd76a';
  ctx.font = `${Math.round(r * 0.26)}px "Archivo Black", sans-serif`;
  ctx.fillText(BADGE_TOP, cx, cy - r * 0.3);
  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.round(r * 0.42)}px Anton, sans-serif`;
  ctx.fillText(BADGE_BOTTOM, cx, cy + r * 0.28);
  ctx.restore();
}

// The pill at the cover's bottom-right corner.
function drawPill(ctx, w, h, grade) {
  const fontSize = Math.max(12, Math.round(Math.min(w, h) * 0.02));
  ctx.save();
  ctx.font = `${fontSize}px "Archivo Black", sans-serif`;
  const textW = ctx.measureText(PILL_TEXT).width;
  const padX = fontSize * 0.85;
  const pillW = textW + padX * 2;
  const pillH = fontSize * 1.9;
  const x = w - pillW - Math.round(w * 0.016);
  const y = h - pillH - Math.round(h * 0.016);
  ctx.beginPath();
  ctx.roundRect(x, y, pillW, pillH, pillH / 2);
  ctx.fillStyle = 'rgba(14,3,24,0.82)';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, fontSize * 0.09);
  ctx.strokeStyle = grade.line;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(PILL_TEXT, x + pillW / 2, y + pillH / 2 + 1);
  ctx.restore();
}

// A deterministic barcode at the cover's bottom-left, seeded by the
// caption so each poster's code is its own, with the microtext under it.
function drawBarcode(ctx, w, h, state) {
  const bw = w * 0.17;
  const bh = h * 0.052;
  const x = Math.round(w * 0.016);
  const y = Math.round(h - h * 0.016 - bh - h * 0.026);
  ctx.save();
  ctx.fillStyle = 'rgba(10,2,18,0.78)';
  ctx.fillRect(x - 6, y - 5, bw + 12, bh + 10);
  const rand = mulberry32(seedFromText((state.caption || 'VICE CITY').toUpperCase()));
  ctx.fillStyle = '#f5f0fa';
  let bx = x;
  while (bx < x + bw - 2) {
    const barW = 1 + rand() * Math.max(2, bw * 0.02);
    if (rand() > 0.34) ctx.fillRect(bx, y, barW, bh);
    bx += barW + 1 + rand() * Math.max(2, bw * 0.016);
  }
  const micro = Math.max(9, Math.round(Math.min(w, h) * 0.015));
  ctx.font = `${micro}px "Archivo Black", sans-serif`;
  try {
    ctx.letterSpacing = `${Math.round(micro * 0.22)}px`;
  } catch {
    /* progressive enhancement only */
  }
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(MICRO_TEXT, x, h - Math.round(h * 0.014));
  ctx.restore();
}

// The whole cover, back to front: panels, grade wash, halftone, hero
// dressing, pill, barcode, then grain and vignette over everything.
export function drawCover(ctx, w, h, state, images) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const rects = panelRects(w, h);
  ctx.fillStyle = '#170722';
  ctx.fillRect(0, 0, w, h);

  state.panels.forEach((panel, i) => {
    drawPanelPhoto(ctx, rects[i], images[panel.photoId], panel);
  });
  drawWash(ctx, w, h, grade);
  rects.forEach((rect, i) => {
    ctx.save();
    ctx.strokeStyle = grade.line;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = Math.max(2, Math.round(Math.min(w, h) * 0.0022));
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    drawRoleChip(ctx, rect, ROLES[i], grade, Math.min(w, h));
  });

  const hero = rects[0];
  drawHalftone(ctx, hero, grade);
  drawHeroText(ctx, hero, state, grade);
  drawBadge(ctx, hero, Math.min(w, h));
  drawPill(ctx, w, h, grade);
  drawBarcode(ctx, w, h, state);
  drawGrain(ctx, w, h);
  drawVignette(ctx, w, h);
}

// Render a cover at its export size onto a fresh canvas (used by the PNG
// export and by the sizes sheet).
export function renderCoverCanvas(state, images) {
  const size = SIZES[state.size] || SIZES.square;
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas.getContext('2d'), size.w, size.h, state, images);
  return canvas;
}

// The sizes sheet: the same cover at all three post sizes, side by side,
// each labeled — one frame that proves the export story.
export function drawSizesSheet(ctx, w, h, state, images) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.fillStyle = '#12041e';
  ctx.fillRect(0, 0, w, h);
  const titleSize = Math.round(h * 0.062);
  ctx.save();
  ctx.font = `${titleSize}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fill = ctx.createLinearGradient(0, h * 0.03, 0, h * 0.03 + titleSize);
  fill.addColorStop(0, '#ff5c8a');
  fill.addColorStop(1, '#ff9a3d');
  ctx.fillStyle = fill;
  ctx.fillText('ONE COVER — THREE POST SIZES', w / 2, h * 0.075);
  ctx.restore();

  const pad = w * 0.03;
  const gap = w * 0.024;
  const cellW = (w - pad * 2 - gap * 2) / 3;
  const cellTop = h * 0.15;
  const cellH = h * 0.66;
  SIZE_ORDER.forEach((id, i) => {
    const size = SIZES[id];
    const cellX = pad + i * (cellW + gap);
    const scale = Math.min(cellW / size.w, cellH / size.h);
    const dw = Math.round(size.w * scale);
    const dh = Math.round(size.h * scale);
    const dx = Math.round(cellX + (cellW - dw) / 2);
    const dy = Math.round(cellTop + (cellH - dh) / 2);
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    drawCover(off.getContext('2d'), size.w, size.h, { ...state, size: id }, images);
    ctx.drawImage(off, dx, dy, dw, dh);
    ctx.save();
    ctx.strokeStyle = grade.line;
    ctx.lineWidth = 2;
    ctx.strokeRect(dx, dy, dw, dh);
    ctx.font = `${Math.round(h * 0.034)}px "Archivo Black", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(size.label, cellX + cellW / 2, h * 0.885);
    ctx.restore();
  });
}
