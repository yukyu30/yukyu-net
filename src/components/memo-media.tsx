'use client'

/* eslint-disable @next/next/no-img-element */
// 署名付き外部URL（next/image の remotePatterns 設定を要さない）ため素の img を使う。

import { useCallback, useEffect, useState } from 'react'
import type { Attachment } from '@/lib/memos'

interface Props {
  images: Attachment[]
}

// タイムラインの X 風メディアグリッド。画像クリックでライトボックス拡大表示する
// （memo 全体は詳細へのリンクだが、画像だけは上に重ねて拡大に使う）。
export function MemoMedia({ images }: Props) {
  const shown = images.slice(0, 4)
  const overflow = images.length - shown.length
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const go = useCallback(
    (delta: number) =>
      setOpenIndex(prev =>
        prev === null ? prev : (prev + delta + images.length) % images.length
      ),
    [images.length]
  )

  useEffect(() => {
    if (openIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [openIndex, close, go])

  return (
    <>
      <div className={`memo__media memo__media--${shown.length}`}>
        {shown.map((img, i) => (
          <button
            type="button"
            className="memo__media-cell"
            key={img.externalLink}
            onClick={() => setOpenIndex(i)}
            aria-label={`画像を拡大: ${img.filename || 'image'}`}
          >
            <img
              className="memo__image"
              src={img.externalLink}
              alt={img.filename}
              loading="lazy"
            />
            {overflow > 0 && i === shown.length - 1 && (
              <span className="memo__media-more">+{overflow}</span>
            )}
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            type="button"
            className="lightbox__close"
            onClick={close}
            aria-label="閉じる"
          >
            ×
          </button>
          {images.length > 1 && (
            <button
              type="button"
              className="lightbox__nav lightbox__nav--prev"
              onClick={e => {
                e.stopPropagation()
                go(-1)
              }}
              aria-label="前の画像"
            >
              ‹
            </button>
          )}
          <img
            className="lightbox__image"
            src={images[openIndex].externalLink}
            alt={images[openIndex].filename}
            onClick={e => e.stopPropagation()}
          />
          {images.length > 1 && (
            <button
              type="button"
              className="lightbox__nav lightbox__nav--next"
              onClick={e => {
                e.stopPropagation()
                go(1)
              }}
              aria-label="次の画像"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  )
}
