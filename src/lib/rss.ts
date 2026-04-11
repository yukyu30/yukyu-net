import { getAllPosts } from './posts'
import fs from 'fs'
import path from 'path'
import siteConfig from '@/config/site.json'

function escapeXML(text: string): string {
  // XMLエンティティをエスケープ
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cleanText(text: string): string {
  // 制御文字を削除（タブ、改行、キャリッジリターンを除く）
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

export function generateRSSFeed(): string {
  const posts = getAllPosts().filter(post => post.rss !== false)
  const siteUrl = process.env.SITE_URL || 'https://yukyu.net'
  const feedUrl = `${siteUrl}/rss.xml`

  const rssItems = posts.slice(0, 20).map(post => {
    const postUrl = `${siteUrl}/posts/${post.slug}`
    const pubDate = new Date(post.date).toUTCString()
    
    // タイトルと抜粋をクリーンアップしてエスケープ
    const cleanTitle = cleanText(post.title)
    const cleanExcerpt = cleanText(post.excerpt)
    const safeTitle = escapeXML(cleanTitle)
    const safeExcerpt = escapeXML(cleanExcerpt)
    
    return `
    <item>
      <title>${safeTitle}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${safeExcerpt}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteUrl}</link>
    <description>yukyu's thoughts and digital archive</description>
    <author>yukyu</author>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`

  return rss
}

export function writeRSSFeed(): void {
  const rss = generateRSSFeed()
  const publicPath = path.join(process.cwd(), 'public', 'rss.xml')
  fs.writeFileSync(publicPath, rss, 'utf-8')
  console.log('RSS feed generated at public/rss.xml')
}