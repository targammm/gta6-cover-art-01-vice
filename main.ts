// Vice Cover Maker v3 — entry program for the make.fun "Make GTA 6 Cover Art" bounty.
// The app itself is a static site under app/ with no build step; this program
// only hands it in: it copies app/ and screenshots/ into the output directory
// and writes the dossier the scorer reads, using the kit's vendored library.
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-app.ts';

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(new URL('./app', import.meta.url), join(outputDir, 'app'), { recursive: true });
cpSync(new URL('./screenshots', import.meta.url), join(outputDir, 'screenshots'), { recursive: true });

// The caps mirror the bounty's gate: at most 160 KiB of source text in the
// dossier, at most 4 screenshots of at most 256 KiB each, and the app tree
// stays far below the file-count and byte ceilings.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
