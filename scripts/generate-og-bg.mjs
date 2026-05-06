// OG画像の青ベース + AE風グレインノイズ背景を 1200x630 PNG として
// 事前生成して public/og-bg.png に置く。
//
// 理由: Satori (next/og) は SVG filter (feTurbulence) や mixBlendMode を
// サポートしないため、デザイン bundle にあるノイズ感のある青背景は実行時に
// 描画できない。ノイズ + 青を 1 枚のラスタ PNG に焼き込んでおき、Satori 側
// では背景画像として読み込ませるだけで済むようにする。
//
// 使い方:
//   node scripts/generate-og-bg.mjs
//
// 注意:
//   sharp が必要。ローカル/CIでのワンショット生成想定。普段は出力済みの
//   public/og-bg.png をコミットして使う。

import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const WIDTH = 1200
const HEIGHT = 630

// ベースカラー (#002CED)。デザインバンドルと一致させる。
const R = 0x00
const G = 0x2c
const B = 0xed

// 強さ ±X の白/黒ノイズを各ピクセルに加える振幅 (0-255)
// 大きいほどザラザラ。デザインで grain (white screen) + grain (black multiply)
// を重ねていたので、それに相当するモノクロ振幅をミックス。
const HIGHLIGHT_AMP = 36
const SHADOW_AMP = 28

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function clamp8(v) {
  if (v < 0) return 0
  if (v > 255) return 255
  return v | 0
}

function buildPixels() {
  const buf = Buffer.alloc(WIDTH * HEIGHT * 3)
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = (y * WIDTH + x) * 3
      // 白ハイライト (screen 相当の加算)
      const hl = Math.random() < 0.55 ? rand(0, HIGHLIGHT_AMP) : 0
      // 黒シャドウ (multiply 相当の減算)
      const sh = Math.random() < 0.55 ? rand(0, SHADOW_AMP) : 0
      buf[i] = clamp8(R + hl - sh)
      buf[i + 1] = clamp8(G + hl - sh)
      buf[i + 2] = clamp8(B + hl - sh)
    }
  }
  return buf
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUT_PATH = join(__dirname, '..', 'public', 'og-bg.png')

await sharp(buildPixels(), {
  raw: { width: WIDTH, height: HEIGHT, channels: 3 }
})
  .png({ compressionLevel: 9 })
  .toFile(OUT_PATH)

console.log('wrote', OUT_PATH)
