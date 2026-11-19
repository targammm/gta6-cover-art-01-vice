// Vice Cover Maker v2.1 — draws the six-panel cover onto a canvas.
// Everything is deterministic: the grain uses a seeded generator, so the
// same state always renders the same pixels.

import { PANEL_LAYOUT, BADGE_TOP, BADGE_BOTTOM, PILL_TEXT, gutterFor } from './config.js';
import { gradeOf, photoFile } from './state.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function panelRects(w, h) {
  const g = gutterFor(w);
  return PANEL_LAYOUT.map((p) => ({
    x: Math.round(p.x * w) + (p.x > 0 ? g : 0),
    y: Math.round(p.y * h) + (p.y > 0 ? g : 0),
    w: Math.round(p.w * w) - (p.x > 0 ? g : 0) - (p.x + p.w < 1 ? g : 0),
    h: Math.round(p.h * h) - (p.y > 0 ? g : 0) - (p.y + p.h < 1 ? g : 0),
  }));
}

// Draw one photo into a panel, cover-fit, with the panel's zoom/offset crop.
function drawPhoto(ctx, img, rect, panel) {
  if (!img) return;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(rect.w / iw, rect.h / ih) * panel.zoom;
  const pw = iw * base;
  const ph = ih * base;
  const dx = rect.x + (rect.w - pw) / 2 + panel.ox * rect.w;
  const dy = rect.y + (rect.h - ph) / 2 + panel.oy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, pw, ph);
  ctx.restore();
}

// Halftone dots over the lower band of a rectangle: dot radius grows
// toward the bottom, classic print-poster look.
function halftone(ctx, rect, color) {
  const step = Math.max(10, Math.round(rect.w / 46));
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y + rect.h * 0.55, rect.w, rect.h * 0.45);
  ctx.clip();
  ctx.fillStyle = color;
  for (let y = rect.y + rect.h * 0.55; y < rect.y + rect.h; y += step) {
    const t = (y - (rect.y + rect.h * 0.55)) / (rect.h * 0.45);
    const r = 0.6 + t * (step * 0.42);
    for (let x = rect.x + step / 2; x < rect.x + rect.w; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Fine deterministic grain over the whole canvas.
function grain(ctx, w, h, seed) {
  const rand = mulberry32(seed);
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  const n = Math.round((w * h) / 900);
  for (let i = 0; i < n; i++) {
    ctx.fillRect(rand() * w, rand() * h, 1.6, 1.6);
  }
  ctx.restore();
}

function fitFont(ctx, text, fontName, start, maxWidth) {
  let size = start;
  ctx.font = `${size}px ${fontName}`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${size}px ${fontName}`;
  }
  return size;
}

function drawCaption(ctx, rect, state, grade) {
  const caption = state.caption.trim().toUpperCase();
  const sub = state.sub.trim().toUpperCase();
  const grad = ctx.createLinearGradient(0, rect.y + rect.h * 0.45, 0, rect.y + rect.h);
  grad.addColorStop(0, 'rgba(20, 6, 32, 0)');
  grad.addColorStop(1, 'rgba(20, 6, 32, 0.78)');
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  if (!caption) return;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const capSize = fitFont(ctx, caption, 'Anton, sans-serif', Math.round(rect.w * 0.17), rect.w * 0.92);
  const subSize = sub ? Math.max(12, Math.round(capSize * 0.24)) : 0;
  const gap = sub ? Math.round(capSize * 0.14) : 0;
  // Stack caption + sub so the block's bottom sits just above the hero edge.
  const bottom = rect.y + rect.h - Math.round(rect.h * 0.06);
  const subY = bottom;
  const capY = sub ? subY - subSize - gap : bottom;
  ctx.font = `${capSize}px Anton, sans-serif`;
  ctx.shadowColor = grade.captionShadow;
  ctx.shadowBlur = Math.round(capSize * 0.16);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(caption, rect.x + rect.w / 2, capY);
  ctx.shadowBlur = 0;
  if (sub) {
    ctx.font = `${subSize}px "Archivo Black", sans-serif`;
    ctx.fillStyle = '#ffd9e8';
    ctx.fillText(sub, rect.x + rect.w / 2, subY);
  }
}

// Circular badge, top-right of the hero. v2.1: the two text lines are sized
// to sit comfortably inside the ring, with real padding on every side.
function drawBadge(ctx, rect, grade) {
  const r = Math.round(Math.min(rect.w, rect.h) * 0.16);
  const cx = rect.x + rect.w - r - Math.round(rect.w * 0.04);
  const cy = rect.y + r + Math.round(rect.h * 0.04);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(16, 6, 28, 0.88)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, Math.round(r * 0.07));
  ctx.strokeStyle = '#ffd166';
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd166';
  const topSize = fitFont(ctx, BADGE_TOP, '"Archivo Black", sans-serif', Math.round(r * 0.30), r * 1.30);
  ctx.font = `${topSize}px "Archivo Black", sans-serif`;
  ctx.fillText(BADGE_TOP, cx, cy - topSize * 0.62);
  ctx.fillStyle = '#ffffff';
  const botSize = fitFont(ctx, BADGE_BOTTOM, 'Anton, sans-serif', Math.round(r * 0.34), r * 1.30);
  ctx.font = `${botSize}px Anton, sans-serif`;
  ctx.fillText(BADGE_BOTTOM, cx, cy + botSize * 0.62);
  ctx.restore();
}

function drawPill(ctx, w, h, grade) {
  const text = PILL_TEXT;
  const size = Math.max(13, Math.round(w * 0.016));
  ctx.save();
  ctx.font = `${size}px "Archivo Black", sans-serif`;
  const tw = ctx.measureText(text).width;
  const pw = tw + size * 1.6;
  const ph = size * 2.1;
  const x = w - pw - Math.round(w * 0.02);
  const y = h - ph - Math.round(h * 0.02);
  ctx.beginPath();
  ctx.roundRect(x, y, pw, ph, ph / 2);
  ctx.fillStyle = 'rgba(16, 6, 28, 0.88)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = grade.line;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + pw / 2, y + ph / 2 + 1);
  ctx.restore();
}

export function drawCover(canvas, state, images) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = gradeOf(state);
  const rects = panelRects(w, h);
  ctx.fillStyle = '#14061f';
  ctx.fillRect(0, 0, w, h);
  state.panels.forEach((panel, i) => {
    const img = images[photoFile(state, panel)] ?? null;
    drawPhoto(ctx, img, rects[i], panel);
    ctx.save();
    ctx.strokeStyle = grade.line;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = Math.max(2, Math.round(w * 0.002));
    ctx.strokeRect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);
    ctx.restore();
  });
  // Sunset wash over the whole cover, then halftone on the hero.
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, 'rgba(255, 94, 122, 0)');
  wash.addColorStop(0.55, grade.tint);
  wash.addColorStop(1, 'rgba(123, 45, 139, 0.30)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  halftone(ctx, rects[0], grade.dot);
  drawCaption(ctx, rects[0], state, grade);
  drawBadge(ctx, rects[0], grade);
  drawPill(ctx, w, h, grade);
  grain(ctx, w, h, 20261119);
}

// Three mini covers side by side, for the sizes screenshot.
export function drawSizesSheet(canvas, state, images) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.fillStyle = '#14061f';
  ctx.fillRect(0, 0, w, h);
  const sizes = [
    { w: 1080, h: 1080, label: '1080 × 1080' },
    { w: 1080, h: 1350, label: '1080 × 1350' },
    { w: 1920, h: 1080, label: '1920 × 1080' },
  ];
  const gap = 24;
  const availW = w - gap * 4;
  const cellW = availW / 3;
  const cellH = h - 96;
  sizes.forEach((s, i) => {
    const off = document.createElement('canvas');
    off.width = s.w;
    off.height = s.h;
    drawCover(off, state, images);
    const scale = Math.min(cellW / s.w, cellH / s.h);
    const dw = s.w * scale;
    const dh = s.h * scale;
    const x = gap + i * (cellW + gap) + (cellW - dw) / 2;
    const y = 24 + (cellH - dh) / 2;
    ctx.drawImage(off, x, y, dw, dh);
    ctx.strokeStyle = '#ff2e88';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, dw, dh);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px "Archivo Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.label, x + dw / 2, h - 36);
  });
}
