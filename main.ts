// Vice Cover Maker v2.1 — entry program (Node 22, standard library only).
// Copies app/ and screenshots/ beside this file into /output (or the
// MAKEFUN_OUTPUT_DIR stand-in outside the grader) and writes
// /output/dossier.json with the vendored make.fun library.
// No network, no dependencies, no build step.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(name: string): void {
  const src = join(here, name);
  if (!existsSync(src)) return;
  mkdirSync(join(out, name), { recursive: true });
  cpSync(src, join(out, name), { recursive: true });
}

mkdirSync(out, { recursive: true });
copyTree('app');
copyTree('screenshots');

// The scorer's own caps (from the kit's reference/gate.json): only
// text_max_bytes shapes the bytes; the others refuse an entry the scorer
// would refuse — more than 4 screenshots or one over 256 KiB; more than
// 993 files in app/ or 48 MiB of app files in all, or a path under app/
// over 1000 bytes (app/ counts beside /output's own 1000-entry cap).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
