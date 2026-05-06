import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const WIDTH = 1200
const HEIGHT = 630

async function loadJpFont(text: string): Promise<ArrayBuffer | null> {
  // Google Fonts API でグリフサブセット指定で TTF を取りに行く。
  // text パラメータで必要な文字だけ含む TTF が返ってきて軽い。
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@800&text=' +
        encodeURIComponent(text),
      {
        headers: {
          // user-agent 次第で TTF/WOFF2 が切り替わるので、TTF が返る古めの UA を要求
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

  const fontText = title + 'yukyu.net/index'
  const jpFont = await loadJpFont(fontText)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: '#fafaf7',
          color: '#0a0a0a'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }}>
          <span style={{ color: '#002ced', fontSize: 96, fontWeight: 800 }}>/</span>
          <span style={{ fontSize: 96, fontWeight: 800, marginLeft: 4 }}>index</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.25,
              maxWidth: '100%'
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, color: '#666' }}>yukyu.net</div>
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
