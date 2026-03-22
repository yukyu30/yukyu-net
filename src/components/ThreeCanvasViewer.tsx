'use client'

import { useRef, useEffect, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface SearchStatus {
  message: string
  documents?: string[]
}

interface SourceInfo {
  slug: string
  title: string
}

interface ThreeCanvasViewerProps {
  sourceCanvas: HTMLCanvasElement | null
  glbPath: string
  className?: string
  isSearching?: boolean
  searchStatus?: SearchStatus | null
  linkedSources?: SourceInfo[]
}

const MAX_POLAR = Math.PI / 6
const MAX_AZIMUTH = Math.PI / 4

// === 検索オーバーレイ描画 ===
function drawSearchOverlay(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  time: number,
  searchStatus: SearchStatus | null,
) {
  const bandY = h * 0.15
  const bandH = h * 0.5
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, bandY, w, bandH)
  ctx.strokeStyle = '#4ade80'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, bandY); ctx.lineTo(w, bandY)
  ctx.moveTo(0, bandY + bandH); ctx.lineTo(w, bandY + bandH)
  ctx.stroke()

  ctx.fillStyle = 'rgba(74, 222, 128, 0.03)'
  for (let y = bandY; y < bandY + bandH; y += 4) ctx.fillRect(0, y, w, 1)

  const cx = w / 2, cy = h / 2
  const angle = time * 2
  ctx.save()
  ctx.translate(cx, cy - 20)
  ctx.rotate(angle)
  const lensR = 35
  ctx.beginPath(); ctx.arc(0, 0, lensR, 0, Math.PI * 2)
  ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 5; ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(lensR * 0.7, lensR * 0.7); ctx.lineTo(lensR * 1.4, lensR * 1.4)
  ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke()
  ctx.restore()

  const dots = '.'.repeat(Math.floor(time * 3) % 4)
  ctx.font = 'bold 30px monospace'
  ctx.fillStyle = '#4ade80'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(`検索中${dots}`, cx, cy + 45)

  const logX = w * 0.55, lineH = 16
  let cursorY = bandY + 16
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  ctx.font = '11px monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillText('$ decoboco-search', logX, cursorY); cursorY += lineH
  if (searchStatus?.message) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText(`> ${searchStatus.message}`, logX, cursorY); cursorY += lineH
  }
  if (searchStatus?.documents) {
    ctx.font = '10px monospace'; cursorY += 4
    searchStatus.documents.forEach((doc, i) => {
      if (cursorY > bandY + bandH - 16) return
      const elapsed = time - i * 0.4
      if (elapsed < 0) return
      const fullText = `[FOUND] ${doc}`
      const chars = Math.min(fullText.length, Math.floor(elapsed * 25))
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.fillText(fullText.slice(0, chars), logX + 8, cursorY)
      cursorY += lineH
    })
  }
}

// === GLBモデル + テクスチャ合成 ===
function Model({
  glbPath,
  sourceCanvas,
  isSearching,
  searchStatus,
}: {
  glbPath: string
  sourceCanvas: HTMLCanvasElement | null
  isSearching: boolean
  searchStatus: SearchStatus | null
}) {
  const gltf = useLoader(GLTFLoader, glbPath)
  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf])
  const compositeRef = useRef<HTMLCanvasElement | null>(null)
  const texRef = useRef<THREE.CanvasTexture | null>(null)
  const searchStartRef = useRef(0)
  const wasSearchingRef = useRef(false)

  const toonGradient = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([80, 160, 255]), 3, 1, THREE.RedFormat)
    t.minFilter = THREE.NearestFilter
    t.magFilter = THREE.NearestFilter
    t.needsUpdate = true
    return t
  }, [])

  useEffect(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 512
    compositeRef.current = c
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.flipY = false
    texRef.current = tex

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshToonMaterial({ map: tex, gradientMap: toonGradient })
      }
    })

    // スケーリング（リセットしてから再計算）
    clonedScene.scale.setScalar(1)
    clonedScene.position.set(0, 0, 0)
    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    clonedScene.scale.setScalar(0.81 / maxDim)
    const scaledBox = new THREE.Box3().setFromObject(clonedScene)
    const center = scaledBox.getCenter(new THREE.Vector3())
    clonedScene.position.sub(center)
    clonedScene.position.y += 0.5

    return () => { tex.dispose() }
  }, [clonedScene, toonGradient])

  useEffect(() => {
    if (isSearching && !wasSearchingRef.current) {
      searchStartRef.current = performance.now() / 1000
    }
    wasSearchingRef.current = isSearching
  }, [isSearching])

  useFrame(() => {
    const c = compositeRef.current
    const tex = texRef.current
    if (!c || !tex) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, 512, 512)
    if (sourceCanvas) {
      ctx.drawImage(sourceCanvas, 0, 0, 512, 512)
    } else {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 512, 512)
    }
    if (isSearching) {
      drawSearchOverlay(ctx, 512, 512, performance.now() / 1000 - searchStartRef.current, searchStatus)
    }
    tex.needsUpdate = true
  })

  return <primitive object={clonedScene} />
}

// === ドラッグ回転 ===
function DragControls({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)
  const dragging = useRef(false)
  const prev = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const { gl } = useThree()

  useEffect(() => {
    const el = gl.domElement
    const onDown = (e: PointerEvent) => { dragging.current = true; prev.current = { x: e.clientX, y: e.clientY }; el.style.cursor = 'grabbing' }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      target.current.y = Math.max(-MAX_AZIMUTH, Math.min(MAX_AZIMUTH, target.current.y + (e.clientX - prev.current.x) * 0.005))
      target.current.x = Math.max(-MAX_POLAR, Math.min(MAX_POLAR, target.current.x + (e.clientY - prev.current.y) * 0.005))
      prev.current = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => { dragging.current = false; el.style.cursor = 'grab' }
    el.style.cursor = 'grab'
    el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp); el.addEventListener('pointerleave', onUp)
    return () => { el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', onUp); el.removeEventListener('pointerleave', onUp) }
  }, [gl])

  useFrame(() => {
    if (!groupRef.current) return
    current.current.y += (target.current.y - current.current.y) * 0.1
    current.current.x += (target.current.x - current.current.x) * 0.1
    groupRef.current.rotation.y = current.current.y
    groupRef.current.rotation.x = current.current.x
  })

  return <group ref={groupRef}>{children}</group>
}

// === ソースウィンドウ + 接続線 ===
function SourceWindow({ title, index, total }: { title: string; index: number; total: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const dotRef = useRef<THREE.Mesh>(null)
  const startTime = useRef(performance.now())

  const xSpread = (index - (total - 1) / 2) * 0.35
  const baseY = 0.45 + index * 0.06
  const targetZ = -0.3 - index * 0.15
  const delay = index * 0.2

  // モデル中心（接続元）
  const modelCenter = useMemo(() => new THREE.Vector3(0, 0.5, 0), [])

  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 128
    const cx = c.getContext('2d')!
    cx.fillStyle = 'rgba(0,0,0,0.9)'; cx.fillRect(0, 0, 512, 128)
    cx.strokeStyle = '#4ade80'; cx.lineWidth = 2; cx.strokeRect(2, 2, 508, 124)
    cx.fillStyle = '#166534'; cx.fillRect(2, 2, 508, 28)
    ;['#ef4444', '#fbbf24', '#22c55e'].forEach((col, i) => {
      cx.beginPath(); cx.arc(18 + i * 20, 16, 5, 0, Math.PI * 2); cx.fillStyle = col; cx.fill()
    })
    cx.font = '14px monospace'; cx.fillStyle = '#4ade80'; cx.textAlign = 'center'; cx.textBaseline = 'middle'
    cx.fillText('article.md', 256, 16)
    cx.font = '18px monospace'; cx.fillStyle = '#4ade80'; cx.textAlign = 'left'; cx.textBaseline = 'top'
    const d = title.length > 22 ? title.slice(0, 22) + '...' : title
    cx.fillText(d, 16, 42)
    cx.font = '12px monospace'; cx.fillStyle = 'rgba(74,222,128,0.4)'
    cx.fillText('> cat ./source/index.md', 16, 80)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [title])

  // 接続線オブジェクト
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3))
    const mat = new THREE.LineBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0 })
    return new THREE.Line(geo, mat)
  }, [])

  useFrame(() => {
    if (!groupRef.current || !meshRef.current || !dotRef.current) return
    const elapsed = (performance.now() - startTime.current) / 1000 - delay

    if (elapsed < 0) {
      groupRef.current.visible = false
      return
    }
    groupRef.current.visible = true

    const eased = 1 - Math.pow(1 - Math.min(1, elapsed * 2.5), 3)

    // ウィンドウ位置
    const curZ = targetZ * eased
    const curY = baseY + Math.sin(performance.now() / 800 + index) * 0.008
    meshRef.current.position.set(xSpread, curY, curZ)
    meshRef.current.scale.setScalar(eased)

    // 接続線を更新（モデル中心 → ウィンドウ位置）
    const windowPos = new THREE.Vector3(xSpread, curY, curZ)
    const positions = lineObj.geometry.attributes.position as THREE.BufferAttribute
    positions.setXYZ(0, modelCenter.x, modelCenter.y, modelCenter.z)
    positions.setXYZ(1, windowPos.x, windowPos.y, windowPos.z)
    positions.needsUpdate = true

    // 接続ドット（ウィンドウ側）
    dotRef.current.position.copy(windowPos)
    dotRef.current.scale.setScalar(eased)

    // 線とドットの透明度をアニメーション
    const lineMat = lineObj.material as THREE.LineBasicMaterial
    lineMat.opacity = eased * 0.5
    const dotMat = dotRef.current.material as THREE.MeshBasicMaterial
    dotMat.opacity = eased
  })

  return (
    <group ref={groupRef} visible={false}>
      {/* ウィンドウ */}
      <mesh ref={meshRef} rotation={[0, xSpread * 0.3, 0]}>
        <planeGeometry args={[0.55, 0.14]} />
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* モデルからウィンドウへの接続線 */}
      <primitive object={lineObj} />

      {/* 接続ドット */}
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0} />
      </mesh>
    </group>
  )
}

function CameraSetup({ fov }: { fov: number }) {
  const { camera } = useThree()
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov
      camera.lookAt(0, 0.3, 0)
      camera.updateProjectionMatrix()
    }
  }, [fov, camera])
  return null
}

// === メイン ===
export default function ThreeCanvasViewer({
  sourceCanvas, glbPath, className = '',
  isSearching = false, searchStatus = null, linkedSources = [],
}: ThreeCanvasViewerProps) {
  const [fov, setFov] = useState(35)

  return (
    <div className={`w-full h-full relative ${className}`}>
      <Canvas
        camera={{ position: [0.5, 0.8, 2.0], fov, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <CameraSetup fov={fov} />
        <ambientLight intensity={1.4} />
        <directionalLight position={[2, 3, 2]} intensity={0.6} />
        <directionalLight position={[-2, 1, -1]} intensity={0.2} color="#4ade80" />

        <Suspense fallback={null}>
          <DragControls>
            <Model
              glbPath={glbPath}
              sourceCanvas={sourceCanvas}
              isSearching={isSearching}
              searchStatus={searchStatus}
            />
            {linkedSources.map((source, i) => (
              <SourceWindow
                key={`${source.slug}-${i}`}
                title={source.title}
                index={i}
                total={linkedSources.length}
              />
            ))}
          </DragControls>
        </Suspense>
      </Canvas>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-green-800">
        <label className="text-green-400 font-mono text-xs">FOV</label>
        <input type="range" min={10} max={120} value={fov} onChange={(e) => setFov(Number(e.target.value))} className="w-24 accent-green-400" />
        <span className="text-green-400 font-mono text-xs w-6 text-right">{fov}</span>
      </div>
    </div>
  )
}
