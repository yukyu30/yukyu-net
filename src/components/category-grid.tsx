import Link from 'next/link'
import { getAllPosts, getTopTags } from '@/lib/posts'

export function CategoryGrid() {
  const total = getAllPosts().length
  const topTags = getTopTags(5)

  return (
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
  )
}
