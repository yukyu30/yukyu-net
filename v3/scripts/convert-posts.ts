#!/usr/bin/env tsx
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs'
import { join, resolve, extname } from 'node:path'
import { convertPost } from '../src/lib/post-converter'

const SOURCE_ROOT = resolve(__dirname, '../../public/source')
const OUT_POSTS = resolve(__dirname, '../content/posts')
const OUT_PUBLIC = resolve(__dirname, '../public/posts')

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

const V3_PUBLIC_DIR = resolve(__dirname, '../public')

function fallbackMissingImages(mdx: string, slug: string, sourceDir: string): string {
  const slugPrefix = `/posts/${slug}/`
  return mdx.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt: string, path: string) => {
    if (/^https?:\/\//.test(path)) return match
    if (!path.startsWith('/')) return match

    let resolved = false
    if (path.startsWith(slugPrefix)) {
      const filename = path.slice(slugPrefix.length)
      resolved = existsSync(join(sourceDir, filename))
    } else {
      resolved = existsSync(join(V3_PUBLIC_DIR, path))
    }
    if (resolved) return match
    const safeAlt = alt.replace(/"/g, '&quot;')
    return `<img src="${path}" alt="${safeAlt}" />`
  })
}

function copyAssets(srcDir: string, slug: string): void {
  const targetDir = join(OUT_PUBLIC, slug)
  let created = false
  for (const name of readdirSync(srcDir)) {
    if (name === 'index.md') continue
    const ext = extname(name).toLowerCase()
    if (!IMAGE_EXTENSIONS.has(ext)) continue
    if (!created) {
      mkdirSync(targetDir, { recursive: true })
      created = true
    }
    copyFileSync(join(srcDir, name), join(targetDir, name))
  }
}

function main() {
  if (!existsSync(SOURCE_ROOT)) {
    throw new Error(`Source directory not found: ${SOURCE_ROOT}`)
  }

  if (existsSync(OUT_POSTS)) rmSync(OUT_POSTS, { recursive: true })
  if (existsSync(OUT_PUBLIC)) rmSync(OUT_PUBLIC, { recursive: true })
  mkdirSync(OUT_POSTS, { recursive: true })
  mkdirSync(OUT_PUBLIC, { recursive: true })

  const slugs = listPostDirs(SOURCE_ROOT)
  const stats: ConversionStats = { total: slugs.length, ok: 0, failed: [] }

  for (const slug of slugs) {
    const srcPath = join(SOURCE_ROOT, slug, 'index.md')
    try {
      const source = readFileSync(srcPath, 'utf8')
      const { mdx } = convertPost({ source, slug })
      const sourceDir = join(SOURCE_ROOT, slug)
      const safeMdx = fallbackMissingImages(mdx, slug, sourceDir)
      writeFileSync(join(OUT_POSTS, `${slug}.mdx`), safeMdx, 'utf8')
      copyAssets(sourceDir, slug)
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
