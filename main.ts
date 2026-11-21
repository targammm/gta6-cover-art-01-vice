// Vice Cover Maker — the hand-in program.
//
// The deliverable is the static app in app/ plus the screenshots in
// screenshots/. This program copies both into the output directory and
// writes dossier.json there with the vendored make.fun library, so the
// judge reads exactly the bytes that were handed in.
//
//   node main.ts                          -> writes /output
//   MAKEFUN_OUTPUT_DIR=out node main.ts   -> writes ./out instead

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps, mirrored so an over-limit tree fails here, loudly,
// instead of at judging time.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function copyTree(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function main(): void {
  copyTree(join(root, 'app'), join(outputDir, 'app'));
  const shots = join(root, 'screenshots');
  if (existsSync(shots)) copyTree(shots, join(outputDir, 'screenshots'));
  writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, CAPS));
  console.log(`Vice Cover Maker handed in at ${outputDir}`);
}

main();
