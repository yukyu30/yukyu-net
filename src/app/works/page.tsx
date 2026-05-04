import Link from 'next/link'
import { getWorks } from '@/lib/posts'

export const metadata = {
  title: 'works | yukyu.net',
  description: 'これまでにつくったもの'
}

export default function WorksPage() {
  const works = getWorks()

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <h1 className="hero__title">
              <span className="hero__title-slash">/</span>works
            </h1>
          </div>
          <div>
            <div className="hero__meta-num">{works.length}</div>
            <div className="hero__meta-sub">entries</div>
          </div>
        </div>
      </section>

      <section className="works-grid">
        {works.map((p, i) => {
          const num = String(works.length - i).padStart(3, '0')
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
    </div>
  )
}
