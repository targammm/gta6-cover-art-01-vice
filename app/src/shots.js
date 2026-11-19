// Fixed scenes for screenshots: ?shot=cover shows the exported cover alone,
// ?shot=editor shows the editor with photos loaded, ?shot=portrait shows the
// portrait cover alone, ?shot=sizes shows the three-size sheet. The query
// carries the scene's caption, grade and panel photos (see stateFromQuery),
// and window.__shotReady is set once the scene has painted.
export function runShot(shot, query, state, editor, redraw, helpers) {
  const canvas = document.getElementById('cover');
  if (shot === 'cover' || shot === 'portrait') {
    document.body.classList.add('shot-cover');
    if (shot === 'portrait') state.size = 'portrait';
    document.querySelector(`[data-size="${state.size}"]`)?.classList.add('active');
    redraw();
  } else if (shot === 'sizes') {
    document.body.classList.add('shot-cover');
    canvas.width = 1280;
    canvas.height = 720;
    helpers.drawSizesSheet(canvas.getContext('2d'), 1280, 720, state, editor.getImages());
  }
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

/** The four screenshot scenes, kept in sync with shots.json. */
export const SHOT_SCENES = [
  { shot: 'cover', w: 1080, h: 1080, file: '1-cover.jpg' },
  { shot: 'editor', w: 1280, h: 720, file: '2-editor.jpg' },
  { shot: 'portrait', w: 1024, h: 1280, file: '3-cover-portrait.jpg' },
  { shot: 'sizes', w: 1280, h: 720, file: '4-sizes.jpg' },
];
