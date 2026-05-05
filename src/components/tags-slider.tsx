'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import Splide from '@splidejs/splide'
import '@splidejs/splide/dist/css/splide-core.min.css'
import type { TagCount } from '@/lib/posts'

interface Props {
  tags: TagCount[]
  currentTag: string | null
  totalCount: number
}

const ALL_HREF = '/tags/all'

export function TagsSlider({ tags, currentTag, totalCount }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const splide = new Splide(ref.current, {
      type: 'slide',
      perPage: 6,
      perMove: 1,
      gap: 0,
      pagination: false,
      arrows: true,
      drag: true,
      breakpoints: {
        960: { perPage: 4 },
        640: { perPage: 3 }
      }
    })
    splide.mount()
    return () => {
      splide.destroy()
    }
  }, [])

  return (
    <section className="tags-slider splide" ref={ref} aria-label="tags">
      <div className="splide__track">
        <ul className="splide__list">
          <li className="splide__slide">
            <Link
              href={ALL_HREF}
              className={`tags-slider__cell${currentTag === null ? ' is-feature' : ''}`}
            >
              <div className="tags-slider__no">01 / all</div>
              <div className="tags-slider__name">all</div>
              <div className="tags-slider__count">{totalCount} entries →</div>
            </Link>
          </li>
          {tags.map((t, i) => (
            <li key={t.tag} className="splide__slide">
              <Link
                href={`/tags/${encodeURIComponent(t.tag)}`}
                className={`tags-slider__cell${t.tag === currentTag ? ' is-feature' : ''}`}
              >
                <div className="tags-slider__no">
                  {String(i + 2).padStart(2, '0')} / #{t.tag}
                </div>
                <div className="tags-slider__name">{t.tag}</div>
                <div className="tags-slider__count">{t.count} entries →</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
