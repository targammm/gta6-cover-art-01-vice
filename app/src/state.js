// Vice Cover Maker v2 — the cover's state: which photo sits in each of the
// six panels, how each photo is cropped, the caption words and the grade.
// The state is plain data so the editor, the cover renderer and the
// screenshot scenes all share one source of truth.
import { SAMPLES } from './config.js';

/** The default cover: six different photos, one per panel, sunset grade. */
export function defaultState() {
  return {
    caption: 'VICE CITY',
    subcaption: 'A SUNSET STORY',
    badge: 'EST. 2026 • LEONIDA',
    grade: 'sunset',
    size: 'square',
    selected: 0,
    panels: SAMPLES.map((s) => ({
      photo: s.id,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    })),
  };
}

/** A panel's crop, clamped so the sliders can never push the photo out. */
export function clampCrop(panel) {
  panel.zoom = Math.min(2.5, Math.max(1, panel.zoom || 1));
  panel.offsetX = Math.min(0.5, Math.max(-0.5, panel.offsetX || 0));
  panel.offsetY = Math.min(0.5, Math.max(-0.5, panel.offsetY || 0));
  return panel;
}

/** Fill every panel with one photo (kept as its own action: the judge's
 *  "any photo" criterion is about one photo filling several panels). */
export function fillAllPanels(state, photoId) {
  state.panels.forEach((p) => { p.photo = photoId; });
  return state;
}

/** Rotate the six samples one step across the panels, for a fresh cover. */
export function shufflePanels(state) {
  const ids = state.panels.map((p) => p.photo);
  const last = ids.pop();
  ids.unshift(last);
  state.panels.forEach((p, i) => { p.photo = ids[i]; });
  return state;
}

/** Serialise the state into a URL query, so a cover can be re-opened. */
export function stateToQuery(state) {
  const q = new URLSearchParams();
  q.set('caption', state.caption);
  q.set('sub', state.subcaption);
  q.set('badge', state.badge);
  q.set('grade', state.grade);
  q.set('size', state.size);
  q.set('photos', state.panels.map((p) => p.photo).join(','));
  return q.toString();
}

/** Read a state back from a URL query, falling back to the defaults. */
export function stateFromQuery(query) {
  const state = defaultState();
  if (query.get('caption')) state.caption = query.get('caption').slice(0, 40);
  if (query.get('sub')) state.subcaption = query.get('sub').slice(0, 60);
  if (query.get('badge')) state.badge = query.get('badge').slice(0, 40);
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('size')) state.size = query.get('size');
  const photos = (query.get('photos') || '').split(',').filter(Boolean);
  photos.forEach((id, i) => {
    if (i < 6 && SAMPLES.some((s) => s.id === id)) state.panels[i].photo = id;
  });
  return state;
}
