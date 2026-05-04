import Link from 'next/link'
import { getAllPosts, getProfileExcerpt, getTopTags, getWorks } from '@/lib/posts'
import { PostIndexTable, Pagination } from '@/components/post-index-table'

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
  const topTags = getTopTags(5)
  const total = posts.length
  const works = getWorks()
  const recentWorks = works.filter(p => p.frontMatter.thumbnail).slice(0, 3)
  const profileLines = getProfileExcerpt('me', 2).split('\n').filter(Boolean)

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <h1 className="hero__title">
              <span className="hero__title-slash">/</span>index
            </h1>
          </div>
          <div>
            <div className="hero__meta-num">
              {visible.length}
              <span className="hero__meta-num-small"> / {total}</span>
            </div>
          </div>
        </div>
      </section>

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
        {recentWorks.length > 0 && (
          <div className="whoami__works">
            <div className="whoami__works-head">// recent works</div>
            <div className="whoami__works-grid">
              {recentWorks.map(p => (
                <Link
                  key={p.slug}
                  href={`/posts/${p.slug}`}
                  className="whoami__work"
                >
                  <span className="whoami__work-thumb">
                    <img src={p.frontMatter.thumbnail} alt="" loading="lazy" />
                  </span>
                  <div className="whoami__work-meta">
                    <span className="whoami__work-date">{p.frontMatter.date}</span>
                    <span className="whoami__work-title">{p.frontMatter.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="cat-grid">
        <Link href="/posts" className="cat-grid__cell is-feature">
          <div className="cat-grid__cell-no">01 / all</div>
          <div className="cat-grid__cell-name">all</div>
          <div className="cat-grid__cell-count">{total} entries →</div>
        </Link>
        {topTags.map((t, i) => (
          <Link
            key={t.tag}
            href={`/tags/${encodeURIComponent(t.tag)}`}
            className="cat-grid__cell"
          >
            <div className="cat-grid__cell-no">{String(i + 2).padStart(2, '0')} / #{t.tag}</div>
            <div className="cat-grid__cell-name">{t.tag}</div>
            <div className="cat-grid__cell-count">{t.count} entries →</div>
          </Link>
        ))}
      </section>

      <PostIndexTable posts={visible} total={total} startNo={total} highlightFirst />

      <Pagination
        page={1}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        total={total}
        shown={visible.length}
        pageStart={1}
      />
    </div>
  )
}
