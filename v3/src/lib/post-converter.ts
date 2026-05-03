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

  const rewrittenBody = slug ? rewriteRelativeImages(content, slug) : content
  const closedBody = selfCloseVoidTags(rewrittenBody)
  const cleaned = stripInlineStyles(closedBody)
  const body = jsxifyHtmlAttributes(cleaned)

  const thumbnail = extractFirstImage(body)
  if (thumbnail) {
    next.thumbnail = thumbnail
  }
  NextraFrontmatterSchema.parse(next)

  const mdx = serializeMdx(next, body)
  return { mdx, frontmatter: next }
}

function extractFirstImage(body: string): string | undefined {
  const md = body.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/)
  if (md) return md[1]
  const html = body.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (html) return html[1]
  return undefined
}

const HTML_TO_JSX_ATTRIBUTES: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  frameborder: 'frameBorder',
  allowfullscreen: 'allowFullScreen',
  contenteditable: 'contentEditable',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  tabindex: 'tabIndex',
  autofocus: 'autoFocus',
  novalidate: 'noValidate',
  readonly: 'readOnly',
  autoplay: 'autoPlay',
  playsinline: 'playsInline',
  srcset: 'srcSet',
  crossorigin: 'crossOrigin',
  referrerpolicy: 'referrerPolicy',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  usemap: 'useMap',
  formaction: 'formAction'
}

function stripInlineStyles(body: string): string {
  return body.replace(/\sstyle="[^"]*"/g, '').replace(/\sstyle='[^']*'/g, '')
}

function jsxifyHtmlAttributes(body: string): string {
  return body.replace(/<([a-zA-Z][^\s/>]*)([^>]*)>/g, (match, tag: string, attrs: string) => {
    if (!/[a-zA-Z]=["']/.test(attrs) && !/\s(class|for|frameborder|allowfullscreen|contenteditable|colspan|rowspan|tabindex|autofocus|novalidate|readonly|autoplay|playsinline|srcset|crossorigin|referrerpolicy|cellpadding|cellspacing|usemap|formaction)\b/i.test(attrs)) {
      return match
    }
    let next = attrs
    for (const [from, to] of Object.entries(HTML_TO_JSX_ATTRIBUTES)) {
      next = next.replace(new RegExp(`(\\s)${from}(\\s*=)`, 'gi'), `$1${to}$2`)
    }
    return `<${tag}${next}>`
  })
}

const VOID_TAGS = ['br', 'hr', 'img', 'input', 'meta', 'link', 'source']

function selfCloseVoidTags(body: string): string {
  return body.replace(
    new RegExp(`<(${VOID_TAGS.join('|')})\\b([^>]*?)(?<!/)>`, 'gi'),
    (_m, tag: string, attrs: string) => {
      const trimmed = attrs.replace(/\s+$/, '')
      return trimmed.length > 0 ? `<${tag}${trimmed} />` : `<${tag} />`
    }
  )
}

function rewriteRelativeImages(body: string, slug: string): string {
  return body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt: string, rawPath: string) => {
    if (/^https?:\/\//.test(rawPath)) return match
    if (rawPath.startsWith('/')) return match
    let path = rawPath
    if (path.startsWith('@@img@@/')) path = path.slice('@@img@@/'.length)
    if (path.startsWith('./')) path = path.slice(2)
    return `![${alt}](/posts/${slug}/${path})`
  })
}

function serializeMdx(fm: NextraFrontmatter, body: string): string {
  const lines = [`title: ${escapeYamlString(fm.title)}`, `date: ${fm.date}`]
  if (fm.description !== undefined) {
    lines.push(`description: ${escapeYamlString(fm.description)}`)
  }
  if (fm.thumbnail) {
    lines.push(`thumbnail: ${fm.thumbnail}`)
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
