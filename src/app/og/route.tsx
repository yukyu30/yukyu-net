import { ImageResponse } from 'next/og'

const WIDTH = 1200
const HEIGHT = 630

const COLOR_BG = '#002CED'
const COLOR_INK = '#ffffff'
const COLOR_MUTED = 'rgba(255,255,255,0.7)'

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

  const fontText = title + 'yukyu.net'
  const jpFont = await loadJpFont(fontText)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '72px 64px',
          backgroundImage:
            'radial-gradient(ellipse at 25% 20%, #1a45ff 0%, #002CED 45%, #001a8c 100%)',
          color: COLOR_INK
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              width: 48,
              height: 4,
              background: COLOR_INK,
              opacity: 0.85,
              marginRight: 16
            }}
          />
          <span style={{ fontSize: 22, color: COLOR_MUTED, letterSpacing: '0.04em' }}>
            yukyu.net
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            color: COLOR_INK,
            maxWidth: '100%'
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            fontSize: 24,
            fontWeight: 700,
            color: COLOR_INK
          }}
        >
          yukyu.net
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
