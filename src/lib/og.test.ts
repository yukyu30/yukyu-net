import { describe, expect, it } from 'vitest'
import { decodeHtmlEntities, parseOgFromHtml } from './og'

describe('decodeHtmlEntities', () => {
  it('名前付き・数値参照をデコードする', () => {
    expect(decodeHtmlEntities('A &amp; B &lt;C&gt; &#39;x&#39; &quot;y&quot;')).toBe(
      'A & B <C> \'x\' "y"'
    )
    expect(decodeHtmlEntities('&#x3042;')).toBe('あ')
  })

  it('未知のエンティティはそのまま残す', () => {
    expect(decodeHtmlEntities('&unknown;')).toBe('&unknown;')
  })
})

describe('parseOgFromHtml', () => {
  const base = 'https://example.com/article'

  it('og:* を優先して抽出する', () => {
    const html = `
      <html><head>
        <title>fallback title</title>
        <meta property="og:title" content="OG タイトル" />
        <meta property="og:description" content="OG の説明文" />
        <meta property="og:image" content="https://cdn.example.com/img.png" />
        <meta property="og:site_name" content="Example" />
      </head><body></body></html>`
    expect(parseOgFromHtml(html, base)).toEqual({
      title: 'OG タイトル',
      description: 'OG の説明文',
      image: 'https://cdn.example.com/img.png',
      siteName: 'Example'
    })
  })

  it('og:title が無ければ <title> にフォールバックする', () => {
    const html = '<head><title>  ページ題名  </title></head>'
    expect(parseOgFromHtml(html, base).title).toBe('ページ題名')
  })

  it('twitter カードや name=description も拾う', () => {
    const html = `
      <meta name="twitter:title" content="TW タイトル">
      <meta name="description" content="メタ説明">
      <meta name="twitter:image" content="/rel.png">`
    const og = parseOgFromHtml(html, base)
    expect(og.title).toBe('TW タイトル')
    expect(og.description).toBe('メタ説明')
    expect(og.image).toBe('https://example.com/rel.png')
  })

  it('相対 OG 画像 URL を絶対 URL へ解決する', () => {
    const html = '<meta property="og:image" content="/assets/cover.jpg">'
    expect(parseOgFromHtml(html, base).image).toBe('https://example.com/assets/cover.jpg')
  })

  it('content 内のエンティティをデコードする', () => {
    const html = '<meta property="og:title" content="A &amp; B">'
    expect(parseOgFromHtml(html, base).title).toBe('A & B')
  })

  it('シングルクォート属性も解釈する', () => {
    const html = "<meta property='og:title' content='クォート違い'>"
    expect(parseOgFromHtml(html, base).title).toBe('クォート違い')
  })

  it('メタが無ければ undefined を返す', () => {
    const og = parseOgFromHtml('<html><body>本文</body></html>', base)
    expect(og.title).toBeUndefined()
    expect(og.image).toBeUndefined()
  })
})
