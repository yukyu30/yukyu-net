'use client'

import { useEffect, useRef, useState } from 'react'
import type { AnimationItem } from 'lottie-web'

export function HeroAvatar() {
  const container = useRef<HTMLDivElement>(null)
  const animation = useRef<AnimationItem | null>(null)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let disposed = false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => setPaused(reducedMotion.matches)
    syncMotion()
    reducedMotion.addEventListener('change', syncMotion)

    void import('lottie-web').then(({ default: lottie }) => {
      if (disposed || !container.current) return
      const player = lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: '/animations/avatar-idle.json',
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
      })
      animation.current = player
      player.addEventListener('DOMLoaded', () => {
        if (!disposed) setReady(true)
      })
    }).catch(error => { console.error('Failed to load hero animation', error) })

    return () => {
      disposed = true
      reducedMotion.removeEventListener('change', syncMotion)
      animation.current?.destroy()
      animation.current = null
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    if (paused) animation.current?.pause()
    else animation.current?.play()
  }, [paused, ready])

  return (
    <>
      <div className="hero-avatar" role="img" aria-label="yukyuのキャラクター">
        {!ready && <img className="hero-avatar__fallback" src="/authors/yukyu.jpg" alt="" />}
        <div ref={container} className="hero-avatar__animation" aria-hidden="true" />
      </div>
      {ready && (
        <button type="button" className="hero-avatar__toggle" onClick={() => setPaused(value => !value)}>
          {paused ? 'アニメーションを再生' : 'アニメーションを停止'}
        </button>
      )}
    </>
  )
}
