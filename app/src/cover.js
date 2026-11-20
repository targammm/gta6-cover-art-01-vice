// Vice Cover Maker — the cover renderer.
// Paints a state onto a canvas: six photo panels on a deep plum field,
// a colour grade washed over everything, and the dressing that makes
// it read as a game cover — caption, badge, chips, barcode, halftone,
// grain and vignette. Pure canvas 2D, fully deterministic: the only
// randomness comes from seeded streams in state.js.

import { GRADES, SIZES, DEFAULTS } from './config.js';
import { seededRandom } from './state.js';

// Panel rectangles for a W x H cover. The hero takes roughly the top
// left 61% x 61%; two panels stack in the remaining right column; the
// last three split the bottom band. Thin gutters separate everything.
export function panelRects(W, H) {
  const g = Math.max(4, Math.round(Math.min(W, H) * DEFAULTS.gutterRatio));
  const heroW = Math.round((W - g * 3) * 0.61);
  const heroH = Math.round((H - g * 3) * 0.61);
  const rightX = g + heroW + g;
  const rightW = W - rightX - g;
  const stackH = Math.floor((heroH - g) / 2);
  const bottomY = g + heroH + g;
  const bottomH = H - bottomY - g;
  const bottomW = Math.floor((W - g * 4) / 3);
  return [
    { x: g, y: g, w: heroW, h: heroH },
    { x: rightX, y: g, w: rightW, h: stackH },
    { x: rightX, y: g + stackH + g, w: rightW, h: heroH - stackH - g },
    { x: g, y: bottomY, w: bottomW, h: bottomH },
    { x: g + (bottomW + g), y: bottomY, w: bottomW, h: bottomH },
    { x: g + (bottomW + g) * 2, y: bottomY, w: W - g - (g + (bottomW + g) * 2), h: bottomH },
  ];
}

// Draw one photo into a rect with cover-fit cropping: scale so the
// image covers the rect (times the panel zoom), then slide it by the
// panel offsets, expressed as fractions of the overflow.
function drawPanelPhoto(ctx, img, rect, panel) {
  if (!img || !img.naturalWidth) return;
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * panel.zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const maxX = Math.max(0, (dw - rect.w) / 2);
  const maxY = Math.max(0, (dh - rect.h) / 2);
  const dx = rect.x + (rect.w - dw) / 2 + panel.offsetX * 2 * maxX;
  const dy = rect.y + (rect.h - dh) / 2 + panel.offsetY * 2 * maxY;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

// The grade's two washes: a flat tint, then a deepening gradient.
function applyGrade(ctx, W, H, grade) {
  ctx.fillStyle = grade.wash;
  ctx.fillRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, grade.washDeep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

// ---- dressing -------------------------------------------------------

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A small dark chip with the panel's role, top-left of every panel.
function drawRoleChip(ctx, rect, role, grade, unit) {
  const pad = unit * 0.9;
  ctx.font = `700 ${Math.round(unit * 1.5)}px "Archivo Black", sans-serif`;
  const tw = ctx.measureText(role).width;
  const w = tw + pad * 2;
  const h = unit * 2.6;
  const x = rect.x + unit * 0.9;
  const y = rect.y + unit * 0.9;
  ctx.save();
  ctx.fillStyle = 'rgba(16, 4, 20, 0.72)';
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = grade.accent;
  ctx.lineWidth = Math.max(1, unit * 0.16);
  ctx.stroke();
  ctx.fillStyle = '#ffe9f4';
  ctx.textBaseline = 'middle';
  ctx.fillText(role, x + pad, y + h / 2 + unit * 0.12);
  ctx.restore();
}

// Gradient scrim across the hero's lower band so the caption sits on
// shadow, plus a field of halftone dots in the grade's ink colour.
function drawHeroShade(ctx, hero, grade, unit) {
  const bandH = hero.h * 0.52;
  const grad = ctx.createLinearGradient(0, hero.y + hero.h - bandH, 0, hero.y + hero.h);
  grad.addColorStop(0, 'rgba(10, 2, 14, 0)');
  grad.addColorStop(1, 'rgba(10, 2, 14, 0.82)');
  ctx.fillStyle = grad;
  ctx.fillRect(hero.x, hero.y + hero.h - bandH, hero.w, bandH);

  const gap = unit * 1.7;
  const r = unit * 0.34;
  ctx.fillStyle = grade.halftone;
  const rows = Math.floor((hero.h * 0.30) / gap);
  for (let row = 0; row < rows; row++) {
    const y = hero.y + hero.h - unit * 1.2 - row * gap;
    const cols = Math.floor(hero.w / gap);
    for (let col = 0; col < cols; col++) {
      const x = hero.x + gap * 0.6 + col * gap + (row % 2 ? gap / 2 : 0);
      if (x > hero.x + hero.w - gap * 0.4) continue;
      ctx.globalAlpha = 0.16 + 0.5 * (1 - row / Math.max(1, rows));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// The circular badge: gold ring, plum face, two lines of type.
function drawBadge(ctx, hero, unit) {
  const r = unit * 5.4;
  const cx = hero.x + hero.w - r - unit * 1.6;
  const cy = hero.y + r + unit * 1.6;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(24, 6, 28, 0.88)';
  ctx.fill();
  ctx.lineWidth = unit * 0.55;
  ctx.strokeStyle = '#f5c542';
  ctx.stroke();
  ctx.lineWidth = unit * 0.16;
  ctx.strokeStyle = 'rgba(245, 197, 66, 0.65)';
  ctx.beginPath();
  ctx.arc(cx, cy, r - unit * 0.85, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f5c542';
  ctx.textAlign = 'center';
  ctx.font = `${Math.round(unit * 1.9)}px Anton, sans-serif`;
  ctx.fillText('EST. 2026', cx, cy - unit * 0.4);
  ctx.font = `${Math.round(unit * 1.45)}px "Archivo Black", sans-serif`;
  ctx.fillStyle = '#ffe9f4';
  ctx.fillText('LEONIDA', cx, cy + unit * 1.6);
  ctx.restore();
}

// A barcode of seeded-but-fixed bars with microtext under it.
function drawBarcode(ctx, hero, unit) {
  const rand = seededRandom(61026);
  const x0 = hero.x + unit * 1.6;
  const h = unit * 3.4;
  const y = hero.y + hero.h - h - unit * 1.8;
  let x = x0;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 240, 248, 0.92)';
  const bgW = unit * 16.5;
  ctx.fillRect(x0 - unit * 0.7, y - unit * 0.7, bgW, h + unit * 2.6);
  ctx.fillStyle = '#16040f';
  while (x < x0 + bgW - unit * 1.6) {
    const w = unit * (0.22 + rand() * 0.75);
    if (rand() > 0.32) ctx.fillRect(x, y, w, h);
    x += w + unit * (0.18 + rand() * 0.3);
  }
  ctx.font = `${Math.round(unit * 0.8)}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('LEONIDA • VICE CITY • 2026', x0 - unit * 0.2, y + h + unit * 1.5);
  ctx.restore();
}

// The "6 PANELS • 3 SIZES" pill, bottom-right of the whole cover.
function drawPill(ctx, W, H, grade, unit) {
  const label = '6 PANELS • 3 SIZES';
  ctx.font = `700 ${Math.round(unit * 1.5)}px "Archivo Black", sans-serif`;
  const w = ctx.measureText(label).width + unit * 2.6;
  const h = unit * 3.1;
  const x = W - w - unit * 1.6;
  const y = H - h - unit * 1.6;
  ctx.save();
  ctx.fillStyle = 'rgba(16, 4, 20, 0.78)';
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = grade.accent;
  ctx.lineWidth = Math.max(1, unit * 0.16);
  ctx.stroke();
  ctx.fillStyle = '#ffe9f4';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + unit * 1.3, y + h / 2 + unit * 0.1);
  ctx.restore();
}

// Caption and sub-caption over the hero's shaded lower band. The
// caption auto-fits: Anton, shrunk until it fits the hero width, with
// a pink-to-orange (per-grade) gradient fill, a dark outline and a
// neon glow in the grade's glow colour.
function drawCaption(ctx, hero, state, grade, unit) {
  const caption = (state.caption || '').toUpperCase() || 'VICE CITY';
  const cx = hero.x + hero.w / 2;
  let size = unit * 11;
  ctx.save();
  ctx.textAlign = 'center';
  const setFont = (s) => { ctx.font = `${Math.round(s)}px Anton, sans-serif`; };
  setFont(size);
  const maxW = hero.w * 0.92;
  while (ctx.measureText(caption).width > maxW && size > unit * 2) {
    size *= 0.94;
    setFont(size);
  }
  const baseY = hero.y + hero.h - unit * 11.5;
  const grad = ctx.createLinearGradient(hero.x, baseY - size, hero.x + hero.w, baseY);
  grad.addColorStop(0, grade.captionFrom);
  grad.addColorStop(1, grade.captionTo);
  ctx.lineJoin = 'round';
  ctx.shadowColor = grade.glow;
  ctx.shadowBlur = unit * 2.4;
  ctx.strokeStyle = 'rgba(20, 2, 16, 0.95)';
  ctx.lineWidth = size * 0.16;
  ctx.strokeText(caption, cx, baseY);
  ctx.shadowBlur = 0;
  ctx.fillStyle = grad;
  ctx.fillText(caption, cx, baseY);

  const sub = (state.subCaption || '').toUpperCase();
  if (sub) {
    ctx.font = `${Math.round(unit * 1.9)}px "Archivo Black", sans-serif`;
    try { ctx.letterSpacing = `${Math.round(unit * 0.9)}px`; } catch { /* older canvas */ }
    ctx.fillStyle = '#ffd7e8';
    ctx.shadowColor = grade.glow;
    ctx.shadowBlur = unit * 0.8;
    ctx.fillText(sub, cx, baseY + unit * 3.4);
  }
  ctx.restore();
}

// Seeded grain (fixed seed: identical every render) and a vignette.
function drawGrainAndVignette(ctx, W, H, unit) {
  const rand = seededRandom(90210);
  const dots = Math.floor((W * H) / 2600);
  ctx.save();
  for (let i = 0; i < dots; i++) {
    const x = rand() * W;
    const y = rand() * H;
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
    ctx.fillRect(x, y, unit * 0.32, unit * 0.32);
  }
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(8, 0, 10, 0.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Paint the whole cover for a state onto a canvas of the state's size.
export function renderCover(canvas, state, images) {
  const size = SIZES[state.size] || SIZES.square;
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  const W = size.width;
  const H = size.height;
  const unit = Math.min(W, H) / 100;
  const grade = GRADES[state.grade] || GRADES.sunset;

  ctx.fillStyle = DEFAULTS.background;
  ctx.fillRect(0, 0, W, H);

  const rects = panelRects(W, H);
  state.panels.forEach((panel, i) => {
    const img = images.get(panel.custom || panel.src);
    drawPanelPhoto(ctx, img, rects[i], panel);
  });

  applyGrade(ctx, W, H, grade);

  // A bright accent rule under the hero, in the grade's accent colour.
  ctx.fillStyle = grade.accent;
  ctx.fillRect(rects[0].x, rects[0].y + rects[0].h - unit * 0.55, rects[0].w, unit * 0.55);

  drawHeroShade(ctx, rects[0], grade, unit);
  state.panels.forEach((panel, i) => drawRoleChip(ctx, rects[i], panel.role, grade, unit));
  drawBadge(ctx, rects[0], unit);
  drawBarcode(ctx, rects[0], unit);
  drawCaption(ctx, rects[0], state, grade, unit);
  drawPill(ctx, W, H, grade, unit);
  drawGrainAndVignette(ctx, W, H, unit);
  return canvas;
}

// Render to an offscreen canvas and hand back a PNG data URL.
export function exportPng(state, images) {
  const canvas = document.createElement('canvas');
  renderCover(canvas, state, images);
  return canvas.toDataURL('image/png');
}
