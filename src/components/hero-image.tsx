import { Link } from 'next-view-transitions'

const HERO_MENU: Array<{ label: string; href: string }> = [
  { label: 'posts', href: '/posts' },
  { label: 'works', href: '/works' },
  { label: 'Me', href: '/me' }
]

export function HeroImage() {
  return (
    <section className="hero-image">
      {/* TODO: 仮のダミー画像。実画像に差し替える */}
      <img className="hero-image__media" src="/hero-dummy.svg" alt="" />
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
