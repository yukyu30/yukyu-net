import type { Metadata } from 'next'
import { ViewTransitions } from 'next-view-transitions'
import './globals.css'

export const metadata: Metadata = {
  title: 'yukyu.net',
  description: '個人的な覚え書き',
  other: {
    'vibe-gallery-verification': '39d410fe-52e8-4b11-a97e-a03759c7bc59'
  }
}

// ルートは html/body と全体共有のシェルだけを担う。
// ヘッダー/フッターなどのクロームは route group ((blog) / (memos)) ごとの
// レイアウトで切り替える。
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html lang="ja" suppressHydrationWarning>
        <body>{children}</body>
      </html>
    </ViewTransitions>
  )
}
