import type { LinkCardMeta } from './types'

const META_RE = /<meta\b([^>]*?)\/?>/gi
const ATTR_RE = /([a-zA-Z:_-][a-zA-Z0-9:_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g
const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i
const LINK_RE = /<link\b([^>]*?)\/?>/gi
const JSONLD_RE = /<script\b[^>]*type\s*=\s*['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/gi

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
}

function parseAttrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of raw.matchAll(ATTR_RE)) {
    const name = m[1].toLowerCase()
    const value = m[2] ?? m[3] ?? m[4] ?? ''
    out[name] = decodeEntities(value)
  }
  return out
}

interface MetaIndex {
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogSiteName?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  description?: string
  productPriceAmount?: string
  productPriceCurrency?: string
  ogPriceAmount?: string
  ogPriceCurrency?: string
  htmlTitle?: string
  iconHref?: string
}

function indexMeta(html: string): MetaIndex {
  const idx: MetaIndex = {}
  for (const m of html.matchAll(META_RE)) {
    const attrs = parseAttrs(m[1])
    const key = (attrs.property ?? attrs.name ?? attrs.itemprop ?? '').toLowerCase()
    const content = attrs.content
    if (!key || content == null) continue
    switch (key) {
      case 'og:title':
        idx.ogTitle ??= content
        break
      case 'og:description':
        idx.ogDescription ??= content
        break
      case 'og:image':
      case 'og:image:url':
      case 'og:image:secure_url':
        idx.ogImage ??= content
        break
      case 'og:site_name':
        idx.ogSiteName ??= content
        break
      case 'twitter:title':
        idx.twitterTitle ??= content
        break
      case 'twitter:description':
        idx.twitterDescription ??= content
        break
      case 'twitter:image':
      case 'twitter:image:src':
        idx.twitterImage ??= content
        break
      case 'description':
        idx.description ??= content
        break
      case 'product:price:amount':
        idx.productPriceAmount ??= content
        break
      case 'product:price:currency':
        idx.productPriceCurrency ??= content
        break
      case 'og:price:amount':
        idx.ogPriceAmount ??= content
        break
      case 'og:price:currency':
        idx.ogPriceCurrency ??= content
        break
    }
  }
  const t = TITLE_RE.exec(html)
  if (t) idx.htmlTitle = decodeEntities(t[1].trim())

  for (const m of html.matchAll(LINK_RE)) {
    const attrs = parseAttrs(m[1])
    const rel = (attrs.rel ?? '').toLowerCase()
    if (!rel) continue
    if (
      rel.includes('icon') &&
      !idx.iconHref &&
      attrs.href
    ) {
      idx.iconHref = attrs.href
    }
  }
  return idx
}

interface JsonLdProductInfo {
  name?: string
  description?: string
  image?: string
  price?: string
  currency?: string
}

function findProduct(node: unknown): JsonLdProductInfo | null {
  if (!node) return null
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findProduct(item)
      if (found) return found
    }
    return null
  }
  if (typeof node !== 'object') return null
  const obj = node as Record<string, unknown>
  const graph = obj['@graph']
  if (Array.isArray(graph)) {
    const found = findProduct(graph)
    if (found) return found
  }
  const type = obj['@type']
  const types = Array.isArray(type) ? type : [type]
  if (types.some(t => typeof t === 'string' && /Product/i.test(t))) {
    const offers = obj.offers
    let price: string | undefined
    let currency: string | undefined
    if (offers) {
      const candidates = Array.isArray(offers) ? offers : [offers]
      for (const o of candidates) {
        if (o && typeof o === 'object') {
          const oo = o as Record<string, unknown>
          if (oo.price != null && price == null) price = String(oo.price)
          if (typeof oo.priceCurrency === 'string' && !currency) currency = oo.priceCurrency
          const spec = oo.priceSpecification
          if (spec && typeof spec === 'object') {
            const ss = spec as Record<string, unknown>
            if (ss.price != null && price == null) price = String(ss.price)
            if (typeof ss.priceCurrency === 'string' && !currency) currency = ss.priceCurrency
          }
        }
      }
    }
    return {
      name: typeof obj.name === 'string' ? obj.name : undefined,
      description: typeof obj.description === 'string' ? obj.description : undefined,
      image: extractImage(obj.image),
      price,
      currency
    }
  }
  return null
}

function extractImage(raw: unknown): string | undefined {
  if (!raw) return undefined
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const v = extractImage(item)
      if (v) return v
    }
    return undefined
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (typeof obj.url === 'string') return obj.url
  }
  return undefined
}

function parseJsonLdProducts(html: string): JsonLdProductInfo | null {
  for (const m of html.matchAll(JSONLD_RE)) {
    const body = m[1].trim()
    if (!body) continue
    try {
      const parsed = JSON.parse(body)
      const found = findProduct(parsed)
      if (found) return found
    } catch {
      // ignore malformed json-ld
    }
  }
  return null
}

function resolveUrl(base: string, href: string): string {
  try {
    return new URL(href, base).toString()
  } catch {
    return href
  }
}

export function parseHtmlMeta(html: string, url: string): Omit<LinkCardMeta, 'fetchedAt'> {
  const meta = indexMeta(html)
  const product = parseJsonLdProducts(html)

  const title =
    meta.ogTitle ??
    meta.twitterTitle ??
    product?.name ??
    meta.htmlTitle ??
    url

  const description =
    meta.ogDescription ??
    meta.twitterDescription ??
    product?.description ??
    meta.description

  const rawImage = meta.ogImage ?? meta.twitterImage ?? product?.image
  const image = rawImage ? resolveUrl(url, rawImage) : undefined

  const price = product?.price ?? meta.productPriceAmount ?? meta.ogPriceAmount
  const currency = product?.currency ?? meta.productPriceCurrency ?? meta.ogPriceCurrency

  let siteName = meta.ogSiteName
  if (!siteName) {
    try {
      siteName = new URL(url).hostname.replace(/^www\./, '')
    } catch {
      siteName = undefined
    }
  }

  const favicon = meta.iconHref
    ? resolveUrl(url, meta.iconHref)
    : (() => {
        try {
          const u = new URL(url)
          return `${u.origin}/favicon.ico`
        } catch {
          return undefined
        }
      })()

  return {
    url,
    title: title.trim(),
    description: description?.trim(),
    image,
    siteName,
    favicon,
    price,
    currency
  }
}
