// memos.yukyu.net の公開 RSS（/u/ugo/rss.xml）から最新の memo を取り出す。
// 公開フィードなので API トークン不要 = サーバー専用でなくても安全に使える。
// トップページのヒーロー吹き出し用。

const FEED_URL =
  process.env.MEMOS_FEED_URL ?? 'https://memos.yukyu.net/u/ugo/rss.xml'

export interface LatestMemo {
  /** memo の uid */
  id: string
  /** 自サイト内のリンク（/memos/{id}） */
  url: string
  /** プレーンテキスト本文 */
  text: string
  /** pubDate（RFC822 のまま） */
  date: string
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x0*a;/gi, '\n')
    .replace(/&#0*10;/g, '\n')
    .replace(/&amp;/g, '&') // 二重復号を避けるため最後に
}

function htmlToText(s: string): string {
  return decodeEntities(s)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

function pick(item: string, tag: string): string {
  const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return m ? m[1] : ''
}

function itemToMemo(item: string): LatestMemo | null {
  const link = pick(item, 'link') || pick(item, 'guid')
  const id = link.split('/').filter(Boolean).pop() ?? ''
  if (!id) return null

  const cdata = item
    .match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i)?.[1]
    ?.replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')

  const raw = cdata || pick(item, 'description') || pick(item, 'title')

  return {
    id,
    url: `/memos/${id}`,
    text: htmlToText(raw),
    date: pick(item, 'pubDate').trim()
  }
}

/** RSS 先頭（新しい順）から最大 limit 件の memo を取り出す。 */
export function parseLatestMemos(xml: string, limit: number): LatestMemo[] {
  const out: LatestMemo[] = []
  const re = /<item[^>]*>([\s\S]*?)<\/item>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null && out.length < limit) {
    const memo = itemToMemo(m[1])
    if (memo) out.push(memo)
  }
  return out
}

/**
 * 最新の memo を公開 RSS から最大 limit 件取得する。失敗時は空配列。
 * 公開フィードなのでトークン不要。ISR で 10 分ごとに更新。
 */
export async function fetchLatestMemos(limit = 3): Promise<LatestMemo[]> {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: 600 } })
    if (!res.ok) return []
    return parseLatestMemos(await res.text(), limit)
  } catch {
    return []
  }
}
