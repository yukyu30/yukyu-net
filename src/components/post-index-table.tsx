import Link from 'next/link'
import { Link as ViewTransitionLink } from 'next-view-transitions'
import type { PostListItem } from '@/lib/posts'

interface Props {
  posts: PostListItem[]
}

interface YearGroup {
  year: string
  posts: PostListItem[]
}

// posts は date 降順で渡される前提。年ごとに連続したまとまりに畳み込む。
function groupByYear(posts: PostListItem[]): YearGroup[] {
  const groups: YearGroup[] = []
  for (const post of posts) {
    const year = post.frontMatter.date.slice(0, 4)
    const last = groups[groups.length - 1]
    if (last && last.year === year) {
      last.posts.push(post)
    } else {
      groups.push({ year, posts: [post] })
    }
  }
  return groups
}

export function PostIndexTable({ posts }: Props) {
  const groups = groupByYear(posts)
  return (
    <section className="index-table">
      {groups.map(group => (
        <div className="index-year" key={group.year}>
          <div className="index-year__label">{group.year}</div>
          <div className="index-year__list">
            {group.posts.map(p => (
              <ViewTransitionLink
                key={p.slug}
                href={`/posts/${p.slug}`}
                className="index-row"
              >
                <span className="index-row__date">
                  {p.frontMatter.date.slice(5).replace('-', '.')}
                </span>
                <span className="index-row__title">{p.frontMatter.title}</span>
                <span className="index-row__arrow" aria-hidden>↗</span>
              </ViewTransitionLink>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  shown: number
  pageStart: number
  pageHref?: (n: number) => string
}

const defaultPageHref = (n: number) => (n === 1 ? '/' : `/page/${n}`)

export function Pagination({
  page,
  totalPages,
  total,
  shown,
  pageStart,
  pageHref = defaultPageHref
}: PaginationProps) {
  if (totalPages <= 1) return null

  const prev = page > 1 ? pageHref(page - 1) : null
  const next = page < totalPages ? pageHref(page + 1) : null

  const numbers = buildPageNumbers(page, totalPages)

  return (
    <section className="pagination">
      <div className="pagination__meta">
        Page {String(page).padStart(2, '0')} / {String(totalPages).padStart(2, '0')} · showing
        {' '}
        {String(pageStart).padStart(2, '0')}–{String(pageStart + shown - 1).padStart(2, '0')}
        {' '}of {total}
      </div>
      <div className="pagination__pages">
        {prev ? (
          <Link href={prev} className="pagination__page">← prev</Link>
        ) : (
          <span className="pagination__page is-disabled">← prev</span>
        )}
        {numbers.map((n, i) =>
          n === '…' ? (
            <span key={`gap-${i}`} className="pagination__page is-disabled">…</span>
          ) : (
            <Link
              key={n}
              href={pageHref(n)}
              className={`pagination__page${n === page ? ' is-active' : ''}`}
            >
              {String(n).padStart(2, '0')}
            </Link>
          )
        )}
        {next ? (
          <Link href={next} className="pagination__page">next →</Link>
        ) : (
          <span className="pagination__page is-disabled">next →</span>
        )}
      </div>
    </section>
  )
}

function buildPageNumbers(page: number, total: number): Array<number | '…'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const out: Array<number | '…'> = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)
  if (start > 2) out.push('…')
  for (let i = start; i <= end; i += 1) out.push(i)
  if (end < total - 1) out.push('…')
  out.push(total)
  return out
}
