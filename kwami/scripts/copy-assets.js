import { mkdir, readdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function copyFilesByExtension(srcDir, outDir, extensions) {
  await ensureDir(outDir);

  const entries = await readdir(srcDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && extensions.some((ext) => e.name.endsWith(ext)))
    .map((e) => e.name);

  await Promise.all(files.map((name) => copyFile(path.join(srcDir, name), path.join(outDir, name))));
}

async function copySoulYamlTemplates() {
  // NOTE: these are optional for many consumers, but safe to ship alongside dist.
  // If a consumer imports the templates loader, bundlers need these YAML files.
  const srcDir = path.resolve(__dirname, '../src/core/soul/templates');
  const outDir = path.resolve(__dirname, '../dist/src/core/soul/templates');

  try {
    const s = await stat(srcDir);
    if (!s.isDirectory()) return;
  } catch {
    return;
  }

  await copyFilesByExtension(srcDir, outDir, ['.yaml', '.yml']);
}

async function copyBlobSkinShaders() {
  // Required for builds that consume shader imports like `./vertex.glsl?raw`.
  const skinsSrc = path.resolve(__dirname, '../src/core/body/blob/skins');
  const skinsOut = path.resolve(__dirname, '../dist/src/core/body/blob/skins');

  const entries = await readdir(skinsSrc, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  await Promise.all(
    dirs.map(async (dir) => {
      const src = path.join(skinsSrc, dir);
      const out = path.join(skinsOut, dir);
      await copyFilesByExtension(src, out, ['.glsl']);
    }),
  );
}

async function main() {
  await copyBlobSkinShaders();
  await copySoulYamlTemplates();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
