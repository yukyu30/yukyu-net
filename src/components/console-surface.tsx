'use client'

import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createRoot } from 'react-dom/client'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, MathUtils, Matrix4, type Camera } from 'three'
import { LCD, pagePlacement, surfaceMatrix, type Surface, type Viewport } from '@/lib/console-dive'
import { projectPage } from '@/lib/console-page'

const mvp = new Matrix4()

/** CSS transform that pins a DOM box to `group` as seen through `camera`. */
function projectSurface(group: Group, camera: Camera, surface: Surface, viewport: Viewport) {
  group.updateWorldMatrix(true, false)
  camera.updateMatrixWorld()
  mvp.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse).multiply(group.matrixWorld)
  return surfaceMatrix(mvp.elements, surface, viewport)
}

/** Project a fixed-size DOM surface through the same camera as the console. */
export function ConsoleSurface({ position, width, height, children, interactive = true, layer = 10 }: {
  position: [number, number, number]
  width: number
  height: number
  children: ReactNode
  interactive?: boolean
  layer?: number
}) {
  const group = useRef<Group>(null)
  const { gl, camera, size } = useThree()
  const [element] = useState(() => document.createElement('div'))
  const root = useRef<ReturnType<typeof createRoot> | null>(null)

  useLayoutEffect(() => {
    const target = gl.domElement.parentElement!
    target.style.position = 'relative'
    target.appendChild(element)
    const current = createRoot(element)
    root.current = current
    return () => { current.unmount(); element.remove(); root.current = null }
  }, [element, gl])

  useLayoutEffect(() => {
    Object.assign(element.style, {
      position: 'absolute', left: '0px', top: '0px', width: `${width}px`, height: `${height}px`,
      transformOrigin: '0 0', pointerEvents: interactive ? 'auto' : 'none', zIndex: String(layer)
    })
    root.current?.render(children)
  }, [children, element, width, height, interactive, layer])

  useFrame(() => {
    if (!group.current) return
    // 100 DOM pixels = one model unit.
    const matrix = projectSurface(group.current, camera, { width, height, unitsPerPixel: 0.01 }, size)
    element.style.transform = `matrix3d(${matrix.join(',')})`
    element.style.visibility = matrix[15] > 0 ? 'visible' : 'hidden'
  })

  return <group ref={group} position={position} />
}

/**
 * Show the destination page on the LCD: the real document is transformed onto
 * the glass, so the dive ends with it already in place at full size.
 */
export function ConsolePage({ element, dive }: { element: HTMLElement; dive: RefObject<number> }) {
  const group = useRef<Group>(null)
  const { camera, size } = useThree()
  const { y, unitsPerPixel } = pagePlacement(size)

  useFrame(() => {
    if (!group.current) return
    const matrix = projectSurface(group.current, camera, { ...size, unitsPerPixel }, size)
    projectPage(element, matrix, size, 1 - MathUtils.smoothstep(dive.current, 0.25, 0.85))
  })

  return <group ref={group} position={[0, y, LCD.z]} />
}
