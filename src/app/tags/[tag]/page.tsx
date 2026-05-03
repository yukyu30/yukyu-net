import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getAllPosts,
  getAllTagCounts,
  getPostsByTag,
  getTopTags
} from '@/lib/posts'
import { PostIndexTable } from '@/components/post-index-table'

const VISUAL_TAGS = new Set(['work', 'つくったもの'])
const ALL_KEY = 'all'

interface PageProps {
  params: Promise<{ tag: string }>
}

export function generateStaticParams() {
  return [
    { tag: ALL_KEY },
    ...getAllTagCounts().map(({ tag }) => ({ tag }))
  ]
}

export async function generateMetadata(props: PageProps) {
  const { tag } = await props.params
  const decoded = decodeURIComponent(tag)
  if (decoded.toLowerCase() === ALL_KEY) {
    return { title: 'All entries | yukyu.net', description: 'すべての記事' }
  }
  return {
    title: `#${decoded} | yukyu.net`,
    description: `${decoded} タグの記事一覧`
  }
}

export default async function TagPage(props: PageProps) {
  const { tag: rawTag } = await props.params
  const tag = decodeURIComponent(rawTag)
  const isAll = tag.toLowerCase() === ALL_KEY
  const posts = isAll ? getAllPosts() : getPostsByTag(tag)
  if (posts.length === 0) notFound()

  const isVisual = !isAll && VISUAL_TAGS.has(tag)
  const topTags = getTopTags(6)
  const heroSlash = isAll ? '/' : '#'
  const heroLabel = isAll ? 'all' : tag

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <h1 className="hero__title">
              <span className="hero__title-slash">{heroSlash}</span>{heroLabel}
            </h1>
          </div>
          <div>
            <div className="hero__meta-num">{posts.length}</div>
            <div className="hero__meta-sub">entries</div>
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
            <div className="cat-grid__cell-no">{String(i + 1).padStart(2, '0')} / #{t.tag}</div>
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
        <PostIndexTable posts={posts} total={posts.length} startNo={posts.length} />
      )}
    </div>
  )
}
