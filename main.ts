// Vice Cover Maker — entry packager.
// Copies the static app and its screenshots into the output directory
// and writes the make.fun dossier for exactly what was copied, using
// the vendored buildDossier so the dossier matches the scorer's own
// computation byte for byte. Node standard library only.

import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = resolve(fileURLToPath(new URL('.', import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

// The caps the gta6-cover-art-01 gate holds the dossier to.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function main() {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(here, 'app'), join(outputDir, 'app'), { recursive: true });
  cpSync(join(here, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(outputDir, CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  const bytes = typeof dossier === 'string' ? Buffer.byteLength(dossier) : dossier.length;
  console.log(`vice-cover-maker: packaged app/ + screenshots/ into ${outputDir}`);
  console.log(`vice-cover-maker: dossier.json written (${bytes} bytes)`);
}

main();
