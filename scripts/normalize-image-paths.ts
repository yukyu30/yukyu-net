import {
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
  renameSync,
  existsSync,
  unlinkSync
} from 'node:fs'
import { createHash } from 'node:crypto'
import { join, extname, basename } from 'node:path'

const ROOT = process.cwd()
const POSTS_DIR = join(ROOT, 'content/posts')
const PUBLIC_POSTS = join(ROOT, 'public/posts')

const isProblem = (s: string) => /[^\x00-\x7F]/.test(s) || s.includes('%')

function asciify(name: string): string {
  const ext = extname(name).toLowerCase()
  const base = basename(name, ext)
  let decoded = base
  try {
    decoded = decodeURIComponent(base)
  } catch {
    decoded = base
  }
  const ascii = decoded.replace(/[^a-zA-Z0-9_-]/g, '')
  const hash = createHash('sha1').update(name).digest('hex').slice(0, 8)
  const safe = ascii.length > 0 ? ascii.slice(0, 30) : 'img'
  return `${safe}-${hash}${ext}`
}

const renames: Array<{ slug: string; from: string; to: string }> = []

for (const slug of readdirSync(PUBLIC_POSTS)) {
  const dir = join(PUBLIC_POSTS, slug)
  if (!statSync(dir).isDirectory()) continue
  for (const name of readdirSync(dir)) {
    if (!isProblem(name)) continue
    const newName = asciify(name)
    const fromPath = join(dir, name)
    const toPath = join(dir, newName)
    if (existsSync(toPath) && toPath !== fromPath) {
      const a = readFileSync(fromPath)
      const b = readFileSync(toPath)
      if (!a.equals(b)) {
        throw new Error(
          `Refusing to drop ${fromPath}: target ${toPath} exists with different content`
        )
      }
      unlinkSync(fromPath)
    } else {
      renameSync(fromPath, toPath)
    }
    renames.push({ slug, from: name, to: newName })
  }
}

const replacementsBySlug = new Map<string, Array<{ from: string; to: string }>>()
for (const r of renames) {
  const arr = replacementsBySlug.get(r.slug) ?? []
  arr.push({ from: r.from, to: r.to })
  replacementsBySlug.set(r.slug, arr)
}

let mdxUpdated = 0
for (const file of readdirSync(POSTS_DIR)) {
  if (!file.endsWith('.mdx')) continue
  const path = join(POSTS_DIR, file)
  let body = readFileSync(path, 'utf8')
  let modified = false
  for (const [slug, rs] of replacementsBySlug) {
    for (const { from, to } of rs) {
      const fromPath = `/posts/${slug}/${from}`
      const toPath = `/posts/${slug}/${to}`
      if (body.includes(fromPath)) {
        body = body.split(fromPath).join(toPath)
        modified = true
      }
    }
  }
  if (modified) {
    writeFileSync(path, body)
    mdxUpdated += 1
  }
}

console.log(`renamed=${renames.length} mdx_updated=${mdxUpdated}`)
