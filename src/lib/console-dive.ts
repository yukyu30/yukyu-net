export interface Viewport { width: number; height: number }

export const CAMERA = { fov: 35, distance: 10 }

/** The LCD glass in model units, relative to the console's origin. */
export const LCD = { width: 2.59, height: 2.23, y: 0.57, z: 0.532, radius: 0.05 }

const HALF_FOV_TAN = Math.tan(CAMERA.fov * Math.PI / 360)
const HOME_VIEW_HEIGHT = 2 * CAMERA.distance * HALF_FOV_TAN
const WINDUP_PULLBACK = 0.7

/** Device scale that keeps the whole console in the home framing. */
export function homeScale({ width, height }: Viewport) {
  return Math.min(1, HOME_VIEW_HEIGHT * width / height / 6.2, HOME_VIEW_HEIGHT / 5.8)
}

/** Length of one model unit on screen while the console rests in the home framing. */
export function homePixelsPerUnit(viewport: Viewport) {
  return viewport.height / HOME_VIEW_HEIGHT * homeScale(viewport)
}

/**
 * Where the destination page sits on the LCD: a viewport-shaped sheet that
 * spans the glass in one axis, pinned to its top edge. `clip` is the glass
 * outline in page pixels, so content past the fold fills a taller LCD.
 */
export function pagePlacement({ width, height }: Viewport) {
  const unitsPerPixel = Math.min(LCD.width / width, LCD.height / height)
  const pillar = (LCD.width / unitsPerPixel - width) / 2
  return {
    unitsPerPixel,
    y: LCD.y + LCD.height / 2 - height * unitsPerPixel / 2,
    clip: {
      top: 0,
      left: -pillar,
      right: width + pillar,
      bottom: LCD.height / unitsPerPixel,
      radius: LCD.radius / unitsPerPixel
    }
  }
}

export interface Surface { width: number; height: number; unitsPerPixel: number }

/**
 * CSS `matrix3d` that lays a DOM box over a plane in the scene. `mvp` is the
 * column-major projection × view × world matrix of the plane's centre; the box
 * is centred there with its top-left as the CSS transform origin.
 */
export function surfaceMatrix(mvp: ArrayLike<number>, { width, height, unitsPerPixel }: Surface, viewport: Viewport) {
  const left = -width * unitsPerPixel / 2
  const top = height * unitsPerPixel / 2
  const column = (index: number) => [0, 1, 3].map(row => mvp[index * 4 + row])
  const [x, y, origin] = [column(0), column(1), column(3)]
  const right = x.map(value => value * unitsPerPixel)
  const down = y.map(value => -value * unitsPerPixel)
  const corner = origin.map((value, row) => value + x[row] * left + y[row] * top)
  const w = viewport.width / 2
  const h = viewport.height / 2
  const css = ([nx, ny, nw]: number[]) => [w * (nx + nw), h * (nw - ny), 0, nw]
  return [...css(right), ...css(down), 0, 0, 1, 0, ...css(corner)]
}

export interface DiveMotion { windup: number; dive: number }

/**
 * Camera position for the dive from the home framing into the LCD. The windup
 * backs straight away first. The dive ends where the page sheet exactly fills
 * the viewport. Distance changes geometrically so the zoom reads as one steady
 * push, and the sheet's centre drifts to the middle of the view in a straight line.
 */
export function diveCamera({ windup, dive }: DiveMotion, viewport: Viewport, scale: number) {
  const page = pagePlacement(viewport)
  const plane = LCD.z * scale
  const from = CAMERA.distance + WINDUP_PULLBACK * windup - plane
  const to = viewport.height * page.unitsPerPixel * scale / (2 * HALF_FOV_TAN)
  const distance = from * (to / from) ** dive
  const drift = 1 - distance / from * (1 - dive)
  return { x: 0, y: page.y * scale * drift, z: plane + distance }
}

/** Ease in and out so the push starts gently and settles onto the page. */
export function easeDive(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (2 - 2 * t) ** 3 / 2
}

/**
 * Re-express a viewport-space `matrix3d` for an element that scrolled with the
 * document, so what is visible keeps landing in the same place.
 */
export function withScroll(matrix: number[], scrollY: number) {
  if (!scrollY) return matrix
  const next = [...matrix]
  for (let row = 0; row < 4; row++) next[12 + row] -= scrollY * matrix[4 + row]
  for (let column = 0; column < 4; column++) next[column * 4 + 1] += scrollY * next[column * 4 + 3]
  return next
}
