import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import matter from 'gray-matter'
import { NextraFrontmatterSchema, type NextraFrontmatter } from './frontmatter'

const POSTS_DIR = resolve(process.cwd(), 'content/posts')
const READ_CHARS_PER_MINUTE = 500

export const POSTS_PAGE_SIZE = 20
export const postsPageHref = (n: number) =>
  n === 1 ? '/posts' : `/posts/page/${n}`

export interface PostListItem {
  slug: string
  frontMatter: NextraFrontmatter
  bodyChars: number
  readTime: number
}

let cache: PostListItem[] | null = null

function postFilePath(slug: string): string | null {
  const dirIndex = join(POSTS_DIR, slug, 'index.mdx')
  if (existsSync(dirIndex)) return dirIndex
  const flat = join(POSTS_DIR, `${slug}.mdx`)
  if (existsSync(flat)) return flat
  return null
}

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

function loadAll(): PostListItem[] {
  if (cache && process.env.NODE_ENV !== 'development') return cache
  cache = listSlugs()
    .map(slug => {
      const filePath = postFilePath(slug)
      if (!filePath) {
        throw new Error(`Missing MDX for slug: ${slug}`)
      }
      const raw = readFileSync(filePath, 'utf8')
      const { data, content } = matter(raw)
      let frontMatter
      try {
        frontMatter = NextraFrontmatterSchema.parse(data)
      } catch (err) {
        throw new Error(
          `Failed to parse frontmatter in ${filePath.replace(POSTS_DIR + '/', 'content/posts/')}: ${
            err instanceof Error ? err.message : String(err)
          }`
        )
      }
      const bodyChars = stripMarkdown(content).length
      return {
        slug,
        frontMatter,
        bodyChars,
        readTime: Math.max(1, Math.ceil(bodyChars / READ_CHARS_PER_MINUTE))
      }
    })
    .sort((a, b) => b.frontMatter.date.localeCompare(a.frontMatter.date))
  return cache
}

function stripMarkdown(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[#*_>~`-]/g, '')
    .replace(/\s+/g, '')
}

export function getAllPosts(): PostListItem[] {
  return loadAll()
}

export function getPostBySlug(slug: string): PostListItem | undefined {
  return loadAll().find(p => p.slug === slug)
}

export function getPostsByTag(tag: string): PostListItem[] {
  return loadAll().filter(p => p.frontMatter.tag?.includes(tag))
}

export function getWorks(): PostListItem[] {
  return getPostsByTag('work')
}

export function getProfileExcerpt(slug = 'me', lines = 2): string {
  const filePath = postFilePath(slug)
  if (!filePath) return ''
  let raw: string
  try {
    raw = readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
  const { content } = matter(raw)
  const match = content.match(/##\s*profile\s*\n([\s\S]*?)(?=\n##\s|\n*$)/)
  const body = match ? match[1] : content
  const picked = body
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .slice(0, lines)
    .map(l =>
      l
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    )
  return picked.join('\n')
}

export function getEarliestYear(): number {
  const all = loadAll()
  if (all.length === 0) return new Date().getUTCFullYear()
  const earliest = all[all.length - 1]
  return Number.parseInt(earliest.frontMatter.date.slice(0, 4), 10)
}

export interface TagCount {
  tag: string
  count: number
}

export function getTopTags(limit = 6): TagCount[] {
  return getAllTagCounts().slice(0, limit)
}

export function getAllTagCounts(): TagCount[] {
  const counts = new Map<string, number>()
  for (const p of loadAll()) {
    for (const t of p.frontMatter.tag ?? []) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }))
}
