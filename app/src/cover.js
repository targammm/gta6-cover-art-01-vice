// Vice Cover Maker — the cover renderer. Pure drawing: same state, same pixels.
// Layouts cut the frame into panels; each panel draws its photo cover-fit
// with its own zoom/offset, then the grade, sun, scrim and lettering go on top.
function vicePanelRects(layout, w, h) {
  const g = Math.max(4, Math.round(w * 0.006));
  if (layout === "duo") {
    return [
      { x: 0, y: 0, w: Math.round(w * 0.5) - g, h },
      { x: Math.round(w * 0.5) + g, y: 0, w: w - Math.round(w * 0.5) - g, h },
    ];
  }
  if (layout === "strip") {
    const third = Math.round(w / 3);
    return [
      { x: 0, y: 0, w: third - g, h },
      { x: third + g, y: 0, w: third - g, h },
      { x: third * 2 + g, y: 0, w: w - third * 2 - g, h },
    ];
  }
  // trio: one hero panel left, two stacked on the right.
  const leftW = Math.round(w * 0.62);
  const rightX = leftW + g;
  const rightW = w - rightX;
  const halfH = Math.round(h / 2);
  return [
    { x: 0, y: 0, w: leftW, h },
    { x: rightX, y: 0, w: rightW, h: halfH - g },
    { x: rightX, y: halfH + g, w: rightW, h: h - halfH - g },
  ];
}

function viceDrawPhoto(ctx, img, rect, panel, grade) {
  if (!img) {
    ctx.fillStyle = "#1c1c2a";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    return;
  }
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(rect.w / iw, rect.h / ih) * (panel.zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + (panel.dx || 0) * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + (panel.dy || 0) * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = grade.filter;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function viceGradeWash(ctx, w, h, grade) {
  const sky = ctx.createLinearGradient(0, 0, w, h);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // Sun disc, top right, soft edge.
  const sunR = Math.round(Math.min(w, h) * 0.19);
  const sunX = Math.round(w * 0.82);
  const sunY = Math.round(h * 0.2);
  const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
  sun.addColorStop(0, grade.sun);
  sun.addColorStop(0.7, grade.sun.replace(/[\d.]+\)$/, "0.35)"));
  sun.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2);
  // Bottom scrim so the caption always reads.
  const scrim = ctx.createLinearGradient(0, h * 0.55, 0, h);
  scrim.addColorStop(0, "rgba(5,5,12,0)");
  scrim.addColorStop(1, "rgba(5,5,12,0.82)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, Math.round(h * 0.55), w, Math.round(h * 0.45));
  // Thin neon frame.
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = Math.max(2, Math.round(w * 0.002));
  ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
}

function viceWrapCaption(ctx, text, maxW) {
  const words = String(text || "").toUpperCase().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function viceDrawLettering(ctx, state, w, h) {
  const pad = Math.round(w * 0.045);
  // Place tag, top left.
  const tagSize = Math.max(18, Math.round(h * 0.028));
  ctx.save();
  ctx.font = tagSize + "px 'Archivo Black', sans-serif";
  const tagText = " " + state.place + " ";
  const tagW = ctx.measureText(tagText).width + tagSize * 0.9;
  ctx.fillStyle = "#ff5e3a";
  ctx.fillRect(pad, pad, tagW, tagSize * 1.7);
  ctx.fillStyle = "#fff7ec";
  ctx.textBaseline = "middle";
  ctx.fillText(tagText, pad + tagSize * 0.45, pad + tagSize * 0.88);
  ctx.restore();
  // Main caption, bottom left, tilted a touch.
  const capSize = Math.round(h * (state.size === "portrait" ? 0.115 : 0.15));
  ctx.save();
  ctx.translate(pad, h - pad - capSize * 0.2);
  ctx.rotate(-0.035);
  ctx.font = capSize + "px Anton, 'Arial Narrow', sans-serif";
  ctx.textBaseline = "alphabetic";
  const lines = viceWrapCaption(ctx, state.caption, w - pad * 2);
  const lineH = capSize * 1.02;
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = Math.round(capSize * 0.12);
  ctx.shadowOffsetY = Math.round(capSize * 0.05);
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#0b0b12";
  ctx.lineWidth = Math.max(6, Math.round(capSize * 0.11));
  ctx.fillStyle = "#fff7ec";
  lines.forEach((lineText, i) => {
    const y = -((lines.length - 1 - i) * lineH) - lineH * 0.35;
    ctx.strokeText(lineText, 0, y);
    ctx.fillText(lineText, 0, y);
  });
  ctx.restore();
  // Subcaption under the caption block.
  const subSize = Math.max(16, Math.round(h * 0.032));
  ctx.save();
  ctx.font = subSize + "px 'Archivo Black', sans-serif";
  try { ctx.letterSpacing = Math.round(subSize * 0.22) + "px"; } catch (e) { /* older canvas */ }
  ctx.fillStyle = "#ffb347";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(String(state.subcaption || "").toUpperCase(), pad, h - pad * 0.35);
  ctx.restore();
}

function viceDrawCover(canvas, state, w, h) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = VICE_PALETTE.gutter;
  ctx.fillRect(0, 0, w, h);
  const grade = VICE_GRADES[state.grade];
  const rects = vicePanelRects(state.layout, w, h);
  const count = VICE_LAYOUTS[state.layout].panels;
  for (let i = 0; i < count; i++) {
    const panel = state.panels[i] || state.panels[0];
    const photo = state.photos[panel.photo] || state.photos[0];
    viceDrawPhoto(ctx, photo && photo.img, rects[i], panel, grade);
  }
  viceGradeWash(ctx, w, h, grade);
  viceDrawLettering(ctx, state, w, h);
  return canvas;
}
