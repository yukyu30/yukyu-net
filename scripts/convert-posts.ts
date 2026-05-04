#!/usr/bin/env tsx
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs'
import { join, resolve, extname } from 'node:path'
import { convertPost } from '../src/lib/post-converter'

const SOURCE_ROOT = resolve(__dirname, '../../public/source')
const OUT_POSTS = resolve(__dirname, '../content/posts')

const IMAGE_EXTENSIONS = new Set(['.gif', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.avif'])

interface ConversionStats {
  total: number
  ok: number
  failed: Array<{ slug: string; error: string }>
}

function listPostDirs(root: string): string[] {
  return readdirSync(root)
    .filter(name => !name.startsWith('.'))
    .filter(name => {
      const p = join(root, name)
      try {
        return statSync(p).isDirectory() && existsSync(join(p, 'index.md'))
      } catch {
        return false
      }
    })
    .sort()
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function fallbackMissingImages(mdx: string, sourceDir: string): string {
  return mdx.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt: string, path: string) => {
    if (/^https?:\/\//.test(path)) return match
    if (path.startsWith('/')) return match
    const filename = path.startsWith('./') ? path.slice(2) : path
    if (existsSync(join(sourceDir, filename))) return match
    const safeAlt = escapeAttr(alt)
    const safeSrc = escapeAttr(path)
    return `<img src="${safeSrc}" alt="${safeAlt}" />`
  })
}

function copyAssets(srcDir: string, postDir: string): void {
  let created = false
  for (const name of readdirSync(srcDir)) {
    if (name === 'index.md') continue
    const ext = extname(name).toLowerCase()
    if (!IMAGE_EXTENSIONS.has(ext)) continue
    if (!created) {
      mkdirSync(postDir, { recursive: true })
      created = true
    }
    copyFileSync(join(srcDir, name), join(postDir, name))
  }
}

function main() {
  if (!existsSync(SOURCE_ROOT)) {
    throw new Error(`Source directory not found: ${SOURCE_ROOT}`)
  }

  if (existsSync(OUT_POSTS)) rmSync(OUT_POSTS, { recursive: true })
  mkdirSync(OUT_POSTS, { recursive: true })

  const slugs = listPostDirs(SOURCE_ROOT)
  const stats: ConversionStats = { total: slugs.length, ok: 0, failed: [] }

  for (const slug of slugs) {
    const srcPath = join(SOURCE_ROOT, slug, 'index.md')
    try {
      const source = readFileSync(srcPath, 'utf8')
      const { mdx } = convertPost({ source, slug })
      const sourceDir = join(SOURCE_ROOT, slug)
      const safeMdx = fallbackMissingImages(mdx, sourceDir)
      const postDir = join(OUT_POSTS, slug)
      mkdirSync(postDir, { recursive: true })
      writeFileSync(join(postDir, 'index.mdx'), safeMdx, 'utf8')
      copyAssets(sourceDir, postDir)
      stats.ok += 1
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      stats.failed.push({ slug, error: msg })
    }
  }

  console.log(`✓ converted: ${stats.ok}/${stats.total}`)
  if (stats.failed.length > 0) {
    console.log(`✗ failed: ${stats.failed.length}`)
    for (const { slug, error } of stats.failed) {
      console.log(`  - ${slug}: ${error.split('\n')[0]}`)
    }
    process.exitCode = 1
  }
}

main()
