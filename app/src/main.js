// Vice Cover Maker — boot: build state, load photos and fonts, then either
// run the shot mode (screenshots) or the interactive editor.
(function viceBoot() {
  const state = viceCreateState();
  const shot = viceParseShot();
  if (shot) viceApplyShot(state, shot);
  const ready = Promise.all([
    viceLoadPhotos(state),
    (document.fonts ? document.fonts.ready : Promise.resolve()),
  ]);
  ready.then(() => {
    document.documentElement.classList.add("vice-ready");
    if (shot && (shot.mode === "cover" || shot.mode === "portrait")) {
      viceShowExportedCover(state);
      document.title = "Vice Cover — exported " + VICE_SIZES[state.size].label;
      return;
    }
    viceInitEditor(state);
  });
})();
