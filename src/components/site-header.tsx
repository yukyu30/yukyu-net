'use client'

import { Link } from 'next-view-transitions'
import { usePathname } from 'next/navigation'
import { PictureInPictureSearch } from '@/components/picture-in-picture-search'

const NAV: Array<{ key: string; label: string; href: string }> = [
  { key: 'home', label: 'Index', href: '/' },
  { key: 'posts', label: 'Posts', href: '/posts' },
  { key: 'tags', label: 'Tags', href: '/tags' },
  { key: 'works', label: 'Works', href: '/works' },
  { key: 'memos', label: 'Memos', href: '/memos' },
  { key: 'me', label: 'Me', href: '/me' }
]

function pickActive(pathname: string): string {
  if (pathname === '/me') return 'me'
  if (pathname === '/works') return 'works'
  if (pathname === '/' || pathname.startsWith('/page')) return 'home'
  if (pathname.startsWith('/tags')) return 'tags'
  if (pathname.startsWith('/posts')) return 'posts'
  if (pathname.startsWith('/memos')) return 'memos'
  return ''
}

export function SiteHeader() {
  const pathname = usePathname() ?? '/'
  const active = pickActive(pathname)
  // トップページだけヒーロー画像の上に重ねる（背景透過）
  const overlay = pathname === '/'

  return (
    <header
      className={`site-header${overlay ? ' site-header--overlay' : ''}`}
      data-pagefind-ignore
    >
      <Link href="/" className="site-header__brand">
        yukyu.net
      </Link>
      <PictureInPictureSearch />
      {!overlay && (
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
      )}
    </header>
  )
}
