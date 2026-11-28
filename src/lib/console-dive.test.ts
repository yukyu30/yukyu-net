import { describe, expect, it } from 'vitest'
import { Matrix4, PerspectiveCamera } from 'three'
import { CAMERA, LCD, diveCamera, easeDive, homePixelsPerUnit, homeScale, pagePlacement, surfaceMatrix, withScroll, type DiveMotion, type Viewport } from './console-dive'

const DESKTOP = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }

function viewProjection(viewport: Viewport, position: { x: number; y: number; z: number }, world = new Matrix4()) {
  const camera = new PerspectiveCamera(CAMERA.fov, viewport.width / viewport.height, 0.1, 1000)
  camera.position.set(position.x, position.y, position.z)
  camera.updateMatrixWorld()
  return new Matrix4().copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse).multiply(world).elements
}

/** Apply a CSS matrix3d to a point on the element's own plane. */
function transform(matrix: number[], x: number, y: number) {
  const w = matrix[3] * x + matrix[7] * y + matrix[15]
  return { x: (matrix[0] * x + matrix[4] * y + matrix[12]) / w, y: (matrix[1] * x + matrix[5] * y + matrix[13]) / w }
}

/** The matrix the destination page gets while it rides on the LCD. */
function pageMatrix(motion: DiveMotion, viewport: Viewport) {
  const scale = homeScale(viewport)
  const page = pagePlacement(viewport)
  const world = new Matrix4().makeScale(scale, scale, scale).multiply(new Matrix4().makeTranslation(0, page.y, LCD.z))
  const mvp = viewProjection(viewport, diveCamera(motion, viewport, scale), world)
  return surfaceMatrix(mvp, { ...viewport, unitsPerPixel: page.unitsPerPixel }, viewport)
}

describe('homeScale', () => {
  it('横長の画面では本体を等倍で置く', () => {
    expect(homeScale(DESKTOP)).toBe(1)
  })

  it('縦長の画面では本体が横幅に収まるまで縮める', () => {
    const scale = homeScale(PHONE)
    expect(scale).toBeLessThan(1)
    expect(scale).toBeCloseTo(0.47, 2)
  })
})

describe('homePixelsPerUnit', () => {
  const fill = (viewport: Viewport) => {
    const unit = homePixelsPerUnit(viewport)
    return Math.max(unit * 6.2 / viewport.width, unit * 5.8 / viewport.height)
  }

  it('横長の画面では本体の枠がビューポートの内側に収まる', () => {
    expect(fill(DESKTOP)).toBeLessThan(1)
  })

  it('縦長の画面では本体の枠がビューポートの幅にちょうど収まる', () => {
    expect(fill(PHONE)).toBeCloseTo(1)
  })
})

describe('pagePlacement', () => {
  it('横長の画面ではページが液晶の幅いっぱいに上端揃えで載る', () => {
    const page = pagePlacement(DESKTOP)
    expect(page.unitsPerPixel * DESKTOP.width).toBeCloseTo(LCD.width)
    expect(page.y + page.unitsPerPixel * DESKTOP.height / 2).toBeCloseTo(LCD.y + LCD.height / 2)
    expect(page.clip.top).toBe(0)
    expect(page.clip.left).toBeCloseTo(0)
    expect(page.clip.right).toBeCloseTo(DESKTOP.width)
    expect(page.clip.bottom).toBeCloseTo(LCD.height / page.unitsPerPixel)
    expect(page.clip.bottom).toBeGreaterThan(DESKTOP.height)
  })

  it('縦長の画面ではページが液晶の高さいっぱいに載り、左右に余白が残る', () => {
    const page = pagePlacement(PHONE)
    expect(page.unitsPerPixel * PHONE.height).toBeCloseTo(LCD.height)
    expect(page.y).toBeCloseTo(LCD.y)
    expect(page.clip.bottom).toBeCloseTo(PHONE.height)
    expect(page.clip.left).toBeLessThan(0)
    expect(page.clip.right - page.clip.left).toBeCloseTo(LCD.width / page.unitsPerPixel)
    expect(page.clip.right - PHONE.width).toBeCloseTo(-page.clip.left)
  })
})

describe('surfaceMatrix', () => {
  const home = { x: 0, y: 0, z: CAMERA.distance }

  it('正対する面の中心をビューポートの中心へ写す', () => {
    const matrix = surfaceMatrix(viewProjection(DESKTOP, home), { width: 200, height: 100, unitsPerPixel: 0.01 }, DESKTOP)
    const center = transform(matrix, 100, 50)
    expect(center.x).toBeCloseTo(720)
    expect(center.y).toBeCloseTo(450)
  })

  it('面の左上は、視野の高さに対するモデル寸法の比だけ中心から離れる', () => {
    const matrix = surfaceMatrix(viewProjection(DESKTOP, home), { width: 200, height: 100, unitsPerPixel: 0.01 }, DESKTOP)
    const pixelsPerUnit = DESKTOP.height / (2 * CAMERA.distance * Math.tan(CAMERA.fov * Math.PI / 360))
    const corner = transform(matrix, 0, 0)
    expect(corner.x).toBeCloseTo(720 - pixelsPerUnit)
    expect(corner.y).toBeCloseTo(450 - pixelsPerUnit / 2)
  })
})

describe('diveCamera', () => {
  it('静止中はホームの位置から本体を見る', () => {
    expect(diveCamera({ windup: 0, dive: 0 }, DESKTOP, 1)).toEqual({ x: 0, y: 0, z: CAMERA.distance })
  })

  it.each([['横長', DESKTOP], ['縦長', PHONE]])('飛び込み終えるとページが変形なしでビューポートに重なる（%s）', (_, viewport) => {
    const matrix = pageMatrix({ windup: 1, dive: 1 }, viewport)
    for (const [x, y] of [[0, 0], [viewport.width, 0], [0, viewport.height], [viewport.width, viewport.height]]) {
      const point = transform(matrix, x, y)
      expect(point.x).toBeCloseTo(x, 6)
      expect(point.y).toBeCloseTo(y, 6)
    }
  })

  it('溜めの間はまっすぐ後ろへ引く', () => {
    const camera = diveCamera({ windup: 1, dive: 0 }, DESKTOP, 1)
    expect(camera.z).toBeGreaterThan(CAMERA.distance)
    expect(camera).toMatchObject({ x: 0, y: 0 })
  })

  it.each([['横長', DESKTOP], ['縦長', PHONE]])('ページは大きくなり続け、中心は画面中央へ寄り続ける（%s）', (_, viewport) => {
    const frames = Array.from({ length: 21 }, (_, i) => pageMatrix({ windup: 1, dive: i / 20 }, viewport))
    const widths = frames.map(matrix => transform(matrix, viewport.width, 0).x - transform(matrix, 0, 0).x)
    const offsets = frames.map(matrix => Math.abs(transform(matrix, viewport.width / 2, viewport.height / 2).y - viewport.height / 2))
    for (let i = 1; i < frames.length; i++) {
      expect(widths[i]).toBeGreaterThan(widths[i - 1])
      expect(offsets[i]).toBeLessThanOrEqual(offsets[i - 1])
    }
  })
})

describe('easeDive', () => {
  it('0で始まり1で終わり、途中で戻らない', () => {
    expect(easeDive(0)).toBe(0)
    expect(easeDive(1)).toBe(1)
    for (let i = 1; i <= 50; i++) expect(easeDive(i / 50)).toBeGreaterThan(easeDive((i - 1) / 50))
  })
})

describe('withScroll', () => {
  const matrix = pageMatrix({ windup: 1, dive: 0.4 }, DESKTOP)

  it('スクロールしていなければ行列を変えない', () => {
    expect(withScroll(matrix, 0)).toEqual(matrix)
  })

  it('スクロール済みの文書でも、見えている位置を同じ場所へ写す', () => {
    const expected = transform(matrix, 200, 100)
    const actual = transform(withScroll(matrix, 300), 200, 100 + 300)
    expect(actual.x).toBeCloseTo(expected.x)
    expect(actual.y - 300).toBeCloseTo(expected.y)
  })
})
