import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import matter from 'gray-matter'
import { NextraFrontmatterSchema, type NextraFrontmatter } from './frontmatter'

const POSTS_DIR = resolve(process.cwd(), 'content/posts')
const READ_CHARS_PER_MINUTE = 500

export interface PostListItem {
  slug: string
  frontMatter: NextraFrontmatter
  bodyChars: number
  readTime: number
}

let cache: PostListItem[] | null = null

function loadAll(): PostListItem[] {
  if (cache && process.env.NODE_ENV !== 'development') return cache
  cache = readdirSync(POSTS_DIR)
    .filter(name => name.endsWith('.mdx'))
    .map(name => {
      const slug = name.replace(/\.mdx$/, '')
      const raw = readFileSync(join(POSTS_DIR, name), 'utf8')
      const { data, content } = matter(raw)
      const frontMatter = NextraFrontmatterSchema.parse(data)
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

export function getPostsByTags(tags: string[]): PostListItem[] {
  const set = new Set(tags)
  return loadAll().filter(p => p.frontMatter.tag?.some(t => set.has(t)))
}

export function getWorks(): PostListItem[] {
  return getPostsByTags(['work', 'つくったもの'])
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
