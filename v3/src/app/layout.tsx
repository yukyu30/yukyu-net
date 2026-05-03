import type { Metadata } from 'next'
import { Footer, Layout, Navbar } from 'nextra-theme-blog'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-blog/style.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'yukyu.net',
  description: 'yukyu.net renewal'
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="light" suppressHydrationWarning>
      <body>
        <Layout
          banner={null}
          nextThemes={{ forcedTheme: 'light', defaultTheme: 'light' }}
          navbar={<Navbar pageMap={await getPageMap()} />}
          footer={<Footer>© {new Date().getFullYear()} yukyu</Footer>}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
