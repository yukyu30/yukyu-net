#!/usr/bin/env tsx
/**
 * Mirror image assets colocated under content/posts/{slug}/ to public/posts/{slug}/
 * so that thumbnail URLs in frontmatter (rendered as raw <img src="/posts/...">)
 * and any other absolute /posts/... references resolve at runtime. MDX bodies
 * using relative ./foo.ext don't depend on this mirror — Nextra resolves those
 * via webpack imports.
 *
 * Run as a predev / prebuild hook.
 */
import {
  readdirSync,
  statSync,
  mkdirSync,
  copyFileSync,
  existsSync,
  rmSync
} from 'node:fs'
import { extname, join, resolve } from 'node:path'

const ROOT = resolve(process.cwd())
const SRC_ROOT = join(ROOT, 'content/posts')
const DST_ROOT = join(ROOT, 'public/posts')

const IMAGE_EXTENSIONS = new Set([
  '.gif',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp',
  '.avif'
])

function shouldCopy(srcPath: string, dstPath: string): boolean {
  if (!existsSync(dstPath)) return true
  return statSync(srcPath).mtimeMs > statSync(dstPath).mtimeMs
}

function syncDir(slug: string): { copied: number; total: number } {
  const srcDir = join(SRC_ROOT, slug)
  let copied = 0
  let total = 0
  for (const name of readdirSync(srcDir)) {
    const ext = extname(name).toLowerCase()
    if (!IMAGE_EXTENSIONS.has(ext)) continue
    total += 1
    const src = join(srcDir, name)
    const dst = join(DST_ROOT, slug, name)
    if (shouldCopy(src, dst)) {
      mkdirSync(join(DST_ROOT, slug), { recursive: true })
      copyFileSync(src, dst)
      copied += 1
    }
  }
  return { copied, total }
}

function main() {
  if (!existsSync(SRC_ROOT)) {
    throw new Error(`content/posts not found: ${SRC_ROOT}`)
  }
  if (existsSync(DST_ROOT)) rmSync(DST_ROOT, { recursive: true })

  let copied = 0
  let total = 0
  for (const entry of readdirSync(SRC_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const r = syncDir(entry.name)
    copied += r.copied
    total += r.total
  }
  console.log(`synced=${copied}/${total}`)
}

main()
