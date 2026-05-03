import matter from 'gray-matter'
import {
  LegacyFrontmatterSchema,
  NextraFrontmatterSchema,
  convertFrontmatter,
  type NextraFrontmatter
} from './frontmatter'

export interface ConvertPostInput {
  source: string
  slug?: string
}

export interface ConvertPostResult {
  mdx: string
  frontmatter: NextraFrontmatter
}

export function convertPost({ source, slug }: ConvertPostInput): ConvertPostResult {
  const { data, content } = matter(source)
  const legacy = LegacyFrontmatterSchema.parse(data)
  const next = convertFrontmatter(legacy)
  NextraFrontmatterSchema.parse(next)

  const body = slug ? rewriteRelativeImages(content, slug) : content
  const mdx = serializeMdx(next, body)

  return { mdx, frontmatter: next }
}

function rewriteRelativeImages(body: string, slug: string): string {
  return body.replace(/!\[([^\]]*)\]\(\.\/([^)]+)\)/g, (_m, alt: string, path: string) => {
    return `![${alt}](/posts/${slug}/${path})`
  })
}

function serializeMdx(fm: NextraFrontmatter, body: string): string {
  const lines = [`title: ${escapeYamlString(fm.title)}`, `date: ${fm.date}`]
  if (fm.description !== undefined) {
    lines.push(`description: ${escapeYamlString(fm.description)}`)
  }
  if (fm.tag && fm.tag.length > 0) {
    lines.push(`tag:`)
    for (const t of fm.tag) {
      lines.push(`  - ${escapeYamlString(t)}`)
    }
  }
  return `---\n${lines.join('\n')}\n---\n\n${body.trim()}\n`
}

function escapeYamlString(s: string): string {
  if (/^[\w\sぁ-んァ-ヶ一-龠ー]+$/.test(s) && !/^\d/.test(s)) {
    return s
  }
  return JSON.stringify(s)
}
