import Link from 'next/link'
import { getPostsByTag, getTopTags } from '@/lib/posts'

export const metadata = {
  title: 'Works | yukyu.net',
  description: 'つくったもの'
}

export default function Works() {
  const posts = [...getPostsByTag('work'), ...getPostsByTag('つくったもの')]
  const unique = Array.from(new Map(posts.map(p => [p.slug, p])).values())
    .sort((a, b) => b.frontMatter.date.localeCompare(a.frontMatter.date))
  const topTags = getTopTags(6)

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <div className="hero__caption">Topic — つくったもの</div>
            <h1 className="hero__title">
              <span className="hero__title-slash">/</span>works
            </h1>
          </div>
          <div>
            <div className="hero__meta-num">{unique.length}</div>
            <div className="hero__meta-sub">entries</div>
            <p className="hero__meta-text">
              これまで作ってきたもの。アプリやウェブサイト、ちょっとした実験。
            </p>
          </div>
        </div>
      </section>

      <section className="cat-grid">
        {topTags.map((t, i) => (
          <Link
            key={t.tag}
            href={`/tags/${encodeURIComponent(t.tag)}`}
            className={`cat-grid__cell${t.tag === 'work' || t.tag === 'つくったもの' ? ' is-feature' : ''}`}
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
          <span style={{ textAlign: 'right' }}>READ</span>
        </div>
        {unique.map((p, i) => {
          const num = String(unique.length - i).padStart(3, '0')
          return (
            <Link key={p.slug} href={`/posts/${p.slug}`} className="index-row">
              <span className="index-row__no">№{num}</span>
              <span className="index-row__date">{p.frontMatter.date}</span>
              <h2 className="index-row__title">{p.frontMatter.title}</h2>
              <span className="index-row__tags">
                {(p.frontMatter.tag ?? []).slice(0, 2).map(t => '#' + t).join(' ')}
              </span>
              <span className="index-row__read">{p.readTime}′</span>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
