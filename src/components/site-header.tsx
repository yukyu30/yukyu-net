'use client'

import { Link } from 'next-view-transitions'
import { usePathname } from 'next/navigation'
import { Search } from 'nextra/components'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

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
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [searchOpen])

  const handleToggle = () => {
    if (searchOpen) {
      setSearchOpen(false)
      return
    }
    // flushSync so the slot becomes display:block before we focus —
    // keeps the call inside the click's user-gesture window so iOS
    // Safari actually opens the keyboard.
    flushSync(() => setSearchOpen(true))
    searchSlotRef.current
      ?.querySelector<HTMLInputElement>('input[type="search"]')
      ?.focus()
  }

  return (
    <header className="site-header" data-pagefind-ignore>
      <Link href="/" className="site-header__brand">
        yukyu.net
      </Link>
      <button
        type="button"
        className={`site-header__search-toggle${searchOpen ? ' is-open' : ''}`}
        aria-label={searchOpen ? '検索を閉じる' : '検索を開く'}
        aria-expanded={searchOpen}
        aria-controls="site-header-search"
        onClick={handleToggle}
      >
        {searchOpen ? 'Close' : 'Search'}
      </button>
      <div
        ref={searchSlotRef}
        id="site-header-search"
        className={`site-header__search-slot${searchOpen ? ' is-open' : ''}`}
      >
        <Search
          placeholder="Search…"
          emptyResult={
            <span className="site-header__search-empty" role="status">
              no results
            </span>
          }
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
