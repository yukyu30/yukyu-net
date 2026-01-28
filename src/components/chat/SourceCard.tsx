'use client'

import Link from 'next/link'

interface Source {
  slug: string
  title: string
  excerpt?: string
  score?: number
}

interface SourceCardProps {
  source: Source
  index: number
}

// HTMLタグを除去してプレーンテキストに変換
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // HTMLタグを除去
    .replace(/&nbsp;/g, ' ') // &nbsp;をスペースに
    .replace(/&amp;/g, '&')  // &amp;を&に
    .replace(/&lt;/g, '<')   // &lt;を<に
    .replace(/&gt;/g, '>')   // &gt;を>に
    .replace(/&quot;/g, '"') // &quot;を"に
    .replace(/\s+/g, ' ')    // 連続する空白を1つに
    .trim()
}

export function SourceCard({ source, index }: SourceCardProps) {
  const relevancePercent = source.score ? Math.round(source.score * 100) : null
  const cleanExcerpt = source.excerpt ? stripHtml(source.excerpt) : null

  return (
    <Link
      href={`/posts/${source.slug}`}
      className="group block bg-green-950/30 border border-green-800/50 rounded-lg p-3 hover:bg-green-900/40 hover:border-green-600 transition-all duration-200"
    >
      <div className="flex items-start gap-2">
        {/* Index badge */}
        <span className="flex-shrink-0 w-5 h-5 bg-green-700/50 rounded text-xs flex items-center justify-center text-green-300">
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="text-sm font-medium text-green-300 group-hover:text-green-200 truncate">
            {source.title}
          </h4>

          {/* Excerpt (HTML stripped) */}
          {cleanExcerpt && (
            <p className="mt-1 text-xs text-green-600 line-clamp-2">
              {cleanExcerpt}
            </p>
          )}

          {/* Relevance score */}
          {relevancePercent !== null && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-green-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${relevancePercent}%` }}
                />
              </div>
              <span className="text-xs text-green-600">{relevancePercent}%</span>
            </div>
          )}
        </div>

        {/* Arrow icon */}
        <svg
          className="flex-shrink-0 w-4 h-4 text-green-700 group-hover:text-green-400 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

interface SourcesListProps {
  sources: Source[]
  compact?: boolean
}

export function SourcesList({ sources, compact = false }: SourcesListProps) {
  if (sources.length === 0) return null

  if (compact) {
    return (
      <div className="mt-3 pt-2 border-t border-green-900">
        <p className="text-xs text-green-700 mb-1">参考記事:</p>
        <ul className="text-xs space-y-1">
          {sources.map((src, j) => (
            <li key={j}>
              <Link href={`/posts/${src.slug}`} className="text-green-500 hover:text-green-300 underline">
                {src.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sources.map((source, index) => (
        <SourceCard key={source.slug} source={source} index={index} />
      ))}
    </div>
  )
}
