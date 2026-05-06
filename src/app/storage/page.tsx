import Link from 'next/link'
import type { Metadata } from 'next'
import { getStorageItems, type StorageItem } from '@/lib/storage'

export const metadata: Metadata = {
  title: 'storage | yukyu.net',
  description: 'ブログ記事に登場した画像とリンクの一覧'
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

function formatPrice(price?: string, currency?: string): string | undefined {
  if (!price) return undefined
  const numeric = Number(price)
  const amount = Number.isFinite(numeric)
    ? numeric.toLocaleString('ja-JP', { maximumFractionDigits: 2 })
    : price
  const code = currency?.toUpperCase()
  const symbol = code ? (CURRENCY_SYMBOL[code] ?? `${code} `) : '¥'
  return `${symbol}${amount}`
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function ItemView({ item }: { item: StorageItem }) {
  if (item.kind === 'image') {
    return (
      <Link
        href={`/posts/${item.slug}`}
        className="storage-item"
        title={item.postTitle}
      >
        <div className="storage-item__media">
          <img src={item.src} alt={item.postTitle} loading="lazy" />
          <div className="storage-item__caption">
            <span>{item.postTitle}</span>
            <span className="storage-item__host">{item.postDate}</span>
          </div>
        </div>
      </Link>
    )
  }

  const price = formatPrice(item.price, item.currency)
  const host = item.siteName ?? hostname(item.url)

  if (item.image) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="storage-item"
        title={item.title}
      >
        <div className="storage-item__media">
          <img src={item.image} alt={item.title} loading="lazy" />
          {price && <span className="storage-item__price">{price}</span>}
          <div className="storage-item__caption">
            <span>{item.title}</span>
            <span className="storage-item__host">{host}</span>
          </div>
        </div>
      </a>
    )
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="storage-item storage-item--text"
    >
      <div className="storage-item__title">{item.title}</div>
      <div className="storage-item__caption">
        {price && <span>{price}</span>}
        <span className="storage-item__host">{host}</span>
      </div>
    </a>
  )
}

export default function StoragePage() {
  const items = getStorageItems()
  return (
    <div className="storage-page">
      <div className="storage-page__head">
        <h1 className="storage-page__title">storage</h1>
        <span className="storage-page__count">{items.length} items</span>
      </div>
      <p className="storage-page__sub">
        記事に登場した画像 / リンクをまとめて眺めるためのインデックス。
      </p>
      <div className="storage-grid">
        {items.map((item, i) => (
          <ItemView key={`${item.kind}-${i}`} item={item} />
        ))}
      </div>
    </div>
  )
}
