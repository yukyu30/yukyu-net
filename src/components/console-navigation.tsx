'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { GameConsole } from './game-console'

/** Keep the device mounted until the camera arrives, then reveal the real route. */
export function ConsoleNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [destination, setDestination] = useState<string | null>(null)
  const [inConsole, setInConsole] = useState(false)
  const pending = useRef<string | null>(null)
  const panel = useRef<HTMLDivElement>(null)
  const home = pathname === '/'

  const finish = useCallback(() => {
    if (pending.current) {
      router.push(pending.current)
      pending.current = null
    }
  }, [router])

  const navigate = useCallback((href: string) => {
    if (pending.current || destination) return
    pending.current = href
    setDestination(href)
    router.prefetch(href)
  }, [destination, router])

  useEffect(() => {
    if (!destination) return
    // Navigation remains available if WebGL is lost or frames are suspended.
    const timeout = setTimeout(finish, 1800)
    return () => clearTimeout(timeout)
  }, [destination, finish])

  useEffect(() => {
    if (!home && destination) {
      setInConsole(true)
      setDestination(null)
      pending.current = null
    }
  }, [pathname, home, destination])

  useEffect(() => {
    if (!inConsole || home) return
    panel.current?.scrollTo(0, 0)
    panel.current?.focus({ preventScroll: true })
  }, [pathname, inConsole, home])

  const framed = !home && (inConsole || destination !== null)
  return <>
    {home && <section className={`hero-image hero-image--console console-stage${destination ? ' is-entering' : ''}`}
      aria-label="yukyuの携帯ゲーム機" aria-busy={!!destination}>
      <GameConsole zoomed={!!destination} onNavigate={navigate} onZoomComplete={finish} />
      {destination && <p className="console-navigation-status" role="status">画面を開いています…</p>}
    </section>}
    <div className={framed ? 'console-site' : undefined}>
      {framed && <div className="console-site__bar">
        <button type="button" onClick={() => router.push('/')} aria-label="端末の全体表示に戻る">← CONSOLE</button>
        <span>YUKYU.NET <i aria-hidden="true" /></span>
      </div>}
      <div ref={panel} className={framed ? 'console-site__screen' : undefined} tabIndex={framed ? -1 : undefined}>
        {children}
      </div>
    </div>
  </>
}
