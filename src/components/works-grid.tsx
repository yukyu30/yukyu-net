import { Link } from 'next-view-transitions'
import type { PostListItem } from '@/lib/posts'

interface Props {
  posts: PostListItem[]
}

export function WorksGrid({ posts }: Props) {
  return (
    <section className="works-grid">
      {posts.map((p, i) => {
        const num = String(posts.length - i).padStart(3, '0')
        const thumb = p.frontMatter.thumbnail
        return (
          <Link key={p.slug} href={`/posts/${p.slug}`} className="works-card">
            {thumb ? (
              <span className="works-card__thumb">
                <img src={thumb} alt="" loading="lazy" />
              </span>
            ) : (
              <span className="works-card__thumb works-card__thumb--placeholder">
                no image
              </span>
            )}
            <div className="works-card__body">
              <div className="works-card__meta">
                <span className="works-card__no">№{num}</span>
                <span>{p.frontMatter.date}</span>
              </div>
              <h2 className="works-card__title">{p.frontMatter.title}</h2>
              <div className="works-card__tags">
                {(p.frontMatter.tag ?? []).slice(0, 3).map(t => '#' + t).join(' ')}
              </div>
            </div>
          </Link>
        )
      })}
    </section>
  )
}
