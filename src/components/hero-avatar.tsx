'use client'

import { useEffect, useRef, useState } from 'react'
import type { AnimationItem } from 'lottie-web'

const POINTER_TRACKING_QUERY = '(hover: hover) and (pointer: fine)'

export function HeroAvatar({ showFallback = true, squint = false }: { showFallback?: boolean; squint?: boolean }) {
  const container = useRef<HTMLDivElement>(null)
  const animation = useRef<AnimationItem | null>(null)
  const bodyMotion = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let disposed = false
    const abortController = new AbortController()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => setPaused(reducedMotion.matches)
    syncMotion()
    reducedMotion.addEventListener('change', syncMotion)

    void Promise.all([
      import('lottie-web'),
      fetch('/animations/avatar-idle.json', { signal: abortController.signal })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch hero animation')
          return response.json()
        })
    ]).then(([{ default: lottie }, animationData]) => {
      if (disposed || !container.current) return
      // On mouse devices, replace recorded glances with tracking but retain blinks.
      const trackPointer = window.matchMedia(POINTER_TRACKING_QUERY).matches
      for (const layer of animationData.layers) {
        if (layer.nm !== 'Eye left' && layer.nm !== 'Eye right') continue
        layer.cl = `hero-avatar__eye ${layer.nm === 'Eye left' ? 'hero-avatar__eye--left' : 'hero-avatar__eye--right'}`
        if (trackPointer && layer.ks.p.a === 1) {
          layer.ks.p = { a: 0, k: layer.ks.p.k[0].s }
        }
      }
      const player = lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        animationData,
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
      })
      animation.current = player
      player.addEventListener('DOMLoaded', () => {
        if (!disposed) setReady(true)
      })
    }).catch(error => {
      if (!disposed) console.error('Failed to load hero animation', error)
    })

    return () => {
      disposed = true
      abortController.abort()
      reducedMotion.removeEventListener('change', syncMotion)
      animation.current?.destroy()
      animation.current = null
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    if (squint) animation.current?.goToAndStop(0, true)
    else if (paused) animation.current?.pause()
    else animation.current?.play()
  }, [paused, ready, squint])

  useEffect(() => {
    if (!ready || !container.current || !squint) return
    const eyes = Array.from(container.current.querySelectorAll<SVGGElement>('.hero-avatar__eye'))
    const paths = eyes.map(eye => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const left = eye.classList.contains('hero-avatar__eye--left')
      path.setAttribute('d', left ? 'M -28 -32 L 24 0 L -28 32' : 'M 28 -32 L -24 0 L 28 32')
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', '#070807')
      path.setAttribute('stroke-width', '16')
      path.setAttribute('stroke-linecap', 'round')
      path.setAttribute('stroke-linejoin', 'round')
      path.classList.add('hero-avatar__squint')
      eye.classList.add('is-squinting')
      eye.append(path)
      return path
    })
    return () => {
      paths.forEach(path => path.remove())
      eyes.forEach(eye => eye.classList.remove('is-squinting'))
    }
  }, [ready, squint])

  useEffect(() => {
    if (!ready || !container.current) return
    const host = container.current
    const body = bodyMotion.current
    const avatar = host.closest('.hero-avatar')
    const finePointer = window.matchMedia(POINTER_TRACKING_QUERY)
    // An outer SVG group keeps our translation independent of Lottie's blink transforms.
    const wrappers = Array.from(host.querySelectorAll<SVGGElement>('.hero-avatar__eye'))
      .map(eye => {
        const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        wrapper.classList.add('hero-avatar__gaze')
        eye.before(wrapper)
        wrapper.append(eye)
        return wrapper
      })
    let frame = 0
    let previousTime = 0
    let x = 0
    let y = 0
    let targetX = 0
    let targetY = 0

    const render = () => {
      if (body) {
        body.style.transform = `perspective(900px) translate3d(${x * 0.4}px, ${y * 0.4}px, 0) rotateX(${-y * 0.25}deg) rotateY(${x * 0.25}deg)`
      }
      for (const wrapper of wrappers) {
        wrapper.setAttribute('transform', `translate(${x} ${y})`)
      }
    }
    const step = (time: number) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16
      previousTime = time
      const ease = 1 - Math.exp(-elapsed / 90)
      x += (targetX - x) * ease
      y += (targetY - y) * ease
      if (Math.abs(targetX - x) + Math.abs(targetY - y) < 0.02) {
        x = targetX
        y = targetY
        frame = 0
        previousTime = 0
      } else {
        frame = window.requestAnimationFrame(step)
      }
      render()
    }
    const moveTo = (nextX: number, nextY: number) => {
      targetX = nextX
      targetY = nextY
      if (!frame) frame = window.requestAnimationFrame(step)
    }
    const reset = () => moveTo(0, 0)
    const syncPointer = () => {
      if (!finePointer.matches) reset()
    }
    const onPointerMove = (event: PointerEvent) => {
      if (paused || squint || !finePointer.matches || event.pointerType !== 'mouse') return
      const bounds = avatar?.getBoundingClientRect()
      if (!bounds) return
      if (!bounds.width || !bounds.height) return
      const dx = (event.clientX - (bounds.left + bounds.width / 2)) / bounds.width
      const dy = (event.clientY - (bounds.top + bounds.height / 2)) / bounds.height
      const distance = Math.max(1, Math.hypot(dx, dy))
      // Values are in the animation's 640 × 640 coordinate space.
      moveTo(dx / distance * 16, dy / distance * 12)
    }
    const onVisibilityChange = () => {
      if (document.hidden) reset()
    }

    if (!paused) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', reset)
      window.addEventListener('blur', reset)
      window.addEventListener('resize', reset)
      document.addEventListener('visibilitychange', onVisibilityChange)
      finePointer.addEventListener('change', syncPointer)
    }
    return () => {
      window.cancelAnimationFrame(frame)
      body?.style.removeProperty('transform')
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', reset)
      window.removeEventListener('blur', reset)
      window.removeEventListener('resize', reset)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      finePointer.removeEventListener('change', syncPointer)
      for (const wrapper of wrappers) wrapper.replaceWith(...Array.from(wrapper.childNodes))
    }
  }, [ready, paused, squint])

  return (
    <>
      <div className="hero-avatar" role="img" aria-label="yukyuのキャラクター">
        <div className={`hero-avatar__float${ready && !paused ? ' is-active' : ''}`}>
          <div ref={bodyMotion} className="hero-avatar__motion">
            {showFallback && !ready && <img className="hero-avatar__fallback" src="/authors/yukyu.jpg" alt="" />}
            <div ref={container} className="hero-avatar__animation" aria-hidden="true" />
          </div>
        </div>
      </div>

    </>
  )
}
