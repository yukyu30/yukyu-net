import { parseHtmlMeta } from './parse'
import type { LinkCardMeta } from './types'

const USER_AGENT =
  'Mozilla/5.0 (compatible; yukyu.net link-card bot; +https://yukyu.net)'

const MAX_BYTES = 1_500_000
const TIMEOUT_MS = 15_000

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.8'
      }
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const contentType = res.headers.get('content-type') ?? ''
    if (!/text\/html|application\/xhtml/.test(contentType)) {
      throw new Error(`Unsupported content-type: ${contentType}`)
    }
    const reader = res.body?.getReader()
    if (!reader) return await res.text()
    const chunks: Uint8Array[] = []
    let received = 0
    while (received < MAX_BYTES) {
      const { value, done } = await reader.read()
      if (done) break
      chunks.push(value)
      received += value.byteLength
    }
    try {
      await reader.cancel()
    } catch {
      // ignore
    }
    const buf = new Uint8Array(received)
    let offset = 0
    for (const chunk of chunks) {
      buf.set(chunk, offset)
      offset += chunk.byteLength
    }
    return new TextDecoder('utf-8').decode(buf)
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchLinkCardMeta(url: string): Promise<LinkCardMeta> {
  const html = await fetchHtml(url)
  const meta = parseHtmlMeta(html, url)
  return { ...meta, fetchedAt: new Date().toISOString() }
}
