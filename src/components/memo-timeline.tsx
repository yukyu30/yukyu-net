import type { Memo } from '@/lib/memos'

interface Props {
  memos: Memo[]
}

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

function formatTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return dateFormatter.format(d)
}

export function MemoTimeline({ memos }: Props) {
  if (memos.length === 0) {
    return (
      <p className="memos__empty">まだ memo がありません。</p>
    )
  }

  return (
    <ol className="memos__list">
      {memos.map(memo => {
        const images = memo.attachments.filter(a => a.isImage)
        const files = memo.attachments.filter(a => !a.isImage)
        return (
          <li key={memo.id} className="memo">
            <div className="memo__head">
              <time className="memo__time" dateTime={memo.createTime}>
                {formatTime(memo.createTime)}
              </time>
              {memo.pinned && <span className="memo__pin">PINNED</span>}
            </div>

            {memo.content && <p className="memo__body">{memo.content}</p>}

            {images.length > 0 && (
              <div className="memo__media">
                {images.map(img => (
                  // 署名付き外部URL。next/image の remotePatterns 設定を要さない素の img を使う。
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.externalLink}
                    className="memo__image"
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
          </li>
        )
      })}
    </ol>
  )
}
