import Link from 'next/link'
import type { PostListItem } from '@/lib/posts'

interface Props {
  posts: PostListItem[]
  total: number
  startNo: number
  highlightFirst?: boolean
}

export function PostIndexTable({ posts, total, startNo, highlightFirst = false }: Props) {
  return (
    <section className="index-table">
      <div className="index-table__head">
        <span>NO.</span>
        <span>DATE</span>
        <span>TITLE</span>
      </div>
      {posts.map((p, i) => {
        const num = String(startNo - i).padStart(3, '0')
        const isFirst = highlightFirst && i === 0
        return (
          <Link
            key={p.slug}
            href={`/posts/${p.slug}`}
            className={`index-row${isFirst ? ' is-first' : ''}`}
          >
            <span className="index-row__no">№{num}</span>
            <span className="index-row__date">{p.frontMatter.date}</span>
            <span className="index-row__title">{p.frontMatter.title}</span>
          </Link>
        )
      })}
    </section>
  )
}

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  shown: number
  pageStart: number
}

export function Pagination({ page, totalPages, total, shown, pageStart }: PaginationProps) {
  if (totalPages <= 1) return null

  const pageHref = (n: number) => (n === 1 ? '/' : `/page/${n}`)
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
