import { pagePlacement, withScroll, type Viewport } from './console-dive'

const STYLES = ['transform', 'clip-path', '--console-lcd']

/**
 * Pin the page element to the LCD for one frame. `matrix` is its viewport-space
 * `matrix3d`. `lcd` is how much of the LCD look remains: its pixel rows, tint,
 * and rounded corners fade out together before the page fills the viewport.
 */
export function projectPage(element: HTMLElement, matrix: number[], viewport: Viewport, lcd: number) {
  // The scene unmounts a beat after the document lands. Never write past that.
  if (element.dataset.phase !== 'diving') return
  const scroll = window.scrollY
  const { top, left, right, bottom, radius } = pagePlacement(viewport).clip
  element.style.transform = `matrix3d(${withScroll(matrix, scroll).join(',')})`
  element.style.clipPath = `inset(${top + scroll}px ${viewport.width - right}px calc(100% - ${bottom + scroll}px) ${left}px round ${radius * lcd}px)`
  element.style.setProperty('--console-lcd', String(lcd))
  element.dataset.projected = ''
}

/** Hand the page back to normal flow once it is no longer on the LCD. */
export function releasePage(element: HTMLElement) {
  for (const property of STYLES) element.style.removeProperty(property)
  delete element.dataset.projected
}
