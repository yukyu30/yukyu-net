import { Link } from 'next-view-transitions'
import { HeroMemoBubbles } from '@/components/hero-memo-bubble'
import { HeroAvatar } from '@/components/hero-avatar'

const HERO_MENU: Array<{ label: string; href: string }> = [
  { label: 'posts', href: '/posts' },
  { label: 'works', href: '/works' },
  { label: 'memos', href: '/memos' },
  { label: 'me', href: '/me' }
]

export function HeroImage() {
  return (
    <section className="hero-image">
      <HeroAvatar />
      <HeroMemoBubbles />
      <nav className="hero-image__menu" aria-label="メインメニュー">
        {HERO_MENU.map(item => (
          <Link key={item.href} href={item.href} className="hero-image__menu-item">
            {item.label}
          </Link>
        ))}
      </nav>
    </section>
  )
}
