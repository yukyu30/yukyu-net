import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const POSTS_DIR = resolve(process.cwd(), 'content/posts')

export interface PostUrl {
  slug: string
  url: string
}

const URL_LINE_RE = /^\s*<https?:\/\/[^\s>]+>\s*$/
const BARE_URL_LINE_RE = /^\s*(https?:\/\/\S+)\s*$/
const FENCE_RE = /^\s*```/

function listSlugs(): string[] {
  const out: string[] = []
  for (const entry of readdirSync(POSTS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (existsSync(join(POSTS_DIR, entry.name, 'index.mdx'))) {
        out.push(entry.name)
      }
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      out.push(entry.name.replace(/\.mdx$/, ''))
    }
  }
  return out
}

function postPath(slug: string): string {
  const dir = join(POSTS_DIR, slug, 'index.mdx')
  if (existsSync(dir)) return dir
  return join(POSTS_DIR, `${slug}.mdx`)
}

function stripFrontmatter(raw: string): string {
  if (!raw.startsWith('---')) return raw
  const end = raw.indexOf('\n---', 3)
  if (end < 0) return raw
  return raw.slice(end + 4)
}

export function extractCardUrlsFromMdx(raw: string): string[] {
  const body = stripFrontmatter(raw)
  const lines = body.split(/\r?\n/)
  const urls: string[] = []
  let inFence = false
  for (const line of lines) {
    if (FENCE_RE.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const angle = URL_LINE_RE.exec(line)
    if (angle) {
      const url = angle[0].trim().replace(/^</, '').replace(/>$/, '')
      urls.push(url)
      continue
    }
    const bare = BARE_URL_LINE_RE.exec(line)
    if (bare) {
      urls.push(bare[1].replace(/[).,!?]+$/, ''))
    }
  }
  return urls
}

export function getAllPostUrls(): PostUrl[] {
  const out: PostUrl[] = []
  for (const slug of listSlugs()) {
    const raw = readFileSync(postPath(slug), 'utf8')
    for (const url of extractCardUrlsFromMdx(raw)) {
      out.push({ slug, url })
    }
  }
  return out
}

export function getUniqueCardUrls(): string[] {
  const seen = new Set<string>()
  for (const item of getAllPostUrls()) seen.add(item.url)
  return [...seen]
}
