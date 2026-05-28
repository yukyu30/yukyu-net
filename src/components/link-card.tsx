import { fetchOgData } from '@/lib/og'

interface Props {
  url: string
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * ベタ貼り URL を OG メタデータ付きのリンクカードとして表示する。
 * remark-link-card プラグインが MDX 内に挿入する。
 * 取得に失敗した場合は URL とホスト名のみのカードにフォールバックする。
 */
export async function LinkCard({ url }: Props) {
  const og = await fetchOgData(url)
  const host = hostnameOf(url)
  const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`

  return (
    <a
      className="link-card"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="link-card__body">
        <div className="link-card__title">{og.title ?? url}</div>
        {og.description && (
          <div className="link-card__desc">{og.description}</div>
        )}
        <div className="link-card__meta">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="link-card__favicon"
            src={favicon}
            alt=""
            width={16}
            height={16}
            loading="lazy"
          />
          <span className="link-card__host">{og.siteName ?? host}</span>
        </div>
      </div>
      {og.image && (
        <div className="link-card__thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={og.image} alt="" loading="lazy" />
        </div>
      )}
    </a>
  )
}
