import { mkdir, readdir, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true })
}

async function copyFilesByExtension(
  srcDir: string,
  outDir: string,
  extensions: string[],
): Promise<void> {
  await ensureDir(outDir)

  const entries = await readdir(srcDir, { withFileTypes: true })
  const files = entries
    .filter((e) => e.isFile() && extensions.some((ext) => e.name.endsWith(ext)))
    .map((e) => e.name)

  await Promise.all(
    files.map((name) => copyFile(path.join(srcDir, name), path.join(outDir, name))),
  )
}

async function copyBlobSkinShaders(): Promise<void> {
  const skinsSrc = path.resolve(__dirname, '../src/avatar/renderers/blob/skins')
  const skinsOut = path.resolve(__dirname, '../dist/avatar/renderers/blob/skins')

  const entries = await readdir(skinsSrc, { withFileTypes: true })
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

  await Promise.all(
    dirs.map(async (dir) => {
      const src = path.join(skinsSrc, dir)
      const out = path.join(skinsOut, dir)
      await copyFilesByExtension(src, out, ['.glsl'])
    }),
  )
}

async function main(): Promise<void> {
  await copyBlobSkinShaders()
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
