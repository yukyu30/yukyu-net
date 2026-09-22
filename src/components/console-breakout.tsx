'use client'

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { HeroAvatar } from './hero-avatar'

const SHARDS = [
  '0 0, 48% 0, 46% 48%', '48% 0, 100% 0, 46% 48%',
  '100% 0, 100% 53%, 46% 48%', '100% 53%, 100% 100%, 46% 48%',
  '100% 100%, 54% 100%, 46% 48%', '54% 100%, 0 100%, 46% 48%',
  '0 100%, 0 47%, 46% 48%', '0 47%, 0 0, 46% 48%'
]

type Origin = { x: number; y: number; width: number; height: number }

function EscapedAvatar({ origin }: { origin: Origin }) {
  const avatar = useRef<HTMLButtonElement>(null)
  const size = Math.min(230, Math.max(130, origin.width * 0.84), window.innerWidth * 0.48)
  const position = useRef({ x: origin.x + (origin.width - size) / 2, y: origin.y + (origin.height - size) / 2 })
  const velocity = useRef({ x: 120, y: -280 })
  const drag = useRef<{ id: number; x: number; y: number; lastX: number; lastY: number; time: number } | null>(null)
  const [held, setHeld] = useState(false)
  const [shards, setShards] = useState(true)
  const reduced = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const render = () => {
    if (!avatar.current) return
    const p = position.current
    avatar.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${Math.max(-18, Math.min(18, velocity.current.x * 0.025))}deg)`
  }
  const constrain = () => {
    const p = position.current
    const maxX = Math.max(8, window.innerWidth - size - 8)
    const maxY = Math.max(8, window.innerHeight - size - 64)
    if (p.x < 8 || p.x > maxX) { p.x = Math.max(8, Math.min(maxX, p.x)); velocity.current.x *= -0.8 }
    if (p.y < 8 || p.y > maxY) { p.y = Math.max(8, Math.min(maxY, p.y)); velocity.current.y *= -0.8 }
  }
  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.032)
      last = now
      if (!drag.current && !reduced.current) {
        const v = velocity.current
        position.current.x += v.x * dt
        position.current.y += v.y * dt
        const damping = Math.exp(-dt * 0.85)
        v.x *= damping; v.y *= damping
      }
      constrain(); render()
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    const timer = window.setTimeout(() => setShards(false), 1000)
    return () => { cancelAnimationFrame(frame); clearTimeout(timer) }
    // Each escape owns its position/velocity until it is unmounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const release = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.id !== event.pointerId) return
    if (event.type === 'pointercancel' || performance.now() - drag.current.time > 100) velocity.current = { x: 0, y: 0 }
    drag.current = null
    setHeld(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  return createPortal(<div className="console-escape" role="group" aria-label="液晶から飛び出したキャラクター">
    {shards && <div className="console-shards" aria-hidden="true" style={{ left: origin.x, top: origin.y, width: origin.width, height: origin.height }}>
      {SHARDS.map((polygon, i) => <i key={polygon} style={{ clipPath: `polygon(${polygon})`, '--shard-x': `${Math.cos(i * Math.PI / 4) * 180}px`, '--shard-y': `${Math.sin(i * Math.PI / 4) * 180 + 70}px`, '--shard-r': `${i % 2 ? 55 : -65}deg` } as CSSProperties} />)}
    </div>}
    <button ref={avatar} className="console-escaped-avatar" style={{ width: size, height: size }} type="button"
      aria-label="キャラクターをつかんで動かす。矢印キーでも移動できます" aria-pressed={held}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return
        event.preventDefault()
        event.currentTarget.dataset.pointerFocus = 'true'
        event.currentTarget.focus({ preventScroll: true })
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { id: event.pointerId, x: event.clientX - position.current.x, y: event.clientY - position.current.y, lastX: event.clientX, lastY: event.clientY, time: performance.now() }
        velocity.current = { x: 0, y: 0 }; setHeld(true)
      }}
      onPointerMove={event => {
        const d = drag.current
        if (!d || d.id !== event.pointerId) return
        const now = performance.now(), dt = Math.max(8, now - d.time) / 1000
        velocity.current = { x: Math.max(-1600, Math.min(1600, (event.clientX - d.lastX) / dt * 1.2)), y: Math.max(-1600, Math.min(1600, (event.clientY - d.lastY) / dt * 1.2)) }
        position.current = { x: event.clientX - d.x, y: event.clientY - d.y }
        d.lastX = event.clientX; d.lastY = event.clientY; d.time = now
        constrain(); render()
      }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={() => { drag.current = null; setHeld(false) }}
      onKeyDown={event => {
        delete event.currentTarget.dataset.pointerFocus
        const delta: Record<string, [number, number]> = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }
        if (!delta[event.key]) return
        event.preventDefault(); velocity.current = { x: 0, y: 0 }
        position.current.x += delta[event.key][0]; position.current.y += delta[event.key][1]
        constrain(); render()
      }}>
      <span className="console-escaped-avatar__pop"><HeroAvatar showFallback={false} squint={held} /></span>
    </button>
    <span className="console-escape__announcement" role="status">キャラクターが飛び出しました。つかんで動かせます。</span>
  </div>, document.body)
}

export function ConsoleBreakout({ squint }: { squint: boolean }) {
  const screen = useRef<HTMLButtonElement>(null)
  const sequence = useRef({ hits: 0, last: 0 })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hits, setHits] = useState(0)
  const [damage, setDamage] = useState(0)
  const [origin, setOrigin] = useState<Origin | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  return <>
    <button ref={screen} type="button" className={`console-screen console-screen--interactive${origin ? ' is-broken' : ''}`}
      aria-disabled={!!origin}
      aria-label={origin ? '割れた液晶' : '液晶。10回連続で押すとキャラクターが飛び出します'}
      onClick={() => {
        if (origin) return
        const now = performance.now()
        const count = now - sequence.current.last < 700 ? sequence.current.hits + 1 : 1
        sequence.current = { hits: count, last: now }; setHits(count)
        setDamage(previous => Math.max(previous, count))
        if (timer.current) clearTimeout(timer.current)
        if (count >= 10) {
          const bounds = screen.current!.getBoundingClientRect()
          setOrigin({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height })
          sequence.current = { hits: 0, last: 0 }
        } else timer.current = setTimeout(() => { setHits(0); sequence.current = { hits: 0, last: 0 } }, 700)
      }}>
      {!origin && <HeroAvatar showFallback={false} squint={squint || hits >= 5} />}
      <span className="console-screen__glass" />
      {(damage >= 4 || origin) && <svg className="console-screen__cracks" viewBox="0 0 259 223" aria-hidden="true" style={{ opacity: origin ? 0.45 : damage / 10 }}>
        <path d="M0 0 65 57 119 107 176 50 259 0 M0 223 65 166 119 107 181 166 259 223 M119 107 51 105 0 105 M119 107 194 117 259 118 M119 107 135 165 140 223 M65 57 72 20 M65 166 20 157 M176 50 211 63 M181 166 175 204" />
      </svg>}
    </button>
    {origin && <EscapedAvatar origin={origin} />}
  </>
}
