// Vice Cover Maker — entrypoint: copy app/ + screenshots/ to the output
// directory and write the dossier the gate compares byte for byte.
// Node 22, standard library only, no network.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDossier } from "./vendor/makefun-app.ts";

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

function copyTree(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
}

function main(): void {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  copyTree(join("app"), join(outDir, "app"));
  copyTree(join("screenshots"), join(outDir, "screenshots"));
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 48 * 1024 * 1024,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(outDir, "dossier.json"), dossier);
  console.log("wrote " + outDir + "/dossier.json (" + dossier.length + " bytes)");
}

main();
