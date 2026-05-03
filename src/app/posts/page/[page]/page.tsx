import { notFound } from 'next/navigation'
import { getAllPosts } from '@/lib/posts'
import { PostIndexTable, Pagination } from '@/components/post-index-table'

const PAGE_SIZE = 20

interface PageProps {
  params: Promise<{ page: string }>
}

const pageHref = (n: number) => (n === 1 ? '/posts' : `/posts/page/${n}`)

export function generateStaticParams() {
  const total = getAllPosts().length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const out = []
  for (let i = 2; i <= totalPages; i += 1) {
    out.push({ page: String(i) })
  }
  return out
}

export async function generateMetadata(props: PageProps) {
  const { page } = await props.params
  return {
    title: `Posts page ${page} | yukyu.net`,
    description: `${page}ページ目の記事一覧`
  }
}

export default async function PaginatedPosts(props: PageProps) {
  const { page: rawPage } = await props.params
  const page = Number.parseInt(rawPage, 10)
  if (!Number.isFinite(page) || page < 2) notFound()

  const posts = getAllPosts()
  const total = posts.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (page > totalPages) notFound()

  const start = (page - 1) * PAGE_SIZE
  const visible = posts.slice(start, start + PAGE_SIZE)
  const startNo = total - start
  const pageStart = start + 1

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <h1 className="hero__title">
              <span className="hero__title-slash">/</span>posts/{page}
            </h1>
          </div>
          <div>
            <div className="hero__meta-num">
              {String(page).padStart(2, '0')}
              <span className="hero__meta-num-small"> / {String(totalPages).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </section>

      <PostIndexTable posts={visible} total={total} startNo={startNo} />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        shown={visible.length}
        pageStart={pageStart}
        pageHref={pageHref}
      />
    </div>
  )
}
