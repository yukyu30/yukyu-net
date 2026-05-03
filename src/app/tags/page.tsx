import Link from 'next/link'
import { getAllTagCounts } from '@/lib/posts'

export const metadata = {
  title: 'Tags | yukyu.net',
  description: 'タグ一覧'
}

export default function TagsIndex() {
  const tags = getAllTagCounts()
  const total = tags.reduce((acc, t) => acc + t.count, 0)

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <div className="hero__caption">Topics</div>
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
