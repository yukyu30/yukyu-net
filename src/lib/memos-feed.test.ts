import { describe, it, expect } from 'vitest'
import { parseLatestMemos } from './memos-feed'

// memos.yukyu.net の公開 RSS（/u/ugo/rss.xml）の実形状に合わせたサンプル。
// description は HTML エスケープ、content:encoded は CDATA。
const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Memos</title>
    <item>
      <title>こんな感じでrailwayで管理している</title>
      <link>https://memos.yukyu.net/memos/kbJ3rXmFdfHW28hnSucGWw</link>
      <description>&lt;p&gt;こんな感じでrailwayで管理している&lt;/p&gt;&#xA;</description>
      <content:encoded><![CDATA[<p>こんな感じでrailwayで管理している<br>二行目 a&amp;b</p>
]]></content:encoded>
      <author>ugo</author>
      <guid>https://memos.yukyu.net/memos/kbJ3rXmFdfHW28hnSucGWw</guid>
      <pubDate>Sun, 21 Jun 2026 14:14:45 +0000</pubDate>
    </item>
    <item>
      <title>ふたつめ</title>
      <link>https://memos.yukyu.net/memos/two222</link>
      <description></description>
      <guid>https://memos.yukyu.net/memos/two222</guid>
      <pubDate>Sun, 21 Jun 2026 13:00:00 +0000</pubDate>
    </item>
    <item>
      <title>みっつめ</title>
      <link>https://memos.yukyu.net/memos/three33</link>
      <description></description>
      <guid>https://memos.yukyu.net/memos/three33</guid>
      <pubDate>Sun, 21 Jun 2026 12:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>`

describe('parseLatestMemos', () => {
  it('先頭から順（新しい順）に最大 limit 件返す', () => {
    const memos = parseLatestMemos(SAMPLE, 2)
    expect(memos.map(m => m.id)).toEqual(['kbJ3rXmFdfHW28hnSucGWw', 'two222'])
  })

  it('item 数が limit より少なければある分だけ返す', () => {
    expect(parseLatestMemos(SAMPLE, 10)).toHaveLength(3)
  })

  it('リンクは自サイトの /memos/{id} に組み替える', () => {
    expect(parseLatestMemos(SAMPLE, 1)[0].url).toBe('/memos/kbJ3rXmFdfHW28hnSucGWw')
  })

  it('content:encoded を本文にし、HTML 除去・<br> 改行・実体参照を復号する', () => {
    expect(parseLatestMemos(SAMPLE, 1)[0].text).toBe(
      'こんな感じでrailwayで管理している\n二行目 a&b'
    )
  })

  it('content も description も空なら title をフォールバックに使う', () => {
    expect(parseLatestMemos(SAMPLE, 2)[1].text).toBe('ふたつめ')
  })

  it('pubDate を保持する', () => {
    expect(parseLatestMemos(SAMPLE, 1)[0].date).toBe('Sun, 21 Jun 2026 14:14:45 +0000')
  })

  it('item が無ければ空配列', () => {
    expect(parseLatestMemos('<rss><channel></channel></rss>', 3)).toEqual([])
  })
})
