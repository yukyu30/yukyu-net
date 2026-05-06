import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

const WIDTH = 1200
const HEIGHT = 630

const COLOR_INK = '#ffffff'
const COLOR_MUTED = 'rgba(255,255,255,0.65)'

// 青 (#002CED) + AE風グレインノイズの 1200x630 PNG。
// satori は SVG filter / mixBlendMode をサポートしないので、ノイズ感のある
// 背景は事前に scripts/generate-og-bg.mjs で焼き込んで public/og-bg.png に
// 置いてある。モジュールロード時に読み込んで data URL 化し、satori の <img>
// にそのまま流す。
const ogBgBuffer = readFileSync(join(process.cwd(), 'public', 'og-bg.png'))
const ogBgDataUrl = `data:image/png;base64,${ogBgBuffer.toString('base64')}`

async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=` +
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

  const allText = title + 'YUKYU.NET'
  const [jpFont, interTight] = await Promise.all([
    loadFont('Noto Sans JP', 900, allText),
    loadFont('Inter Tight', 900, allText),
  ])

  const fonts: { name: string; data: ArrayBuffer; style: 'normal'; weight: number }[] = []
  if (interTight) fonts.push({ name: 'InterTight', data: interTight, style: 'normal', weight: 900 })
  if (jpFont) fonts.push({ name: 'NotoSansJP', data: jpFont, style: 'normal', weight: 900 })

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex'
        }}
      >
        <img
          src={ogBgDataUrl}
          width={WIDTH}
          height={HEIGHT}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />

        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 64,
            paddingBottom: 80,
            color: COLOR_INK,
            fontFamily: '"InterTight", "NotoSansJP", sans-serif'
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: '-0.045em',
              color: COLOR_INK,
              maxWidth: 1080
            }}
          >
            {title}
          </div>

          <div
            style={{
              position: 'absolute',
              right: 64,
              bottom: 52,
              display: 'flex',
              fontSize: 18,
              color: COLOR_INK,
              fontWeight: 900,
              letterSpacing: '0.08em'
            }}
          >
            YUKYU.NET
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: fonts.length > 0 ? fonts : undefined
    }
  )
}
