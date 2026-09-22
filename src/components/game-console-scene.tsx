'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Html, Lightformer, RoundedBox } from '@react-three/drei'
import { Group, Mesh, Shape, Path, ExtrudeGeometry, ShapeGeometry, RingGeometry, MathUtils, DataTexture, RepeatWrapping, RGBAFormat, type Texture } from 'three'
import { HeroAvatar } from './hero-avatar'
import { ConsoleScrew } from './console-screw'
import { ConsoleRoom } from './console-room'
import { CONSOLE_MENU, ConsoleFallback, ConsoleSkeleton } from './game-console'

// Hallmark · pre-emit critique: P4 H4 E4 S5 R4 V5
const MATERIAL = {
  shell: '#002ced', back: '#0825a8', seam: '#091d7d', bezel: '#253347',
  trim: '#143bc5', button: '#edff56', metal: '#d9e2ee',
  salmon: '#ee815f', rice: '#f5f0dc', salmonLine: '#ffd0aa', coffee: '#533222', ceramic: '#eeeccf', screen: '#dce6cc', white: '#ffffff', fill: '#abc4ff'
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

function ConsoleButton({ index, grain }: { index: number; grain: Texture }) {
  const star = useMemo(() => {
    const shape = new Shape()
    const points = Array.from({ length: 10 }, (_, i) => {
      const angle = Math.PI / 2 + i * Math.PI / 5
      const radius = i % 2 === 0 ? 0.245 : 0.135
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
    })
    points.forEach((point, i) => {
      const before = points[(i + 9) % 10]
      const after = points[(i + 1) % 10]
      const amount = 0.22
      const start = { x: point.x + (before.x - point.x) * amount, y: point.y + (before.y - point.y) * amount }
      const end = { x: point.x + (after.x - point.x) * amount, y: point.y + (after.y - point.y) * amount }
      if (i === 0) shape.moveTo(start.x, start.y)
      else shape.lineTo(start.x, start.y)
      shape.quadraticCurveTo(point.x, point.y, end.x, end.y)
    })
    shape.closePath()
    return shape
  }, [])
  const mesh = useRef<Mesh>(null)
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const item = CONSOLE_MENU[index]
  const x = (index - 1) * 0.88
  const y = -1.48
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.position.z = MathUtils.damp(mesh.current.position.z, pressed ? 0.39 : 0.45, 24, delta)
  })
  return (
    <group position={[x, y, 0]}>
      <mesh position={[0, 0, 0.38]} scale={[1.12, 1.12, 1]}>
        <extrudeGeometry args={[star, { depth: 0.065, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.018, bevelThickness: 0.015 }]} />
        <meshPhysicalMaterial color={MATERIAL.shell} roughness={0.76} bumpMap={grain} bumpScale={0.008} clearcoat={0.06} />
      </mesh>
      <mesh ref={mesh} position={[0, 0, 0.45]}>
        <extrudeGeometry args={[star, { depth: 0.2, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.022, bevelThickness: 0.035 }]} />
        <meshPhysicalMaterial color={MATERIAL.button} roughness={hovered ? 0.65 : 0.76} bumpMap={grain} bumpScale={0.008} clearcoat={0.06} />
      </mesh>
      <Html transform position={[0, 0, 0.83]} distanceFactor={4} zIndexRange={[20, 10]}>
        <a href={item.href} className="console-button" aria-label={item.label}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => { setHovered(false); setPressed(false) }}
          onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onFocus={() => setHovered(true)} onBlur={() => { setHovered(false); setPressed(false) }}
          onKeyDown={event => { if (event.key === 'Enter') setPressed(true) }}
          onKeyUp={() => setPressed(false)}>
          <span className="console-button__label">{item.label}</span>
        </a>
      </Html>
    </group>
  )
}

function FoodCharms({ reduced }: { reduced: boolean }) {
  const charm = useRef<Group>(null)
  useFrame(({ clock }, delta) => {
    if (charm.current) charm.current.rotation.z = MathUtils.damp(charm.current.rotation.z, reduced ? 0 : Math.sin(clock.elapsedTime * 1.3) * 0.065, 5, delta)
  })
  return <group ref={charm} position={[1.74, 2.44, 0.04]}>
    {[[0.1, 0.03], [0.24, -0.09], [0.34, -0.25], [0.38, -0.43], [0.38, -0.59]].map(([x, y], i) => (
      <mesh key={i} position={[x, y, 0]} rotation={[0, i % 2 ? 0.9 : 0.1, -0.5]}>
        <torusGeometry args={[0.095, 0.022, 10, 24]} />
        <meshStandardMaterial color={MATERIAL.metal} metalness={0.9} roughness={0.25} />
      </mesh>
    ))}
    <mesh position={[0.38, -0.72, 0]} rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[0.065, 0.023, 12, 24]} />
      <meshStandardMaterial color={MATERIAL.metal} metalness={0.85} roughness={0.28} />
    </mesh>
    <group position={[0.38, -0.98, 0]} rotation={[0.28, 0, -0.15]}>
      <mesh>
        <cylinderGeometry args={[0.23, 0.19, 0.4, 40]} />
        <meshStandardMaterial color={MATERIAL.ceramic} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.207, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.203, 40]} />
        <meshStandardMaterial color={MATERIAL.coffee} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.205, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.216, 0.017, 10, 40]} />
        <meshStandardMaterial color={MATERIAL.ceramic} roughness={0.55} />
      </mesh>
      <mesh position={[0.24, 0, 0]} scale={[0.85, 1, 1]}>
        <torusGeometry args={[0.13, 0.036, 12, 32]} />
        <meshStandardMaterial color={MATERIAL.ceramic} roughness={0.55} />
      </mesh>
    </group>
    {[[0.52, -0.47], [0.68, -0.53], [0.84, -0.6]].map(([x, y], i) => (
      <mesh key={`sushi-chain-${i}`} position={[x, y, -0.1]} rotation={[0, i % 2 ? 0.95 : 0, -0.25]}>
        <torusGeometry args={[0.092, 0.02, 10, 24]} />
        <meshStandardMaterial color={MATERIAL.metal} metalness={0.9} roughness={0.25} />
      </mesh>
    ))}
    <group position={[0.98, -0.97, -0.1]} rotation={[0.12, -0.12, -0.14]}>
      <mesh position={[-0.1, 0.25, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.07, 0.023, 12, 24]} />
        <meshStandardMaterial color={MATERIAL.metal} metalness={0.85} roughness={0.28} />
      </mesh>
      <RoundedBox args={[0.57, 0.24, 0.3]} radius={0.1} smoothness={4} position={[0, -0.06, 0]}>
        <meshStandardMaterial color={MATERIAL.rice} roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.65, 0.15, 0.34]} radius={0.065} smoothness={4} position={[0, 0.1, 0]}>
        <meshStandardMaterial color={MATERIAL.salmon} roughness={0.6} />
      </RoundedBox>
      {[-0.21, -0.07, 0.07, 0.21].map(x => <mesh key={x} position={[x, 0.105, 0.174]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.011, 0.105, 4, 8]} />
        <meshStandardMaterial color={MATERIAL.salmonLine} roughness={0.7} />
      </mesh>)}
    </group>
  </group>
}

function Device({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady])
  const group = useRef<Group>(null)
  const cover = useRef<Group>(null)
  const opening = useRef(0)
  const [coverRemoved, setCoverRemoved] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [started, setStarted] = useState(false)
  const [removedCount, setRemovedCount] = useState(0)
  const [squint, setSquint] = useState(false)
  const expressionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (expressionTimer.current) clearTimeout(expressionTimer.current)
  }, [])
  const onScrewTurn = useCallback(() => {
    setStarted(true)
    setSquint(true)
    if (expressionTimer.current) clearTimeout(expressionTimer.current)
    expressionTimer.current = setTimeout(() => {
      setSquint(false)
      expressionTimer.current = null
    }, 1000)
  }, [])
  const onScrewRemoved = useCallback(() => setRemovedCount(count => count + 1), [])
  const resetScrews = () => {
    if (expressionTimer.current) clearTimeout(expressionTimer.current)
    expressionTimer.current = null
    setSquint(false)
    opening.current = 0
    cover.current?.position.set(0, 0, 0)
    cover.current?.rotation.set(0, 0, 0)
    setCoverRemoved(false)
    setResetKey(key => key + 1)
    setStarted(false)
    setRemovedCount(0)
  }
  const grain = useMemo(() => {
    const pixels = new Uint8Array(128 * 128 * 4)
    let seed = 317
    for (let i = 0; i < pixels.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      const value = 90 + (seed % 76)
      pixels[i] = pixels[i + 1] = pixels[i + 2] = value
      pixels[i + 3] = 255
    }
    const texture = new DataTexture(pixels, 128, 128, RGBAFormat)
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(7, 7)
    texture.needsUpdate = true
    return texture
  }, [])
  useEffect(() => () => grain.dispose(), [grain])
  const viewport = useThree(state => state.viewport)
  const scale = Math.min(1, viewport.width / 6.2, viewport.height / 5.8)
  const reduced = useReducedMotion()
  const pointer = useRef({ x: 0, y: 0 })
  const shape = useMemo(() => {
    const s = new Shape()
    s.moveTo(-1.72, 2.38)
    s.lineTo(1.72, 2.38)
    s.quadraticCurveTo(1.9, 2.38, 1.9, 2.2)
    s.lineTo(1.9, -2.07)
    s.quadraticCurveTo(1.9, -2.25, 1.72, -2.25)
    s.lineTo(-1.72, -2.25)
    s.quadraticCurveTo(-1.9, -2.25, -1.9, -2.07)
    s.lineTo(-1.9, 2.2)
    s.quadraticCurveTo(-1.9, 2.38, -1.72, 2.38)
    return s
  }, [])
  const extrusion = useMemo(() => ({ depth: 0.24, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.1, bevelThickness: 0.1, curveSegments: 48 }), [])
  const shellGeometry = useMemo(() => {
    const sides = new ExtrudeGeometry(shape, extrusion)
    const positions = sides.getAttribute('position')
    const normals = sides.getAttribute('normal')
    const indices = []
    // Replace only the front cap so the screw recesses are actual openings.
    for (let i = 0; i < positions.count; i += 3) {
      if (normals.getZ(i) > 0.99 && positions.getZ(i) > 0.3) continue
      indices.push(i, i + 1, i + 2)
    }
    sides.setIndex(indices)
    const face = shape.clone()
    for (const x of [-1.65, 1.65]) for (const y of [-2.01, 2.14]) {
      const hole = new Path()
      hole.absarc(x, y, 0.2, 0, Math.PI * 2, true)
      face.holes.push(hole)
    }
    const cap = new ShapeGeometry(face, 48)
    const recess = new RingGeometry(0.125, 0.2, 48)
    const points = recess.getAttribute('position')
    for (let i = 0; i < points.count; i++) {
      const radius = Math.hypot(points.getX(i), points.getY(i))
      points.setZ(i, (radius - 0.125) / (0.2 - 0.125) * 0.075)
    }
    recess.computeVertexNormals()
    return { sides, cap, recess }
  }, [shape, extrusion])
  useEffect(() => () => {
    shellGeometry.sides.dispose()
    shellGeometry.cap.dispose()
    shellGeometry.recess.dispose()
  }, [shellGeometry])

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
      pointer.current = { x: event.clientX / innerWidth * 2 - 1, y: event.clientY / innerHeight * 2 - 1 }
    }
    const reset = () => { pointer.current = { x: 0, y: 0 } }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('blur', reset)
    document.documentElement.addEventListener('pointerleave', reset)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', reset)
      document.documentElement.removeEventListener('pointerleave', reset)
    }
  }, [])
  useFrame(({ clock }, delta) => {
    if (!group.current) return
    if (cover.current && removedCount === 4 && !coverRemoved) {
      opening.current = reduced ? 1 : Math.min(1, opening.current + delta / 1.4)
      const t = opening.current
      cover.current.position.z = Math.sin(t * Math.PI / 2) * 1.2
      cover.current.position.y = t * t * 6.5
      cover.current.rotation.x = -t * 0.3
      cover.current.rotation.z = t * 0.1
      if (t === 1) setCoverRemoved(true)
    }
    group.current.position.y = reduced ? 0 : Math.sin(clock.elapsedTime * 0.85) * 0.045
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, reduced ? 0 : -pointer.current.y * 0.045, 5, delta)
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, reduced ? -0.08 : -0.08 + pointer.current.x * 0.08, 5, delta)
  })
  return (
    <group ref={group} scale={scale} rotation={[0, -0.08, -0.035]}>
      <mesh position={[0, 0, -0.3]}>
        <extrudeGeometry args={[shape, extrusion]} />
        <meshPhysicalMaterial color={MATERIAL.back} roughness={0.8} bumpMap={grain} bumpScale={0.012} clearcoat={0.05} />
      </mesh>
      <mesh position={[0, 0, -0.04]} scale={[1.008, 1.008, 0.1]}>
        <extrudeGeometry args={[shape, extrusion]} />
        <meshStandardMaterial color={MATERIAL.seam} roughness={0.7} />
      </mesh>
      {removedCount === 4 && <ConsoleRoom showCharacter={coverRemoved} />}
      {!coverRemoved && <group ref={cover}>
      <mesh position={[0, 0, 0.015]} geometry={shellGeometry.sides}>
        <meshPhysicalMaterial color={MATERIAL.shell} roughness={0.76} metalness={0} bumpMap={grain} bumpScale={0.014} clearcoat={0.08} clearcoatRoughness={0.7} />
      </mesh>
      <mesh geometry={shellGeometry.cap} position={[0, 0, 0.355]}>
        <meshPhysicalMaterial color={MATERIAL.shell} roughness={0.76} bumpMap={grain} bumpScale={0.014} clearcoat={0.08} clearcoatRoughness={0.7} />
      </mesh>
      {[-1.65, 1.65].flatMap(x => [-2.01, 2.14].map(y => (
        <group key={`${x}-${y}`} position={[x, y, 0]}>
          <mesh geometry={shellGeometry.recess} position={[0, 0, 0.28]}>
            <meshStandardMaterial color={MATERIAL.shell} roughness={0.8} bumpMap={grain} bumpScale={0.006} />
          </mesh>
        </group>
      )))}
      <RoundedBox args={[3.06, 2.72, 0.12]} radius={0.1} smoothness={6} position={[0, 0.57, 0.36]}>
        <meshStandardMaterial color={MATERIAL.trim} roughness={0.45} metalness={0.4} />
      </RoundedBox>
      <RoundedBox args={[2.94, 2.59, 0.1]} radius={0.08} smoothness={6} position={[0, 0.57, 0.44]}>
        <meshStandardMaterial color={MATERIAL.bezel} roughness={0.36} />
      </RoundedBox>
      <RoundedBox args={[2.63, 2.27, 0.04]} radius={0.06} smoothness={5} position={[0, 0.57, 0.5]}>
        <meshStandardMaterial color={MATERIAL.screen} roughness={0.4} />
      </RoundedBox>
      {removedCount < 4 && <Html transform position={[0, 0.57, 0.532]} distanceFactor={4} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div className="console-screen"><HeroAvatar showFallback={false} squint={squint} /><div className="console-screen__glass" /></div>
      </Html>}
      {removedCount < 4 && <Html transform position={[0.5, 2.13, 0.365]} distanceFactor={4} zIndexRange={[20, 10]}>
        <a className="console-sticker" href="https://x.com/yukyu30" target="_blank" rel="noopener noreferrer" aria-label="Xで @yukyu30 を見る（新しいタブ）">
          <img src="/images/console/yukyu30-hologram.png" alt="X @yukyu30" width={2172} height={724} />
        </a>
      </Html>}
      {removedCount < 4 && CONSOLE_MENU.map((item, index) => <ConsoleButton key={item.href} index={index} grain={grain} />)}
      </group>}
      {[-1.65, 1.65].flatMap(x => [-2.01, 2.14].map(y => (
        <ConsoleScrew key={`${resetKey}-${x}-${y}`} x={x} y={y}
          label={`${y > 0 ? '上' : '下'}${x < 0 ? '左' : '右'}`}
          reduced={reduced} colors={MATERIAL} onTurn={onScrewTurn} onRemoved={onScrewRemoved} />
      )))}
      {started && <Html center position={[0, -2.7, 0.5]} zIndexRange={[30, 20]}>
        <div className="console-disassembly">
          <span role="status" aria-live="polite">{coverRemoved ? 'ひみつの部屋' : `${removedCount} / 4`}</span>
          <button type="button" onClick={resetScrews}>{removedCount === 4 ? 'カバーを戻す' : 'ネジを戻す'}</button>
        </div>
      </Html>}
      <FoodCharms reduced={reduced} />
      <mesh position={[1.7, 2.34, -0.13]} rotation={[0, 0, -0.5]}>
        <torusGeometry args={[0.19, 0.065, 16, 48]} />
        <meshStandardMaterial color={MATERIAL.metal} metalness={0.95} roughness={0.18} />
      </mesh>
    </group>
  )
}

export default function ConsoleScene() {
  const [lost, setLost] = useState(false)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  if (lost) return <ConsoleFallback />
  return (
    <>
    {!ready && <ConsoleSkeleton />}
    <Canvas resize={{ debounce: { scroll: 0, resize: 0 } }} camera={{ position: [0, 0, 10], fov: 35 }} dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true }} fallback={<ConsoleFallback />}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', () => setLost(true), { once: true })
      }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[-3, 5, 7]} intensity={3} color={MATERIAL.white} />
      <directionalLight position={[4, -2, 4]} intensity={1} color={MATERIAL.fill} />
      <Environment resolution={128}>
        <Lightformer position={[-3, 3, 5]} scale={[3, 5, 1]} intensity={3} />
        <Lightformer position={[4, 1, 2]} scale={[2, 5, 1]} intensity={2} />
      </Environment>
      <Device onReady={onReady} />
    </Canvas>
    </>
  )
}
