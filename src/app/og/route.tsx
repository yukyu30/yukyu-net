import { ImageResponse } from 'next/og'

const WIDTH = 1200
const HEIGHT = 630

const COLOR_BG = '#fafaf7'
const COLOR_INK = '#0a0a0a'
const COLOR_ACCENT = '#002ced'
const COLOR_MUTED = '#666666'

async function loadJpFont(text: string): Promise<ArrayBuffer | null> {
  // Google Fonts API でグリフサブセット指定で TTF を取りに行く。
  // text パラメータで必要な文字だけ含む TTF が返ってきて軽い。
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@800&text=' +
        encodeURIComponent(text),
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
        }
      }
    )
    if (!cssRes.ok) return null
    const css = await cssRes.text()
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?truetype['"]?\)/)
    if (!match) return null
    const fontRes = await fetch(match[1])
    if (!fontRes.ok) return null
    return await fontRes.arrayBuffer()
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawTitle = searchParams.get('title') ?? 'yukyu.net'
  const title = rawTitle.length > 80 ? rawTitle.slice(0, 80) + '…' : rawTitle

  const fontText = title + 'yukyu.netPostsTagsWorksMe'
  const jpFont = await loadJpFont(fontText)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: COLOR_BG,
          color: COLOR_INK
        }}
      >
        {/* サイトヘッダーと同じ黒バー */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: COLOR_INK,
            color: COLOR_BG,
            padding: '24px 56px',
            fontSize: 26,
            letterSpacing: '0.02em',
            fontWeight: 700
          }}
        >
          <span>yukyu.net</span>
          <div style={{ display: 'flex', gap: 24, fontSize: 20, fontWeight: 400, opacity: 0.85 }}>
            <span>Index</span>
            <span>Posts</span>
            <span>Tags</span>
            <span>Works</span>
            <span>Me</span>
          </div>
        </div>

        {/* タイトル本体 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            padding: '0 56px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span
              style={{
                color: COLOR_ACCENT,
                fontSize: 96,
                fontWeight: 800,
                lineHeight: 1,
                marginRight: 12
              }}
            >
              /
            </span>
            <span
              style={{
                fontSize: 60,
                fontWeight: 800,
                lineHeight: 1.25,
                marginTop: 18
              }}
            >
              {title}
            </span>
          </div>
        </div>

        {/* 下部の余白とアクセント線 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 56px 36px',
            gap: 16,
            color: COLOR_MUTED,
            fontSize: 22
          }}
        >
          <span style={{ width: 48, height: 3, background: COLOR_ACCENT }} />
          <span>yukyu.net</span>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: jpFont
        ? [
            {
              name: 'NotoSansJP',
              data: jpFont,
              style: 'normal',
              weight: 800
            }
          ]
        : undefined
    }
  )
}
