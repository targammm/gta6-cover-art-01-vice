// Vice Cover Maker — shot mode for screenshots: ?shot=cover|editor|portrait.
// No clicks needed: the page loads the named sample, applies the caption and
// size from the URL, and either shows the exported cover full-bleed or the
// editor with the photo already loaded.
function viceParseShot() {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get("shot") || "";
  if (!shot) return null;
  return {
    mode: shot,
    photo: q.get("photo") || "pier",
    size: q.get("size") || (shot === "portrait" ? "1080x1350" : "1920x1080"),
    caption: q.get("caption") || VICE_DEFAULT_CAPTION,
    sub: q.get("sub") || VICE_DEFAULT_SUB,
    grade: q.get("grade") || "sunset",
    layout: q.get("layout") || "trio",
  };
}

function viceApplyShot(state, shot) {
  if (shot.caption) state.caption = shot.caption;
  if (shot.sub) state.subcaption = shot.sub;
  if (shot.grade && VICE_GRADES[shot.grade]) state.grade = shot.grade;
  if (shot.layout && VICE_LAYOUTS[shot.layout]) state.layout = shot.layout;
  const sizeKey = Object.keys(VICE_SIZES).find((k) => {
    const s = VICE_SIZES[k];
    return s.w + "x" + s.h === shot.size;
  });
  if (sizeKey) state.size = sizeKey;
  const sample = VICE_SAMPLES.find((s) => s.id === shot.photo) || VICE_SAMPLES[0];
  const other = VICE_SAMPLES.find((s) => s.id !== sample.id) || VICE_SAMPLES[0];
  state.photos[0].id = sample.id; state.photos[0].src = sample.src; state.photos[0].label = sample.label;
  state.photos[1].id = other.id; state.photos[1].src = other.src; state.photos[1].label = other.label;
  state.photos[2].id = sample.id; state.photos[2].src = sample.src; state.photos[2].label = sample.label;
  state.panels[0].photo = 0;
  state.panels[1].photo = 1;
  state.panels[2].photo = 0;
}

function viceShowExportedCover(state) {
  const size = VICE_SIZES[state.size];
  const off = document.createElement("canvas");
  viceDrawCover(off, state, size.w, size.h);
  const img = document.getElementById("shotImg");
  img.src = off.toDataURL("image/png");
  img.alt = "Exported cover: " + state.caption;
  img.draggable = false;
  document.body.classList.add("shot-mode");
}
