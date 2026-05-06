#!/usr/bin/env tsx
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import { NextraFrontmatterSchema } from '../src/lib/frontmatter'

const POSTS_DIR = resolve(process.cwd(), 'content/posts')

interface FileError {
  file: string
  issues: string[]
}

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

function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map(issue => {
    const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
    return `${path}: ${issue.message}`
  })
}

function relPath(p: string): string {
  return p.replace(`${process.cwd()}/`, '')
}

const errors: FileError[] = []
const files = listPostFiles()

for (const file of files) {
  const raw = readFileSync(file, 'utf8')
  let data: Record<string, unknown>
  try {
    data = matter(raw).data
  } catch (err) {
    errors.push({
      file,
      issues: [`failed to parse frontmatter: ${err instanceof Error ? err.message : String(err)}`]
    })
    continue
  }
  const result = NextraFrontmatterSchema.safeParse(data)
  if (!result.success) {
    errors.push({ file, issues: formatZodIssues(result.error) })
  }
}

if (errors.length === 0) {
  console.log(`✓ frontmatter ok (${files.length} files)`)
  process.exit(0)
}

for (const e of errors) {
  console.error(`\n${relPath(e.file)}`)
  for (const issue of e.issues) {
    console.error(`  - ${issue}`)
  }
}
console.error(`\n✖ ${errors.length} file(s) with invalid frontmatter`)
process.exit(1)
