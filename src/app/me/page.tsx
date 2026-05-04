import Link from 'next/link'
import { importPage } from 'nextra/pages'

export const metadata = {
  title: 'who | yukyu.net',
  description: 'yukyu のプロフィール'
}

interface TocEntry {
  id: string
  value: string
  depth: number
}

export default async function MePage() {
  const imported = await importPage(['posts', 'me'])
  const { default: MDXContent, toc } = imported as {
    default: React.ComponentType<unknown>
    toc: TocEntry[]
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <h1 className="hero__title">
              <span className="hero__title-slash">/</span>me
            </h1>
          </div>
          <div>
            <div className="hero__meta-sub">whoami</div>
          </div>
        </div>
      </section>

      <section className="post-layout">
        <aside className="post-toc">
          <div className="post-toc__head">— Table of Contents</div>
          <ol className="post-toc__list">
            {toc.map((entry, i) => (
              <li
                key={entry.id}
                className={`post-toc__item${entry.depth >= 3 ? ' is-sub' : ''}`}
              >
                <span className="post-toc__no">{String(i + 1).padStart(2, '0')}.</span>
                <a className="post-toc__link" href={`#${entry.id}`}>{entry.value}</a>
              </li>
            ))}
          </ol>
        </aside>
        <article className="post-body">
          <MDXContent />
          <div className="post-end">
            <span>
              <span className="post-end__accent">END</span>
            </span>
            <span>
              <Link href="/">← back to /index</Link>
            </span>
          </div>
        </article>
      </section>
    </div>
  )
}
