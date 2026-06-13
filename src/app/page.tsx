import Link from 'next/link'
import { getAllPosts, getProfileExcerpt, getWorks } from '@/lib/posts'
import { PostIndexTable } from '@/components/post-index-table'
import { HomeWorks } from '@/components/home-works'
import { HeroImage } from '@/components/hero-image'

export const metadata = {
  title: 'yukyu.net',
  description: '個人的な覚え書き'
}

const PAGE_SIZE = 20

const SOCIAL_LINKS: Array<{ name: string; url: string }> = [
  { name: 'X', url: 'https://x.com/yukyu30' },
  { name: 'BlueSky', url: 'https://bsky.app/profile/yukyu.net' },
  { name: 'GitHub', url: 'https://github.com/yukyu30' },
  { name: 'Zenn', url: 'https://zenn.dev/yu_9' },
  { name: 'Instagram', url: 'https://instagram.com/ugo_kun_930' },
  { name: 'SUZURI', url: 'https://suzuri.jp/yukyu30' },
  { name: 'Portfolio', url: 'https://foriio.com/yukyu30' },
  { name: 'YouTube', url: 'https://www.youtube.com/@yukyu30' },
  { name: 'VRChat', url: 'https://vrchat.com/home/user/usr_c3a3cf58-fbf3-420b-9eb2-c9b69d46b5d6' },
  { name: 'RSS', url: '/rss.xml' }
]

export default function Home() {
  const posts = getAllPosts()
  const visible = posts.slice(0, PAGE_SIZE)
  const total = posts.length
  const works = getWorks()
    .filter(p => p.frontMatter.thumbnail)
    .slice(0, 5)
  const profileLines = getProfileExcerpt('me', 2).split('\n').filter(Boolean)

  return (
    <div className="page">
      <HeroImage />

      <PostIndexTable
        posts={visible}
        readMoreHref={total > PAGE_SIZE ? '/page/1' : undefined}
      />

      {works.length > 0 && <HomeWorks works={works} />}

      <section className="whoami">
        <div className="whoami__head">
          <span className="whoami__label">// who</span>
        </div>
        <div className="whoami__grid">
          <div className="whoami__profile">
            <dl className="whoami__id">
              <div className="whoami__id-row">
                <dt>NAME</dt>
                <dd>yukyu</dd>
              </div>
              <div className="whoami__id-row">
                <dt>ROLE</dt>
                <dd>GMOペパボ / エンジニアリングリード / 上級VR技術者</dd>
              </div>
            </dl>
            {profileLines.length > 0 && (
              <div className="whoami__bio">
                {profileLines.map(line => (
                  <p key={line} className="whoami__bio-line">{line}</p>
                ))}
                <Link href="/me" className="whoami__bio-more">もっと見る →</Link>
              </div>
            )}
            <ul className="whoami__links">
              {SOCIAL_LINKS.map(l => (
                <li key={l.name}>
                  <a
                    href={l.url}
                    target={l.url.startsWith('http') ? '_blank' : undefined}
                    rel={l.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="whoami__link"
                  >
                    <span className="whoami__link-name">{l.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
