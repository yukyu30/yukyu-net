import { getLinkCardMeta } from '@/lib/link-card/cache'
import type { LinkCardMeta } from '@/lib/link-card/types'

interface LinkCardProps {
  url: string
}

const CURRENCY_SYMBOL: Record<string, string> = {
  JPY: '¥',
  USD: '$',
  EUR: '€',
  GBP: '£',
  KRW: '₩',
  CNY: '¥',
  TWD: 'NT$'
}

function formatPrice(meta: LinkCardMeta): string | undefined {
  if (!meta.price) return undefined
  const numeric = Number(meta.price)
  const amount = Number.isFinite(numeric)
    ? numeric.toLocaleString('ja-JP', { maximumFractionDigits: 2 })
    : meta.price
  const currency = meta.currency?.toUpperCase()
  const symbol = currency ? (CURRENCY_SYMBOL[currency] ?? `${currency} `) : '¥'
  return `${symbol}${amount}`
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function LinkCard({ url }: LinkCardProps) {
  const meta = getLinkCardMeta(url)
  const host = hostname(url)
  const price = meta ? formatPrice(meta) : undefined

  if (!meta) {
    return (
      <a className="link-card link-card--fallback" href={url} target="_blank" rel="noopener noreferrer">
        <span className="link-card__fallback-host">{host}</span>
        <span className="link-card__fallback-url">{url}</span>
      </a>
    )
  }

  return (
    <a className="link-card" href={url} target="_blank" rel="noopener noreferrer">
      <div className="link-card__body">
        <div className="link-card__title">{meta.title}</div>
        {meta.description && (
          <p className="link-card__desc">{meta.description}</p>
        )}
        <div className="link-card__site">
          {meta.favicon && (
            <img
              className="link-card__favicon"
              src={meta.favicon}
              alt=""
              width={14}
              height={14}
              loading="lazy"
            />
          )}
          <span>{meta.siteName ?? host}</span>
        </div>
      </div>
      {meta.image && (
        <div className="link-card__media">
          <img
            className="link-card__image"
            src={meta.image}
            alt=""
            loading="lazy"
          />
          {price && <span className="link-card__price">{price}</span>}
        </div>
      )}
      {!meta.image && price && (
        <span className="link-card__price link-card__price--inline">{price}</span>
      )}
    </a>
  )
}
