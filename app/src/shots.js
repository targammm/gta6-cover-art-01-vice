// Vice Cover Maker — demo scenes.
// One-call compositions used for the screenshots listed in shots.json and as
// the editor's opening state: each loads bundled samples into the panels and
// sets the lettering, so a fresh visitor sees a finished cover, not boxes.

import { setPanelSample, state } from './state.js';

export const SCENES = {
  cover: {
    sizeId: 'landscape', gradeId: 'sunset', captionPos: 'bottom',
    caption: 'SUNSET HEIST', subtitle: 'VICE CITY · LEONIDA',
    panels: ['skyline', 'convertible', 'boulevard', 'lifeguard', 'marina', 'pier'],
  },
  editor: {
    sizeId: 'square', gradeId: 'sunset', captionPos: 'bottom',
    caption: 'BOULEVARD QUEEN', subtitle: 'VICE CITY NIGHTS',
    panels: ['boulevard', 'pier', 'convertible', 'skyline', 'lifeguard', 'marina'],
  },

  portrait: {
    sizeId: 'portrait', gradeId: 'neon', captionPos: 'top',
    caption: 'NEON NIGHTS', subtitle: 'VICE CITY · AFTER DARK',
    panels: ['pier', 'skyline', 'marina', 'boulevard', 'convertible', 'lifeguard'],
  },
  square: {
    sizeId: 'square', gradeId: 'dusk', captionPos: 'bottom',
    caption: 'DUSK PATROL', subtitle: 'LEONIDA KEYS',
    panels: ['marina', 'lifeguard', 'pier', 'skyline', 'boulevard', 'convertible'],
  },
};

// Put a scene on stage: size, grade, lettering and a sample in every panel,
// each reframed back to its centred, unzoomed crop.
export function applyScene(name) {
  const scene = SCENES[name] || SCENES.editor;
  state.sizeId = scene.sizeId;
  state.gradeId = scene.gradeId;
  state.captionPos = scene.captionPos;
  state.caption = scene.caption;
  state.subtitle = scene.subtitle;
  state.captionSize = 1;
  scene.panels.forEach((sampleId, i) => {
    state.panels[i].zoom = 1;
    state.panels[i].ox = 0;
    state.panels[i].oy = 0;
    setPanelSample(i, sampleId);
  });
  return scene;
}
