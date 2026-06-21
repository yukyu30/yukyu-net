import { Link } from 'next-view-transitions'

const TABS: Array<{ key: 'timeline' | 'album'; label: string; href: string }> = [
  { key: 'timeline', label: 'timeline', href: '/memos' },
  { key: 'album', label: 'album', href: '/memos/album' }
]

export function MemoTabs({ active }: { active: 'timeline' | 'album' }) {
  return (
    <nav className="memos__tabs" aria-label="表示切り替え">
      {TABS.map(tab => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`memos__tab${active === tab.key ? ' is-active' : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
