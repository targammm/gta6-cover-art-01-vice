// Vice Cover Maker — state: one plain object, one pub/sub channel, optional
// localStorage persistence. The renderer and the editor never talk to each
// other directly; they both read and write through this module, so the live
// preview and the exported PNG can never disagree about the state.
import { DEFAULT_STATE } from './config.js';

const STORE_KEY = 'vice-cover-maker-v1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function freshState() {
  return clone(DEFAULT_STATE);
}

export function createStore(initial) {
  let state = initial ? clone(initial) : freshState();
  const listeners = new Set();

  function get() {
    return state;
  }

  function emit() {
    for (const fn of listeners) fn(state);
  }

  // Merge a patch, then notify. Nested photo-slot patches merge per slot so
  // a zoom slider never wipes the pan offsets of the same panel.
  function update(patch) {
    const next = { ...state, ...patch };
    if (patch.photos) {
      next.photos = { ...state.photos };
      for (const [slot, slotPatch] of Object.entries(patch.photos)) {
        next.photos[slot] = { ...(state.photos[slot] || {}), ...slotPatch };
      }
    }
    state = next;
    persist();
    emit();
    return state;
  }

  function setPhoto(slot, photo) {
    return update({ photos: { [slot]: photo } });
  }

  function reset() {
    state = freshState();
    persist();
    emit();
    return state;
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      // Private mode / no storage: the app still works, it just forgets.
    }
  }

  function restore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object' || !saved.photos) return false;
      state = { ...freshState(), ...saved, photos: { ...freshState().photos, ...saved.photos } };
      emit();
      return true;
    } catch {
      return false;
    }
  }

  // The slots a layout actually shows, in draw order. Slots the layout does
  // not use keep their photos (switching back restores them) but the editor
  // only offers controls for the visible ones.
  function visibleSlots(layoutPanels) {
    return layoutPanels.map((p) => p.id);
  }

  return { get, update, setPhoto, reset, subscribe, restore, visibleSlots };
}
