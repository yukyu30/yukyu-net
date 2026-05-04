'use client'

import { Link } from 'next-view-transitions'
import { usePathname } from 'next/navigation'

const NAV: Array<{ key: string; label: string; href: string }> = [
  { key: 'home', label: 'Index', href: '/' },
  { key: 'posts', label: 'Posts', href: '/posts' },
  { key: 'tags', label: 'Tags', href: '/tags' },
  { key: 'works', label: 'Works', href: '/works' },
  { key: 'me', label: 'Me', href: '/me' }
]

function pickActive(pathname: string): string {
  if (pathname === '/me') return 'me'
  if (pathname === '/works') return 'works'
  if (pathname === '/' || pathname.startsWith('/page')) return 'home'
  if (pathname.startsWith('/tags')) return 'tags'
  if (pathname.startsWith('/posts')) return 'posts'
  return ''
}

export function SiteHeader() {
  const pathname = usePathname() ?? '/'
  const active = pickActive(pathname)
  return (
    <header className="site-header">
      <Link href="/" className="site-header__brand">
        yukyu.net
      </Link>
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
