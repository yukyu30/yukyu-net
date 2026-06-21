import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

// ブログ側のクローム。サイト共通のヘッダー/フッターを付ける。
export default function BlogLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}
