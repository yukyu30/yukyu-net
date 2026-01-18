import { getAllPosts, getAllTags } from './posts'
import { getTotalPages } from './pagination'

export const SITE_URL = 'https://yukyu.net'

export interface SitemapEntry {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export function generateSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = []
  const posts = getAllPosts()
  const tags = getAllTags()
  const totalPages = getTotalPages(posts.length)

  // ホームページ
  entries.push({
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  })

  // ページネーションページ（2ページ目以降）
  for (let i = 2; i <= totalPages; i++) {
    entries.push({
      url: `${SITE_URL}/page/${i}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })
  }

  // 記事ページ
  posts.forEach(post => {
    // 日付が有効かチェック
    const date = new Date(post.date)
    const lastModified = isNaN(date.getTime()) ? new Date() : date

    entries.push({
      url: `${SITE_URL}/posts/${post.slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  // 静的ページ
  entries.push({
    url: `${SITE_URL}/works`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  })

  entries.push({
    url: `${SITE_URL}/tags`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  })

  entries.push({
    url: `${SITE_URL}/status`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.5,
  })

  // タグページ
  tags.forEach((_, tagName) => {
    entries.push({
      url: `${SITE_URL}/tags/${encodeURIComponent(tagName)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    })
  })

  return entries
}
