import { cache } from 'react'

export interface OgData {
  url: string
  title?: string
  description?: string
  image?: string
  siteName?: string
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  '#39': "'"
}

/** 主要な HTML エンティティをデコードする（OG メタ用途の最小実装）。 */
export function decodeHtmlEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X'
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : match
    }
    const named = ENTITIES[body] ?? ENTITIES[body.toLowerCase()]
    return named ?? match
  })
}

/** 1 つの HTML タグ文字列から属性値を取り出す。 */
function getAttr(tag: string, name: string): string | undefined {
  const re = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i')
  const m = tag.match(re)
  if (!m) return undefined
  return m[2] ?? m[3] ?? m[4]
}

/** HTML からタイトル・ディスクリプション・OG 画像などを抽出する。 */
export function parseOgFromHtml(html: string, baseUrl: string): Omit<OgData, 'url'> {
  const head = html.split(/<\/head>/i)[0] ?? html
  const metaTags = head.match(/<meta\b[^>]*>/gi) ?? []
  const map: Record<string, string> = {}

  for (const tag of metaTags) {
    const key = (getAttr(tag, 'property') ?? getAttr(tag, 'name'))?.toLowerCase()
    const content = getAttr(tag, 'content')
    if (key && content != null && !(key in map)) {
      map[key] = content
    }
  }

  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]

  const pick = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      if (map[key]) return map[key]
    }
    return undefined
  }

  const rawTitle = pick('og:title', 'twitter:title') ?? titleTag?.trim()
  const rawDescription = pick('og:description', 'twitter:description', 'description')
  const rawSiteName = pick('og:site_name', 'application-name')
  let image = pick('og:image', 'og:image:url', 'og:image:secure_url', 'twitter:image', 'twitter:image:src')

  if (image) {
    try {
      image = new URL(image, baseUrl).toString()
    } catch {
      image = undefined
    }
  }

  const clean = (value?: string) => {
    if (!value) return undefined
    const decoded = decodeHtmlEntities(value).trim()
    return decoded.length > 0 ? decoded : undefined
  }

  return {
    title: clean(rawTitle),
    description: clean(rawDescription),
    image,
    siteName: clean(rawSiteName)
  }
}

const FETCH_TIMEOUT_MS = 8000

/**
 * URL の OG メタデータを取得する。失敗時は url のみを返す。
 * React の cache でレンダー中の重複フェッチを排除する。
 */
export const fetchOgData = cache(async (url: string): Promise<OgData> => {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent':
          'Mozilla/5.0 (compatible; yukyu-net-linkcard/1.0; +https://yukyu.net)',
        accept: 'text/html,application/xhtml+xml'
      }
    }).finally(() => clearTimeout(timer))

    if (!res.ok) return { url }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('html')) return { url }

    const html = await res.text()
    return { url, ...parseOgFromHtml(html, res.url || url) }
  } catch {
    return { url }
  }
})
