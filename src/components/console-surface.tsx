'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, Matrix4 } from 'three'

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
  const { gl, camera } = useThree()
  const [element] = useState(() => document.createElement('div'))
  const root = useRef<ReturnType<typeof createRoot> | null>(null)
  const matrix = useRef(new Matrix4())
  const local = useRef(new Matrix4())

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
    group.current.updateWorldMatrix(true, false)
    camera.updateMatrixWorld()
    // 100 DOM pixels = one model unit; explicit top-left origin avoids
    // percentage translations and CSS perspective origins varying by browser.
    local.current.makeScale(0.01, -0.01, 1)
    local.current.setPosition(-width * 0.005, height * 0.005, 0)
    matrix.current.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)
      .multiply(group.current.matrixWorld).multiply(local.current)
    const m = matrix.current.elements
    const w = gl.domElement.clientWidth / 2
    const h = gl.domElement.clientHeight / 2
    const values = [
      w * (m[0] + m[3]), h * (m[3] - m[1]), 0, m[3],
      w * (m[4] + m[7]), h * (m[7] - m[5]), 0, m[7],
      0, 0, 1, 0,
      w * (m[12] + m[15]), h * (m[15] - m[13]), 0, m[15]
    ]
    element.style.transform = `matrix3d(${values.join(',')})`
    element.style.visibility = m[15] > 0 ? 'visible' : 'hidden'
  })

  return <group ref={group} position={position} />
}
