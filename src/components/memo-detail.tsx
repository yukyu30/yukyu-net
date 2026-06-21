import type { Memo } from '@/lib/memos'
import { MemoTime } from '@/components/memo-time'

interface Props {
  memo: Memo
}

export function MemoDetail({ memo }: Props) {
  const images = memo.attachments.filter(a => a.isImage)
  const files = memo.attachments.filter(a => !a.isImage)

  return (
    <article className="memo-detail">
      <header className="memo-detail__head">
        <MemoTime iso={memo.createTime} className="memo__time" />
        {memo.pinned && <span className="memo__pin">PINNED</span>}
      </header>

      {memo.content && <div className="memo-detail__body">{memo.content}</div>}

      {images.length > 0 && (
        <div className="memo-detail__media">
          {images.map(img => (
            // 署名付き外部URL。next/image の remotePatterns 設定を要さない素の img を使う。
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.externalLink}
              className="memo-detail__image"
              src={img.externalLink}
              alt={img.filename}
              loading="lazy"
            />
          ))}
        </div>
      )}

      {files.length > 0 && (
        <ul className="memo__files">
          {files.map(file => (
            <li key={file.externalLink}>
              <a
                className="memo__file"
                href={file.externalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {file.filename || file.externalLink}
              </a>
            </li>
          ))}
        </ul>
      )}

      {memo.tags.length > 0 && (
        <ul className="memo-detail__tags">
          {memo.tags.map(tag => (
            <li key={tag} className="memo-detail__tag">#{tag}</li>
          ))}
        </ul>
      )}
    </article>
  )
}
