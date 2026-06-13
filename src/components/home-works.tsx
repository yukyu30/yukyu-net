'use client'

import { useEffect, useRef } from 'react'
import { Link as ViewTransitionLink } from 'next-view-transitions'
import type { PostListItem } from '@/lib/posts'

interface Props {
  works: PostListItem[]
}

export function HomeWorks({ works }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  // 縦ホイールを横スクロールに変換する。
  // ただし端まで来たら通常の縦スクロールへ委ねる（スクロールを閉じ込めない）。
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      // トラックパッドの横スワイプ等はそのままネイティブに任せる
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      const atStart = el.scrollLeft <= 0
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <section className="home-works">
      <div className="home-works__intro">
        <div className="home-works__heading">WORKS</div>
        <p className="home-works__desc">
          エンジニアとしてWebアプリケーションを作ったり、デザインが好きなのでロゴデザインなどをしています。
        </p>
      </div>
      <div className="home-works__scroller" ref={scrollerRef}>
        <div className="home-works__track">
          {works.map(p => (
            <ViewTransitionLink
              key={p.slug}
              href={`/posts/${p.slug}`}
              className="home-works__item"
            >
              <span className="home-works__thumb">
                <img src={p.frontMatter.thumbnail} alt="" loading="lazy" />
              </span>
              <div className="home-works__meta">
                <span className="home-works__date">{p.frontMatter.date}</span>
                <span className="home-works__title">{p.frontMatter.title}</span>
              </div>
            </ViewTransitionLink>
          ))}
        </div>
      </div>
    </section>
  )
}
