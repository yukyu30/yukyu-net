import { getAllPosts } from '@/lib/posts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yukyu.net'
const SITE_TITLE = 'yukyu.net'
const SITE_DESCRIPTION = '個人的な覚え書き'
const FEED_LIMIT = 50

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function rfc822(date: string): string {
  const d = new Date(`${date}T00:00:00+09:00`)
  return d.toUTCString()
}

export async function GET() {
  const posts = getAllPosts().slice(0, FEED_LIMIT)
  const lastBuild = posts[0]?.frontMatter.date ?? new Date().toISOString().slice(0, 10)

  const items = posts
    .map(p => {
      const url = `${SITE_URL}/posts/${p.slug}`
      const description = p.frontMatter.description ?? ''
      return `    <item>
      <title>${escapeXml(p.frontMatter.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${rfc822(p.frontMatter.date)}</pubDate>
      ${description ? `<description>${escapeXml(description)}</description>` : ''}
      ${(p.frontMatter.tag ?? []).map(t => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>
    <atom:link href="${escapeXml(SITE_URL)}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
