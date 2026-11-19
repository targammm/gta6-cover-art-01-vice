// Vice Cover Maker — state: photos, panels, caption, size, layout, grade.
// A panel points at a photo by index and carries its own crop (zoom + offset).
function viceDefaultPanels() {
  return [
    { photo: 0, zoom: 1.15, dx: 0, dy: 0 },
    { photo: 1, zoom: 1.15, dx: 0, dy: 0.1 },
    { photo: 0, zoom: 1.3, dx: 0.08, dy: -0.05 },
  ];
}

function viceCreateState() {
  return {
    photos: [
      { id: "pier", label: "Pier sunset", src: "samples/pier.jpg", img: null, loaded: false },
      { id: "boulevard", label: "Boulevard", src: "samples/boulevard.jpg", img: null, loaded: false },
      { id: "pier2", label: "Pier sunset", src: "samples/pier.jpg", img: null, loaded: false },
    ],
    panels: viceDefaultPanels(),
    layout: "trio",
    grade: "sunset",
    size: "wide",
    caption: VICE_DEFAULT_CAPTION,
    subcaption: VICE_DEFAULT_SUB,
    place: VICE_DEFAULT_PLACE,
    activePanel: 0,
  };
}

// Load every sample photo once; resolves when all have settled (load or error).
function viceLoadPhotos(state) {
  const jobs = state.photos.map((photo) => new Promise((resolve) => {
    if (photo.img && photo.loaded) { resolve(photo); return; }
    const img = new Image();
    img.onload = () => { photo.img = img; photo.loaded = true; resolve(photo); };
    img.onerror = () => { photo.img = null; photo.loaded = false; resolve(photo); };
    img.src = photo.src;
  }));
  return Promise.all(jobs);
}

// Point a panel at an uploaded photo (data URL) or a sample by id.
function viceSetPanelPhoto(state, panelIndex, photoIndex) {
  if (panelIndex < 0 || panelIndex >= state.panels.length) return;
  if (photoIndex < 0 || photoIndex >= state.photos.length) return;
  state.panels[panelIndex].photo = photoIndex;
}

function viceAddUpload(state, dataUrl, name) {
  const slot = state.photos.findIndex((p) => p.id.startsWith("upload"));
  const img = new Image();
  const photo = { id: "upload-" + Date.now(), label: name || "Your photo", src: dataUrl, img: null, loaded: false };
  img.onload = () => { photo.img = img; photo.loaded = true; };
  img.src = dataUrl;
  if (slot >= 0) state.photos[slot] = photo;
  else state.photos.push(photo);
  return state.photos.indexOf(photo);
}
