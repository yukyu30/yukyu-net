'use client'

import { useCallback, useEffect, useLayoutEffect, useReducer, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { IDLE, reduceNavigation } from '@/lib/console-navigation'
import { releasePage } from '@/lib/console-page'
import { CONSOLE_MENU, GameConsole } from './game-console'

const WINDUP_MS = 320
// Lands the page even if WebGL is lost or frames are suspended mid-dive.
const DIVE_TIMEOUT_MS = 2400

/**
 * Pressing a console button navigates at once, keeps the device mounted, and
 * shows the destination page on its LCD while the camera dives into it.
 */
export function ConsoleNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [navigation, dispatch] = useReducer(reduceNavigation, IDLE)
  const [page, setPage] = useState<HTMLDivElement | null>(null)
  const { phase } = navigation

  useEffect(() => dispatch({ type: 'route', pathname }), [pathname])

  useEffect(() => {
    if (pathname === '/') for (const { href } of CONSOLE_MENU) router.prefetch(href)
  }, [pathname, router])

  useEffect(() => {
    if (phase === 'idle') return
    const timer = phase === 'departing'
      ? setTimeout(() => dispatch({ type: 'wound' }), WINDUP_MS)
      : setTimeout(() => dispatch({ type: 'landed' }), DIVE_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [phase])

  useLayoutEffect(() => {
    if (page && phase !== 'diving') releasePage(page)
  }, [page, phase])

  const navigate = useCallback((href: string) => {
    if (phase !== 'idle') return
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) dispatch({ type: 'press', href })
    router.push(href)
  }, [phase, router])
  const land = useCallback(() => dispatch({ type: 'landed' }), [])

  return <>
    {(pathname === '/' || phase !== 'idle') && <section className="hero-image hero-image--console console-stage"
      data-phase={phase} aria-label="yukyuの携帯ゲーム機" aria-busy={phase !== 'idle'}>
      <GameConsole navigation={navigation} page={page} onNavigate={navigate} onLanded={land} />
      {phase !== 'idle' && <p className="console-navigation-status" role="status">画面を開いています…</p>}
    </section>}
    <div ref={setPage} className="console-page" data-phase={phase}>{children}</div>
  </>
}
