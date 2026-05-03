import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import matter from 'gray-matter'
import { NextraFrontmatterSchema, type NextraFrontmatter } from './frontmatter'

const POSTS_DIR = resolve(process.cwd(), 'content/posts')

export interface PostListItem {
  slug: string
  frontMatter: NextraFrontmatter
}

export function getAllPosts(): PostListItem[] {
  return readdirSync(POSTS_DIR)
    .filter(name => name.endsWith('.mdx'))
    .map(name => {
      const slug = name.replace(/\.mdx$/, '')
      const raw = readFileSync(join(POSTS_DIR, name), 'utf8')
      const { data } = matter(raw)
      return { slug, frontMatter: NextraFrontmatterSchema.parse(data) }
    })
    .sort((a, b) => b.frontMatter.date.localeCompare(a.frontMatter.date))
}

export function getPostsByTag(tag: string): PostListItem[] {
  return getAllPosts().filter(p => p.frontMatter.tag?.includes(tag))
}
