import Link from 'next/link';
import DecoBocoTitle from './DecoBocoTitle';

interface HeaderProps {
  postsCount?: number;
  lastUpdate?: string;
  showBackButton?: boolean;
  pageType?: 'index' | 'article';
}

export default function Header({
  postsCount,
  lastUpdate,
  showBackButton = false,
  pageType = 'index',
}: HeaderProps) {
  return (
    <header className="border-b-2 border-green-400">
      <div className="container mx-auto px-0">
        <div className="border-l-2 border-r-2 border-green-400 mx-4">
          {showBackButton ? (
            <div className="px-6 py-4 border-green-400 flex justify-between items-center">
              <Link
                href="/"
                className="text-sm font-mono uppercase hover:bg-green-400 hover:text-black px-2 py-1 transition-colors"
              >
                ← INDEX
              </Link>
              <span className="text-xs font-mono">ARTICLE VIEW</span>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b-2 border-green-400">
                <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                  <h1 className="text-4xl font-bold tracking-tight">
                    <DecoBocoTitle text="DecoBoco Digital" />
                  </h1>
                </Link>
              </div>
              {/* デスクトップ表示 */}
              <div className="hidden md:flex border-green-400">
                <div className="px-6 py-2 border-r border-green-400">
                  <span className="text-xs font-mono">
                    ENTRIES: {postsCount}
                  </span>
                </div>
                <div className="px-6 py-2 flex-grow">
                  <span className="text-xs font-mono">
                    LAST UPDATE: {lastUpdate || 'N/A'}
                  </span>
                </div>
                <Link
                  href="/works"
                  className="px-4 py-2 border-l border-green-400 hover:bg-green-400 hover:text-black transition-colors flex items-center justify-center"
                  aria-label="Works"
                >
                  <span className="text-xs font-mono font-bold">WORKS</span>
                </Link>
                <Link
                  href="/writing"
                  className="px-4 py-2 border-l border-green-400 hover:bg-green-400 hover:text-black transition-colors flex items-center justify-center"
                  aria-label="Writing"
                >
                  <span className="text-xs font-mono font-bold">WRITING</span>
                </Link>
                <Link
                  href="/tags"
                  className="px-4 py-2 border-l border-green-400 hover:bg-green-400 hover:text-black transition-colors flex items-center justify-center"
                  aria-label="All Tags"
                >
                  <span className="text-xs font-mono font-bold">TAGS</span>
                </Link>
                <Link
                  href="/chat"
                  className="px-4 py-2 border-l border-green-400 hover:bg-green-400 hover:text-black transition-colors flex items-center justify-center"
                  aria-label="Chat with Creature"
                >
                  <span className="text-xs font-mono font-bold">▛ CHAT</span>
                </Link>
                <Link
                  href="/rss.xml"
                  className="px-4 py-2 border-l-2 border-green-400 bg-green-400 text-black hover:bg-green-600 transition-colors flex items-center justify-center"
                  aria-label="RSS Feed"
                >
                  <span className="text-xs font-mono font-bold">RSS</span>
                </Link>
              </div>
              
              {/* モバイル表示 */}
              <div className="md:hidden">
                <div className="flex border-green-400">
                  <div className="px-6 py-2 border-r border-green-400">
                    <span className="text-xs font-mono">
                      ENTRIES: {postsCount}
                    </span>
                  </div>
                  <div className="px-6 py-2 flex-grow">
                    <span className="text-xs font-mono">
                      LAST UPDATE: {lastUpdate || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="border-t-2 border-green-400 flex">
                  <Link
                    href="/works"
                    className="px-4 py-2 hover:bg-green-400 hover:text-black transition-colors flex items-center justify-center flex-1 border-r border-green-400"
                    aria-label="Works"
                  >
                    <span className="text-xs font-mono font-bold">WORKS</span>
                  </Link>
                  <Link
                    href="/writing"
                    className="px-4 py-2 hover:bg-green-400 hover:text-black transition-colors flex items-center justify-center flex-1 border-r border-green-400"
                    aria-label="Writing"
                  >
                    <span className="text-xs font-mono font-bold">WRITING</span>
                  </Link>
                  <Link
                    href="/tags"
                    className="px-4 py-2 hover:bg-green-400 hover:text-black transition-colors flex items-center justify-center flex-1 border-r border-green-400"
                    aria-label="All Tags"
                  >
                    <span className="text-xs font-mono font-bold">TAGS</span>
                  </Link>
                  <Link
                    href="/chat"
                    className="px-4 py-2 hover:bg-green-400 hover:text-black transition-colors flex items-center justify-center flex-1 border-r border-green-400"
                    aria-label="Chat with Creature"
                  >
                    <span className="text-xs font-mono font-bold">▛ CHAT</span>
                  </Link>
                  <Link
                    href="/rss.xml"
                    className="px-4 py-2 bg-green-400 text-black hover:bg-green-600 transition-colors flex items-center justify-center flex-1"
                    aria-label="RSS Feed"
                  >
                    <span className="text-xs font-mono font-bold">RSS</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
