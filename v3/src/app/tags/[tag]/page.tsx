import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllTagCounts, getPostsByTag, getTopTags } from '@/lib/posts'

const VISUAL_TAGS = new Set(['work', 'つくったもの'])

interface PageProps {
  params: Promise<{ tag: string }>
}

export function generateStaticParams() {
  return getAllTagCounts().map(({ tag }) => ({ tag }))
}

export async function generateMetadata(props: PageProps) {
  const { tag } = await props.params
  const decoded = decodeURIComponent(tag)
  return {
    title: `#${decoded} | yukyu.net`,
    description: `${decoded} タグの記事一覧`
  }
}

export default async function TagPage(props: PageProps) {
  const { tag: rawTag } = await props.params
  const tag = decodeURIComponent(rawTag)
  const posts = getPostsByTag(tag)
  if (posts.length === 0) notFound()

  const isVisual = VISUAL_TAGS.has(tag)
  const topTags = getTopTags(6)

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <div className="hero__caption">Tag — #{tag}</div>
            <h1 className="hero__title">
              <span className="hero__title-slash">#</span>{tag}
            </h1>
          </div>
          <div>
            <div className="hero__meta-num">{posts.length}</div>
            <div className="hero__meta-sub">entries</div>
            <p className="hero__meta-text">
              「{tag}」タグが付いた記事の一覧。新しい順。
            </p>
          </div>
        </div>
      </section>

      <section className="cat-grid">
        {topTags.map((t, i) => (
          <Link
            key={t.tag}
            href={`/tags/${encodeURIComponent(t.tag)}`}
            className={`cat-grid__cell${t.tag === tag ? ' is-feature' : ''}`}
          >
            <div className="cat-grid__cell-no">0{i + 1} / #{t.tag}</div>
            <div className="cat-grid__cell-name">{t.tag}</div>
            <div className="cat-grid__cell-count">{t.count} entries →</div>
          </Link>
        ))}
      </section>

      {isVisual ? (
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
      ) : (
        <section className="index-table">
          <div className="index-table__head">
            <span>NO.</span>
            <span>DATE</span>
            <span>TITLE</span>
            <span>TAGS</span>
          </div>
          {posts.map((p, i) => {
            const num = String(posts.length - i).padStart(3, '0')
            return (
              <Link key={p.slug} href={`/posts/${p.slug}`} className="index-row">
                <span className="index-row__no">№{num}</span>
                <span className="index-row__date">{p.frontMatter.date}</span>
                <h2 className="index-row__title">{p.frontMatter.title}</h2>
                <span className="index-row__tags">
                  {(p.frontMatter.tag ?? []).slice(0, 2).map(t => '#' + t).join(' ')}
                </span>
              </Link>
            )
          })}
        </section>
      )}
    </div>
  )
}
