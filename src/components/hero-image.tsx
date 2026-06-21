import { Link } from 'next-view-transitions'
import { HeroMemoBubbles } from '@/components/hero-memo-bubble'

const HERO_MENU: Array<{ label: string; href: string }> = [
  { label: 'posts', href: '/posts' },
  { label: 'works', href: '/works' },
  { label: 'memos', href: '/memos' },
  { label: 'Me', href: '/me' }
]

export function HeroImage() {
  return (
    <section className="hero-image">
      <img className="hero-image__media" src="/hero.jpg" alt="東京の街並み" />
      <HeroMemoBubbles />
      <nav className="hero-image__menu" aria-label="メインメニュー">
        {HERO_MENU.map(item => (
          <Link key={item.href} href={item.href} className="hero-image__menu-item">
            {item.label}
          </Link>
        ))}
      </nav>
      <span className="hero-image__credit">photo by yukyu</span>
    </section>
  )
}
