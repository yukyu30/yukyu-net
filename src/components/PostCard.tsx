'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Post } from '@/lib/posts'
import UnlockTransition from './UnlockTransition'

interface PostCardProps {
  post: Post
  index: number
}

export default function PostCard({ post, index }: PostCardProps) {
  const [isUnlocking, setIsUnlocking] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  const isExternal = !!post.externalUrl

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isExternal) {
      window.open(post.externalUrl, '_blank', 'noopener,noreferrer')
    } else {
      setIsUnlocking(true)
    }
  }

  useEffect(() => {
    if (cardRef.current) {
      // フォルダ（中央）から出てくるアニメーション
      const delay = index * 0.03

      // カードの位置を取得して中央からの相対位置を計算
      const rect = cardRef.current.getBoundingClientRect()
      const windowCenterX = window.innerWidth / 2
      const windowCenterY = window.innerHeight / 2
      const cardCenterX = rect.left + rect.width / 2
      const cardCenterY = rect.top + rect.height / 2

      // 中央からカードへの方向ベクトル（逆方向に初期位置を設定）
      const offsetX = windowCenterX - cardCenterX
      const offsetY = windowCenterY - cardCenterY

      // 初期位置: 画面中央（フォルダ位置）に重なった状態
      gsap.set(cardRef.current, {
        x: offsetX,
        y: offsetY,
        opacity: 0,
        scale: 0.2,
        rotation: -10 + (index % 5) * 4,
      })

      // アニメーション: 中央から各位置へ展開
      gsap.to(cardRef.current, {
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.5,
        delay: delay,
        ease: 'power3.out',
      })
    }
  }, [index])

  const href = isExternal ? post.externalUrl! : `/posts/${post.slug}`

  return (
    <>
      {isUnlocking && (
        <UnlockTransition
          href={`/posts/${post.slug}`}
          onComplete={() => setIsUnlocking(false)}
        />
      )}
      <article
        ref={cardRef}
        className="p-2 h-full opacity-0"
      >
        <a
          href={href}
          onClick={handleClick}
          className="block cursor-pointer group h-full"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <div className="bg-black group-hover:bg-green-950/50 transition-colors h-full flex flex-col p-4">
            {/* ヘッダー */}
            <div className="flex items-center gap-2 mb-3 text-green-600">
              <span className="text-sm font-mono">{post.slug}.md</span>
              <span className="text-sm font-mono ml-auto">{post.date}</span>
            </div>

            {/* サムネイル */}
            {post.thumbnail && (
              <div className="mb-3 relative aspect-video bg-green-950 overflow-hidden">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  loading="lazy"
                />
              </div>
            )}

            {/* コンテンツ */}
            <h2 className="text-lg font-bold mb-2 leading-tight group-hover:text-green-300 transition-colors">
              {post.title}
            </h2>
            <p className="text-base leading-relaxed line-clamp-3 text-green-600 flex-1">
              {post.excerpt}
            </p>

            {/* タグ */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 mt-3 text-sm font-mono text-green-600">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag}>[{tag}]</span>
                ))}
              </div>
            )}

            {/* フッター */}
            <div className="mt-3 pt-3 border-t border-green-800">
              <span className="text-sm font-mono text-green-400">
                {isExternal ? <>&#62;_ EXTERNAL LINK &#8599;</> : <>&#62;_ OPEN</>}
              </span>
            </div>
          </div>
        </a>
      </article>
    </>
  )
}
