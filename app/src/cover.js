// Vice Cover Maker v2 — the cover renderer. One function draws the whole
// six-panel cover into any 2D context at any size, so the live preview, the
// PNG export and the sizes sheet all paint the exact same art. Everything is
// deterministic: the grain uses a seeded generator, so two exports of the
// same state are byte-identical.
import { SIZES, GRADES, layoutFor, FONTS } from './config.js';

/** Seeded generator, so grain and halftone never change between renders. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Cover-fit a photo into a rect, honouring the panel's zoom and offsets. */
function drawPhoto(ctx, img, rect, panel) {
  if (!img) {
    ctx.fillStyle = '#3b1d5e';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    return;
  }
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(rect.w / iw, rect.h / ih) * panel.zoom;
  const pw = iw * scale;
  const ph = ih * scale;
  const dx = rect.x + (rect.w - pw) / 2 + panel.offsetX * rect.w;
  const dy = rect.y + (rect.h - ph) / 2 + panel.offsetY * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, pw, ph);
  ctx.restore();
}

/** Halftone dots growing toward the bottom of a strip, in one colour. */
function drawHalftone(ctx, x, y, w, h, color, strength, seed) {
  const rand = rng(seed);
  const step = Math.max(10, Math.round(w / 48));
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.55 * strength;
  for (let yy = y; yy < y + h; yy += step) {
    const t = (yy - y) / h;
    const r = step * 0.12 + t * step * 0.38;
    const shift = (Math.round(yy / step) % 2) * step / 2;
    for (let xx = x + shift; xx < x + w; xx += step) {
      ctx.beginPath();
      ctx.arc(xx + (rand() - 0.5) * 2, yy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

let noiseCanvas = null;

/** A 128px seeded-noise tile, reused as the cover's film grain. */
function grainPattern(ctx) {
  if (!noiseCanvas) {
    noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 128;
    noiseCanvas.height = 128;
    const nctx = noiseCanvas.getContext('2d');
    const img = nctx.createImageData(128, 128);
    const rand = rng(20261119);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(rand() * 255);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    nctx.putImageData(img, 0, 0);
  }
  return ctx.createPattern(noiseCanvas, 'repeat');
}

/** Shrink a font until the text fits maxWidth; returns the size used. */
function fitFont(ctx, text, family, weight, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 12) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

/**
 * Draws the cover into ctx at W x H from state and the six loaded images
 * (images[i] is the photo for panel i, or null while it loads).
 */
export function drawCover(ctx, W, H, state, images) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const layout = layoutFor(state.size);
  const g = Math.max(2, Math.round(W * 0.004));
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, W, H);

  layout.panels.forEach((frac, i) => {
    const rect = {
      x: frac.x * W + g,
      y: frac.y * H + g,
      w: frac.w * W - g * 2,
      h: frac.h * H - g * 2,
    };
    drawPhoto(ctx, images[i], rect, state.panels[i]);
    const tint = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    tint.addColorStop(0, grade.tintTop);
    tint.addColorStop(1, grade.tintBottom);
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    ctx.fillStyle = tint;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = Math.max(1, W * 0.0015);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });

  const hero = layout.panels[0];
  drawHalftone(
    ctx,
    hero.x * W, (hero.y + hero.h * 0.55) * H,
    hero.w * W, hero.h * H * 0.45,
    '#ffffff', grade.halftone, 7,
  );

  const band = layout.band;
  const bx = band.x * W;
  const by = band.y * H;
  const bw = band.w * W;
  const bh = band.h * H;
  const bandGrad = ctx.createLinearGradient(bx, by, bx + bw, by);
  bandGrad.addColorStop(0, grade.band[0]);
  bandGrad.addColorStop(0.55, grade.band[1]);
  bandGrad.addColorStop(1, grade.band[2]);
  ctx.fillStyle = bandGrad;
  ctx.fillRect(bx, by, bw, bh);
  drawHalftone(ctx, bx, by, bw, bh * 0.4, '#ffffff', grade.halftone * 0.6, 21);

  const pad = W * 0.04;
  const caption = (state.caption || 'VICE CITY').trim().toUpperCase();
  const capSize = fitFont(ctx, caption, FONTS.display, 400, bw - pad * 2, bh * 0.52);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = capSize * 0.12;
  ctx.shadowOffsetY = capSize * 0.04;
  ctx.fillText(caption, bx + pad, by + bh * 0.56);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  const subSize = Math.max(12, Math.round(bh * 0.13));
  ctx.font = `400 ${subSize}px ${FONTS.body}`;
  try { ctx.letterSpacing = `${Math.max(2, subSize * 0.22)}px`; } catch (e) { /* older canvas */ }
  ctx.fillStyle = grade.accent;
  ctx.fillText((state.subcaption || '').trim().toUpperCase(), bx + pad, by + bh * 0.82);
  try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }

  const pill = '6 PANELS • 3 SIZES';
  ctx.font = `400 ${Math.max(11, Math.round(bh * 0.11))}px ${FONTS.body}`;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText(pill, bx + bw - pad, by + bh * 0.82);
  ctx.textAlign = 'left';

  const badgeR = Math.min(W, H) * 0.082;
  const badgeX = W - badgeR - W * 0.02;
  const badgeY = badgeR + H * 0.02;
  ctx.save();
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10, 4, 20, 0.88)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, badgeR * 0.07);
  ctx.strokeStyle = grade.accent;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR * 0.82, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, badgeR * 0.03);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  const words = (state.badge || 'EST. 2026 • LEONIDA').split('•').map((s) => s.trim());
  const lineH = badgeR * 0.42;
  ctx.font = `400 ${Math.round(badgeR * 0.3)}px ${FONTS.body}`;
  ctx.fillText(words[0] || 'EST. 2026', badgeX, badgeY - lineH * 0.3);
  ctx.font = `400 ${Math.round(badgeR * 0.34)}px ${FONTS.display}`;
  ctx.fillStyle = grade.accent;
  ctx.fillText(words[1] || 'LEONIDA', badgeX, badgeY + lineH * 0.75);
  ctx.textAlign = 'left';
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = grainPattern(ctx);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const vig = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.45,
    W / 2, H / 2, Math.max(W, H) * 0.75,
  );
  vig.addColorStop(0, 'rgba(20, 0, 30, 0)');
  vig.addColorStop(1, 'rgba(20, 0, 30, 0.35)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = Math.max(3, W * 0.006);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
}

/** Renders the cover for a size into a fresh canvas and returns it. */
export function renderCoverToCanvas(state, images, sizeKey) {
  const size = SIZES[sizeKey] || SIZES.square;
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const next = { ...state, size: sizeKey };
  drawCover(canvas.getContext('2d'), size.w, size.h, next, images);
  return canvas;
}

/** Draws the three export sizes side by side on a 1280 x 720 sheet. */
export function drawSizesSheet(ctx, W, H, state, images) {
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  const titleSize = fitFont(ctx, 'THREE SIZES — ONE COVER', FONTS.display, 400, W * 0.9, 64);
  ctx.fillText('THREE SIZES — ONE COVER', W / 2, 84);
  const slots = [
    { key: 'square', x: 24, y: 130, w: 320, h: 320 },
    { key: 'portrait', x: 380, y: 130, w: 256, h: 320 },
    { key: 'landscape', x: 672, y: 130, w: 584, h: 320 },
  ];
  slots.forEach((slot) => {
    const cover = renderCoverToCanvas(state, images, slot.key);
    ctx.drawImage(cover, slot.x, slot.y, slot.w, slot.h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
    ctx.font = `400 22px ${FONTS.body}`;
    ctx.fillStyle = '#ffd166';
    ctx.fillText(SIZES[slot.key].label, slot.x + slot.w / 2, slot.y + slot.h + 44);
  });
  ctx.font = `400 24px ${FONTS.body}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('Pick a size, hit export — the PNG is ready to post.', W / 2, 560);
  ctx.textAlign = 'left';
}
