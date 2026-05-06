#!/usr/bin/env tsx
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import matter from 'gray-matter'

const POSTS_DIR = resolve(process.cwd(), 'content/posts')
const DEFAULT_AUTHOR = 'yukyu'

function listPostFiles(): string[] {
  const out: string[] = []
  for (const entry of readdirSync(POSTS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const indexPath = join(POSTS_DIR, entry.name, 'index.mdx')
      if (existsSync(indexPath)) out.push(indexPath)
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      out.push(join(POSTS_DIR, entry.name))
    }
  }
  return out.sort()
}

function injectAuthorField(raw: string, author: string): string | null {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!fmMatch) return null
  const block = fmMatch[1]
  if (/^author\s*:/m.test(block)) return null
  const newBlock = `${block}\nauthor: ${author}`
  return raw.replace(fmMatch[0], `---\n${newBlock}\n---\n`)
}

let updated = 0
let skipped = 0

for (const file of listPostFiles()) {
  const raw = readFileSync(file, 'utf8')
  const { data } = matter(raw)
  if (data.author) {
    skipped++
    continue
  }
  const next = injectAuthorField(raw, DEFAULT_AUTHOR)
  if (!next) {
    skipped++
    continue
  }
  writeFileSync(file, next)
  updated++
}

console.log(`updated=${updated} skipped=${skipped}`)
