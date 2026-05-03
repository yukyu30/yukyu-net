import Link from 'next/link'
import { getAllPosts, getEarliestYear, getTopTags, getWorks } from '@/lib/posts'

export const metadata = {
  title: 'yukyu.net',
  description: '個人的な覚え書き'
}

const PAGE_SIZE = 20

function formatDate(iso: string): string {
  return iso
}

export default function Home() {
  const posts = getAllPosts()
  const visible = posts.slice(0, PAGE_SIZE)
  const topTags = getTopTags(6)
  const total = posts.length
  const works = getWorks()
  const recentWorks = works.filter(p => p.frontMatter.thumbnail).slice(0, 3)
  const since = getEarliestYear()
  const years = new Date().getFullYear() - since

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
          <Link href="/who" className="whoami__more">more →</Link>
        </div>
        <div className="whoami__grid">
          <div className="whoami__profile">
            <p className="whoami__line">
              ペパボでエンジニアをしている。書いたもの・作ったもの・登壇したことを、ここに置いておく。
            </p>
            <p className="whoami__line">
              抽象的な自己紹介より、実際にやってきた具体を見てもらうほうが早いと思っている。
            </p>
            <ul className="whoami__links">
              <li>
                <a href="https://github.com/yukyu30">github.com/yukyu30</a>
              </li>
              <li>
                <a href="/rss.xml">/rss.xml</a>
              </li>
            </ul>
          </div>
          <dl className="whoami__stats">
            <div className="whoami__stat">
              <dt>posts</dt>
              <dd>{total}</dd>
            </div>
            <div className="whoami__stat">
              <dt>works</dt>
              <dd>{works.length}</dd>
            </div>
            <div className="whoami__stat">
              <dt>tags</dt>
              <dd>{topTags.length > 0 ? '∞' : 0}</dd>
            </div>
            <div className="whoami__stat">
              <dt>since</dt>
              <dd>
                {since}
                <span className="whoami__stat-suffix"> · {years}y</span>
              </dd>
            </div>
          </dl>
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
        {topTags.map((t, i) => (
          <Link
            key={t.tag}
            href={`/tags/${encodeURIComponent(t.tag)}`}
            className={`cat-grid__cell${i === 0 ? ' is-feature' : ''}`}
          >
            <div className="cat-grid__cell-no">0{i + 1} / #{t.tag}</div>
            <div className="cat-grid__cell-name">{t.tag}</div>
            <div className="cat-grid__cell-count">{t.count} entries →</div>
          </Link>
        ))}
      </section>

      <section className="index-table">
        <div className="index-table__head">
          <span>NO.</span>
          <span>DATE</span>
          <span>TITLE</span>
          <span>TAGS</span>
        </div>
        {visible.map((p, i) => {
          const num = String(total - i).padStart(3, '0')
          const isFirst = i === 0
          return (
            <Link
              key={p.slug}
              href={`/posts/${p.slug}`}
              className={`index-row${isFirst ? ' is-first' : ''}`}
            >
              <span className="index-row__no">№{num}</span>
              <span className="index-row__date">{formatDate(p.frontMatter.date)}</span>
              <h2 className="index-row__title">{p.frontMatter.title}</h2>
              <span className="index-row__tags">
                {(p.frontMatter.tag ?? []).slice(0, 2).map(t => '#' + t).join(' ')}
              </span>
            </Link>
          )
        })}
      </section>

      {total > PAGE_SIZE && (
        <section className="pagination">
          <div className="pagination__meta">
            showing 01–{String(visible.length).padStart(2, '0')} of {total}
          </div>
        </section>
      )}
    </div>
  )
}
