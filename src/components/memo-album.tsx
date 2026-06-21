import { Link } from 'next-view-transitions'
import type { Attachment } from '@/lib/memos'

interface Props {
  images: Attachment[]
}

// Instagram 風の正方形タイルギャラリー。タイルをタップすると元の memo へ遷移する。
export function MemoAlbum({ images }: Props) {
  if (images.length === 0) {
    return <p className="memos__empty">まだ画像がありません。</p>
  }

  return (
    <div className="memo-album">
      {images.map(img => {
        const href = img.memoId ? `/memos/${img.memoId}` : undefined
        const tile = (
          // 署名付き外部URL。next/image の remotePatterns 設定を要さない素の img を使う。
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="memo-album__image"
            src={img.externalLink}
            alt={img.filename}
            loading="lazy"
          />
        )
        return href ? (
          <Link key={img.id} href={href} className="memo-album__cell">
            {tile}
          </Link>
        ) : (
          <span key={img.id} className="memo-album__cell">
            {tile}
          </span>
        )
      })}
    </div>
  )
}
