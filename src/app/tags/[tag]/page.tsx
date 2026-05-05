import { notFound } from 'next/navigation'
import {
  getAllPosts,
  getAllTagCounts,
  getPostsByTag
} from '@/lib/posts'
import { PostIndexTable } from '@/components/post-index-table'
import { TagsSlider } from '@/components/tags-slider'

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

  const allTags = getAllTagCounts()
  const totalCount = getAllPosts().length
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

      <TagsSlider tags={allTags} currentTag={isAll ? null : tag} totalCount={totalCount} />

      <PostIndexTable posts={posts} total={posts.length} startNo={posts.length} />

    </div>
  )
}
