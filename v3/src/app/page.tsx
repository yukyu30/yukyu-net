import Link from 'next/link'
import { getAllPosts, getTopTags } from '@/lib/posts'

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
  const latest = posts[0]?.frontMatter.date ?? ''

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
