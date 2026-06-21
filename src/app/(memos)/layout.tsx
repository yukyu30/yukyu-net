import { Link } from 'next-view-transitions'

// memos 専用の zen クローム。サイトの太いヘッダー/フッターは付けず、
// 静かな帰り導線と広い余白だけを与える。
export default function MemosLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="zen">
      <header className="zen__bar">
        <Link href="/" className="zen__home">
          yukyu.net
        </Link>
        <a
          href="https://memos.yukyu.net/u/ugo/rss.xml"
          className="zen__feed"
          target="_blank"
          rel="noopener noreferrer"
        >
          rss
        </a>
      </header>
      <main className="zen__main">{children}</main>
    </div>
  )
}
