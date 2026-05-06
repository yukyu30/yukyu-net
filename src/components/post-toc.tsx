'use client'

import { useEffect, useState } from 'react'

interface TocEntry {
  id: string
  value: string
  depth: number
}

interface Props {
  toc: TocEntry[]
}

export function PostToc({ toc }: Props) {
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null)

  useEffect(() => {
    if (toc.length === 0) return

    const headings = toc
      .map(entry => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    const visible = new Map<string, number>()

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top)
          } else {
            visible.delete(entry.target.id)
          }
        }

        if (visible.size > 0) {
          const topId = [...visible.entries()].sort((a, b) => a[1] - b[1])[0][0]
          setActiveId(topId)
          return
        }

        // No headings intersecting: pick the last one above the viewport.
        let lastAbove: string | null = null
        for (const h of headings) {
          if (h.getBoundingClientRect().top < 0) lastAbove = h.id
          else break
        }
        if (lastAbove) setActiveId(lastAbove)
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: [0, 1]
      }
    )

    for (const h of headings) observer.observe(h)
    return () => observer.disconnect()
  }, [toc])

  return (
    <aside className="post-toc">
      <div className="post-toc__head">— Table of Contents</div>
      <ol className="post-toc__list">
        {toc.map((entry, i) => {
          const isActive = entry.id === activeId
          return (
            <li
              key={entry.id}
              className={`post-toc__item${entry.depth >= 3 ? ' is-sub' : ''}${isActive ? ' is-active' : ''}`}
            >
              <span className="post-toc__no">{String(i + 1).padStart(2, '0')}.</span>
              <a
                className={`post-toc__link${isActive ? ' is-active' : ''}`}
                href={`#${entry.id}`}
                aria-current={isActive ? 'true' : undefined}
              >
                {entry.value}
              </a>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
