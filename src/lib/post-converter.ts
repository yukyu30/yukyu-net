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

  const body = preservingFencedCode(content, segment => {
    let s = segment
    s = normalizeRelativeImages(s)
    s = selfCloseVoidTags(s)
    s = stripInlineStyles(s)
    return jsxifyHtmlAttributes(s)
  })

  const thumbnail = extractFirstImage(body, slug)
  if (thumbnail) {
    next.thumbnail = thumbnail
  }
  NextraFrontmatterSchema.parse(next)

  const mdx = serializeMdx(next, body)
  return { mdx, frontmatter: next }
}

function extractFirstImage(body: string, slug?: string): string | undefined {
  const md = body.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/)
  const raw = md ? md[1] : body.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
  if (!raw) return undefined
  if (/^https?:\/\//.test(raw)) return raw
  if (raw.startsWith('/')) return raw
  if (!slug) return raw
  const filename = raw.startsWith('./') ? raw.slice(2) : raw
  return `/posts/${slug}/${filename}`
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

function preservingFencedCode(body: string, transform: (s: string) => string): string {
  const fences: string[] = []
  const PLACEHOLDER = (i: number) => `__FENCE_${i}_5e4f3c__`
  const stripped = body.replace(/```[\s\S]*?```|`[^`\n]*`/g, match => {
    fences.push(match)
    return PLACEHOLDER(fences.length - 1)
  })
  const transformed = transform(stripped)
  return transformed.replace(/__FENCE_(\d+)_5e4f3c__/g, (_, i: string) => fences[Number(i)])
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

function normalizeRelativeImages(body: string): string {
  const rewriteOne = (raw: string) => {
    if (/^https?:\/\//.test(raw)) return raw
    if (raw.startsWith('/')) return raw
    let p = raw
    if (p.startsWith('@@img@@/')) p = p.slice('@@img@@/'.length)
    if (p.startsWith('./')) p = p.slice(2)
    return `./${p}`
  }
  return body
    .replace(/!\[([^\]]*)\]\(([^\s)]+)(\s+[^)]*)?\)/g, (_match, alt: string, rawPath: string, title?: string) =>
      `![${alt}](${rewriteOne(rawPath)}${title ?? ''})`
    )
    .replace(/<img([^>]*?)\ssrc=(["'])([^"']+)\2([^>]*?)\s*\/?>/gi, (_match, before: string, q: string, src: string, after: string) =>
      `<img${before} src=${q}${rewriteOne(src)}${q}${after} />`
    )
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
