'use client'

import { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'

export const SCREW_TURNS = 4

export function ConsoleScrew({ x, y, label, reduced, colors, onTurn, onRemoved }: {
  x: number
  y: number
  label: string
  reduced: boolean
  colors: { trim: string; seam: string; metal: string }
  onTurn: () => void
  onRemoved: () => void
}) {
  const [turns, setTurns] = useState(0)
  const [removed, setRemoved] = useState(false)
  const screw = useRef<Group>(null)
  const progress = useRef(0)
  const notified = useRef(false)

  useFrame((_, delta) => {
    if (!screw.current || notified.current) return
    progress.current = reduced ? turns : MathUtils.damp(progress.current, turns, 7, delta)
    const value = progress.current
    screw.current.rotation.z = 0.45 - value * Math.PI * 1.5
    screw.current.position.z = 0.268 + value * 0.095
    const exit = turns === SCREW_TURNS ? MathUtils.smoothstep(value, 3.55, 4) : 0
    screw.current.position.x = Math.sign(x) * exit * 0.36
    screw.current.position.y = -exit * 0.2
    screw.current.scale.setScalar(1 - exit)
    if (turns === SCREW_TURNS && value > SCREW_TURNS - 0.005) {
      notified.current = true
      setRemoved(true)
      onRemoved()
    }
  })

  return <group position={[x, y, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.245]}>
      <cylinderGeometry args={[0.124, 0.124, 0.015, 32]} />
      <meshStandardMaterial color={colors.seam} roughness={0.9} />
    </mesh>
    {!removed && <group ref={screw} position={[0, 0, 0.268]} rotation={[0, 0, 0.45]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.11]}>
        <cylinderGeometry args={[0.037, 0.03, 0.22, 16]} />
        <meshStandardMaterial color={colors.metal} metalness={0.8} roughness={0.35} />
      </mesh>
      {[-0.19, -0.15, -0.11, -0.07, -0.03].map(z => <mesh key={z} position={[0, 0, z]}>
        <torusGeometry args={[0.038, 0.009, 6, 16]} />
        <meshStandardMaterial color={colors.metal} metalness={0.8} roughness={0.35} />
      </mesh>)}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.112, 0.112, 0.024, 32]} />
        <meshStandardMaterial color={colors.trim} metalness={0.3} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0, 0.013]}>
        <boxGeometry args={[0.145, 0.024, 0.003]} />
        <meshStandardMaterial color={colors.seam} roughness={1} />
      </mesh>
    </group>}
    {!removed && <Html center position={[0, 0, 0.5]} zIndexRange={[30, 20]}>
      <button type="button" className="console-screw" disabled={turns === SCREW_TURNS}
        aria-label={`${label}のネジを緩める（${turns}/${SCREW_TURNS}）`}
        data-turns={turns}
        onClick={() => { setTurns(value => Math.min(value + 1, SCREW_TURNS)); onTurn() }} />
    </Html>}
  </group>
}
