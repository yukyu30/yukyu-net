import Link from 'next/link'
import { getAllPosts, getAllTagCounts } from '@/lib/posts'

export const metadata = {
  title: 'Tags | yukyu.net',
  description: 'タグ一覧'
}

export default function TagsIndex() {
  const tags = getAllTagCounts()
  const total = getAllPosts().length

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <h1 className="hero__title">
              <span className="hero__title-slash">/</span>tags
            </h1>
          </div>
          <div>
            <div className="hero__meta-num">{tags.length}</div>
            <div className="hero__meta-sub">tags · {total} entries</div>
          </div>
        </div>
      </section>

      <section className="tag-cloud">
        <Link
          key="all"
          href="/tags/all"
          className="tag-cloud__item is-all"
        >
          <span className="tag-cloud__tag">ALL</span>
          <span className="tag-cloud__count">{total}</span>
        </Link>
        {tags.map(t => (
          <Link
            key={t.tag}
            href={`/tags/${encodeURIComponent(t.tag)}`}
            className="tag-cloud__item"
          >
            <span className="tag-cloud__tag">#{t.tag}</span>
            <span className="tag-cloud__count">{t.count}</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
