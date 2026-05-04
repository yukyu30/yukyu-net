'use client'

import { Link } from 'next-view-transitions'
import { usePathname } from 'next/navigation'
import { Search } from 'nextra/components'
import { useEffect, useRef, useState } from 'react'

const NAV: Array<{ key: string; label: string; href: string }> = [
  { key: 'home', label: 'Index', href: '/' },
  { key: 'posts', label: 'Posts', href: '/posts' },
  { key: 'tags', label: 'Tags', href: '/tags' },
  { key: 'works', label: 'Works', href: '/tags/work' },
  { key: 'who', label: 'Who', href: '/posts/me' }
]

function pickActive(pathname: string): string {
  if (pathname === '/posts/me') return 'who'
  if (pathname === '/' || pathname.startsWith('/page')) return 'home'
  if (pathname === '/tags/work') return 'works'
  if (pathname.startsWith('/tags')) return 'tags'
  if (pathname.startsWith('/posts')) return 'posts'
  return ''
}

export function SiteHeader() {
  const pathname = usePathname() ?? '/'
  const active = pickActive(pathname)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchSlotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!searchOpen) return
    const input = searchSlotRef.current?.querySelector<HTMLInputElement>(
      'input[type="search"]'
    )
    input?.focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [searchOpen])

  return (
    <header className="site-header">
      <Link href="/" className="site-header__brand">
        yukyu.net
      </Link>
      <button
        type="button"
        className={`site-header__search-toggle${searchOpen ? ' is-open' : ''}`}
        aria-label={searchOpen ? '検索を閉じる' : '検索を開く'}
        aria-expanded={searchOpen}
        onClick={() => setSearchOpen(o => !o)}
      >
        {searchOpen ? 'Close' : 'Search'}
      </button>
      <div
        ref={searchSlotRef}
        className={`site-header__search-slot${searchOpen ? ' is-open' : ''}`}
      >
        <Search
          placeholder="Search…"
          emptyResult={<span className="site-header__search-empty">no results</span>}
          loading="searching…"
          errorText="failed to load search index"
        />
      </div>
      <nav className="site-header__nav">
        {NAV.map(({ key, label, href }) => (
          <Link
            key={key}
            href={href}
            className={`site-header__link${active === key ? ' is-active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
