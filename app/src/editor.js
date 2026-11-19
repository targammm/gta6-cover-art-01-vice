// Vice Cover Maker — editor wiring: controls, uploads, sliders, export.
// The preview canvas re-renders on every state change; export renders the
// same drawCover call at full post size and downloads the PNG.
function viceEl(id) { return document.getElementById(id); }

function viceMakeButtons(container, entries, current, onPick) {
  container.innerHTML = "";
  for (const [key, entry] of entries) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (key === current ? " on" : "");
    btn.textContent = entry.label || entry;
    btn.addEventListener("click", () => onPick(key));
    container.appendChild(btn);
  }
}

function viceRefreshButtons(state) {
  viceMakeButtons(viceEl("layoutRow"), Object.entries(VICE_LAYOUTS), state.layout, (k) => {
    state.layout = k; viceSyncEditor(state);
  });
  viceMakeButtons(viceEl("gradeRow"), Object.entries(VICE_GRADES), state.grade, (k) => {
    state.grade = k; viceSyncEditor(state);
  });
  viceMakeButtons(viceEl("sizeRow"), Object.entries(VICE_SIZES), state.size, (k) => {
    state.size = k; viceSyncEditor(state);
  });
  viceMakeButtons(viceEl("panelRow"), state.panels.map((p, i) => [String(i), { label: "Panel " + (i + 1) }]), String(state.activePanel), (k) => {
    state.activePanel = Number(k); viceSyncEditor(state);
  });
}

function viceRenderPreview(state) {
  const size = VICE_SIZES[state.size];
  const canvas = viceEl("preview");
  viceDrawCover(canvas, state, size.w, size.h);
  viceEl("sizeLabel").textContent = size.label + "  ·  " + VICE_LAYOUTS[state.layout].label + " layout  ·  " + VICE_GRADES[state.grade].label + " grade";
}

function viceSyncEditor(state) {
  const panel = state.panels[state.activePanel];
  viceEl("captionInput").value = state.caption;
  viceEl("subInput").value = state.subcaption;
  viceEl("placeInput").value = state.place;
  viceEl("zoomRange").value = String(panel.zoom);
  viceEl("zoomVal").textContent = panel.zoom.toFixed(2) + "x";
  viceEl("dxRange").value = String(panel.dx);
  viceEl("dxVal").textContent = Math.round(panel.dx * 100) + "%";
  viceEl("dyRange").value = String(panel.dy);
  viceEl("dyVal").textContent = Math.round(panel.dy * 100) + "%";
  viceRefreshButtons(state);
  viceRenderPreview(state);
  viceRenderPhotoSlots(state);
}

function viceRenderPhotoSlots(state) {
  const wrap = viceEl("photoSlots");
  wrap.innerHTML = "";
  state.photos.forEach((photo, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "slot" + (photo.loaded ? "" : " empty");
    card.title = photo.label;
    if (photo.img) {
      const thumb = document.createElement("canvas");
      thumb.width = 96; thumb.height = 64;
      const tctx = thumb.getContext("2d");
      tctx.drawImage(photo.img, 0, 0, 96, 64);
      card.appendChild(thumb);
    }
    const tag = document.createElement("span");
    tag.textContent = (i + 1) + " · " + photo.label;
    card.appendChild(tag);
    card.addEventListener("click", () => {
      viceSetPanelPhoto(state, state.activePanel, i);
      viceSyncEditor(state);
    });
    wrap.appendChild(card);
  });
}

function viceExportPng(state) {
  const size = VICE_SIZES[state.size];
  const off = document.createElement("canvas");
  viceDrawCover(off, state, size.w, size.h);
  const status = viceEl("exportStatus");
  status.textContent = "Rendering " + size.w + "x" + size.h + "…";
  off.toBlob((blob) => {
    if (!blob) { status.textContent = "Export failed — try again."; return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safe = String(state.caption || "cover").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cover";
    a.href = url;
    a.download = "vice-cover-" + safe + "-" + size.w + "x" + size.h + ".png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    status.textContent = "Exported PNG " + size.w + "x" + size.h + " — check your downloads.";
  }, "image/png");
}

function viceInitEditor(state) {
  viceEl("captionInput").addEventListener("input", (e) => { state.caption = e.target.value; viceRenderPreview(state); });
  viceEl("subInput").addEventListener("input", (e) => { state.subcaption = e.target.value; viceRenderPreview(state); });
  viceEl("placeInput").addEventListener("input", (e) => { state.place = e.target.value; viceRenderPreview(state); });
  viceEl("zoomRange").addEventListener("input", (e) => {
    state.panels[state.activePanel].zoom = Number(e.target.value);
    viceEl("zoomVal").textContent = Number(e.target.value).toFixed(2) + "x";
    viceRenderPreview(state);
  });
  viceEl("dxRange").addEventListener("input", (e) => {
    state.panels[state.activePanel].dx = Number(e.target.value);
    viceEl("dxVal").textContent = Math.round(Number(e.target.value) * 100) + "%";
    viceRenderPreview(state);
  });
  viceEl("dyRange").addEventListener("input", (e) => {
    state.panels[state.activePanel].dy = Number(e.target.value);
    viceEl("dyVal").textContent = Math.round(Number(e.target.value) * 100) + "%";
    viceRenderPreview(state);
  });
  viceEl("uploadInput").addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    let pending = files.length;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const idx = viceAddUpload(state, String(reader.result), file.name);
        viceSetPanelPhoto(state, state.activePanel, idx);
        pending--;
        if (pending === 0) viceSyncEditor(state);
      };
      reader.readAsDataURL(file);
    });
  });
  viceEl("sampleBtn").addEventListener("click", () => {
    state.photos[0].src = "samples/pier.jpg";
    state.photos[1].src = "samples/boulevard.jpg";
    viceLoadPhotos(state).then(() => viceSyncEditor(state));
  });
  viceEl("exportBtn").addEventListener("click", () => viceExportPng(state));
  // Clicking the preview exports too — the fastest path from photo to PNG.
  const preview = viceEl("preview");
  preview.title = "Click to export this cover as PNG";
  preview.addEventListener("click", () => viceExportPng(state));
  viceSyncEditor(state);
}
