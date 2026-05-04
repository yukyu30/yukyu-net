import { getAllPosts, POSTS_PAGE_SIZE, postsPageHref } from '@/lib/posts'
import { PostIndexTable, Pagination } from '@/components/post-index-table'

export const metadata = {
  title: 'Posts | yukyu.net',
  description: 'すべての記事一覧'
}

export default function PostsIndex() {
  const posts = getAllPosts()
  const total = posts.length
  const totalPages = Math.ceil(total / POSTS_PAGE_SIZE)
  const visible = posts.slice(0, POSTS_PAGE_SIZE)

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <h1 className="hero__title">
              <span className="hero__title-slash">/</span>posts
            </h1>
          </div>
          <div>
            <div className="hero__meta-num">
              01
              <span className="hero__meta-num-small"> / {String(totalPages).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </section>

      <PostIndexTable posts={visible} total={total} startNo={total} />

      <Pagination
        page={1}
        totalPages={totalPages}
        total={total}
        shown={visible.length}
        pageStart={1}
        pageHref={postsPageHref}
      />
    </div>
  )
}
