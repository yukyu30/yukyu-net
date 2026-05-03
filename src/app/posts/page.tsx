import { getAllPosts } from '@/lib/posts'
import { PostIndexTable, Pagination } from '@/components/post-index-table'

const PAGE_SIZE = 20

export const metadata = {
  title: 'Posts | yukyu.net',
  description: 'すべての記事一覧'
}

const pageHref = (n: number) => (n === 1 ? '/posts' : `/posts/page/${n}`)

export default function PostsIndex() {
  const posts = getAllPosts()
  const total = posts.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const visible = posts.slice(0, PAGE_SIZE)

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
              {visible.length}
              <span className="hero__meta-num-small"> / {total}</span>
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
        pageHref={pageHref}
      />
    </div>
  )
}
