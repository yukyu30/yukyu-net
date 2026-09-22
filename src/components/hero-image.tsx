import { Link } from 'next-view-transitions'
import { HeroAvatar } from '@/components/hero-avatar'

const HERO_MENU = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/posts' },
  { label: 'Works', href: '/works' }
]

export function HeroImage() {
  return (
    <section className="hero-image">
      <HeroAvatar />
      <nav className="hero-image__menu" aria-label="メインメニュー">
        {HERO_MENU.map(item => (
          <Link key={item.href} href={item.href} className="hero-image__menu-item">
            <span className="hero-image__menu-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </section>
  )
}
