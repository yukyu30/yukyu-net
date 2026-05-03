import type { Metadata } from 'next'
import { ViewTransitions } from 'next-view-transitions'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'yukyu.net',
  description: '個人的な覚え書き',
  other: {
    'vibe-gallery-verification': '39d410fe-52e8-4b11-a97e-a03759c7bc59'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html lang="ja" suppressHydrationWarning>
        <body>
          <SiteHeader />
          {children}
          <SiteFooter />
        </body>
      </html>
    </ViewTransitions>
  )
}
