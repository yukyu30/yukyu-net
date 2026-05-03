import Link from 'next/link'
import { headers } from 'next/headers'

const NAV: Array<{ key: string; label: string; href: string }> = [
  { key: 'home', label: 'Index', href: '/' },
  { key: 'tags', label: 'Tags', href: '/tags' },
  { key: 'works', label: 'Works', href: '/tags/work' },
  { key: 'who', label: 'Who', href: '/who' }
]

function pickActive(pathname: string): string {
  if (pathname === '/' || pathname.startsWith('/posts') || pathname.startsWith('/page')) return 'home'
  if (pathname === '/tags/work') return 'works'
  if (pathname.startsWith('/tags')) return 'tags'
  if (pathname.startsWith('/who')) return 'who'
  return ''
}

export async function SiteHeader() {
  const h = await headers()
  const pathname = h.get('x-invoke-path') ?? h.get('x-pathname') ?? '/'
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
