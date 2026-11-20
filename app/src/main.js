// Vice Cover Maker — page boot.
// Decides what this visit is: a screenshot composition when the URL
// carries ?shot=, otherwise the editor. The editor is also what the
// ?shot=editor capture frames, so editor mode always boots fully and
// only then reports itself ready.

import { createState } from './state.js';
import { initEditor } from './editor.js';
import { runShotMode, waitShotReady } from './shots.js';

export { waitShotReady };

async function boot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot && shot !== 'editor') {
    const handled = await runShotMode(params);
    if (handled) return;
  }
  const state = createState();
  await initEditor(state);
  if (shot === 'editor') {
    document.body.classList.add('editor-shot');
    try {
      await Promise.all([
        document.fonts.load('100px Anton'),
        document.fonts.load('40px "Archivo Black"'),
      ]);
      await document.fonts.ready;
    } catch { /* paint stands as it is */ }
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    window.__shotReady = true;
  }
}

boot().catch((err) => {
  const note = document.getElementById('error-note');
  if (note) {
    note.hidden = false;
    note.textContent = 'Something failed to load: ' + (err && err.message ? err.message : String(err));
  }
  // Still raise the flag so a capture never hangs on a broken page;
  // the broken frame is itself the evidence.
  window.__shotReady = true;
});
