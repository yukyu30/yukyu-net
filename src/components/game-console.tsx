'use client'

import dynamic from 'next/dynamic'
import { ConsoleBlueprint } from './console-blueprint'
import { Component, type ReactNode } from 'react'
import { Link } from 'next-view-transitions'

export const CONSOLE_MENU = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/posts' },
  { label: 'Works', href: '/works' }
]

export function ConsoleSkeleton() {
  return <div className="console-skeleton" role="status" aria-label="ゲーム機を読み込み中">
    <ConsoleBlueprint />
  </div>
}

export function ConsoleFallback() {
  return (
    <nav className="console-unavailable" aria-label="メインメニュー">
      {CONSOLE_MENU.map(item => <Link href={item.href} key={item.href}>{item.label}</Link>)}
    </nav>
  )
}

const ConsoleScene = dynamic(() => import('./game-console-scene'), {
  ssr: false,
  loading: () => <ConsoleSkeleton />
})

class ConsoleBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <ConsoleFallback /> : this.props.children }
}

export function GameConsole() {
  return <div className="game-console"><ConsoleBoundary><ConsoleScene /></ConsoleBoundary></div>
}
