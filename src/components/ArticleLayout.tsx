import Link from 'next/link';
import MenuBar from './MenuBar';
import StatusBar from './StatusBar';
import ArticleActions from './ArticleActions';
import ArticleContent from './ArticleContent';
import AskClaudeButton from './AskClaudeButton';
import TableOfContents from './TableOfContents';
import { extractHeadings } from '@/lib/extract-headings';
import '@/styles/article.css';

interface ArticleLayoutProps {
  slug: string;
  title: string;
  date: string;
  tags: string[] | undefined;
  content: string;
  rawMarkdown: string;
}

export default function ArticleLayout({
  slug,
  title,
  date,
  tags,
  content,
  rawMarkdown,
}: ArticleLayoutProps) {
  const headings = extractHeadings(content);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* メニューバー */}
      <MenuBar />

      {/* 記事コンテンツ */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* 記事ヘッダー */}
        <header className="mb-8">
          <time className="text-sm font-mono text-green-600 uppercase">{date}</time>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mt-2">{title}</h1>
          {tags && tags.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="text-sm font-mono text-green-600 hover:text-green-400 transition-colors"
                >
                  [#{tag}]
                </Link>
              ))}
            </div>
          )}
          <AskClaudeButton slug={slug} rawMarkdown={rawMarkdown} />
        </header>

        {/* 目次 */}
        <TableOfContents headings={headings} />

        {/* 記事本文 */}
        <article className="mb-8">
          <ArticleContent content={content} charsPerSecond={150} />
        </article>

        {/* アクション */}
        <ArticleActions title={title} />

        {/* 戻るリンク */}
        <footer className="border-t border-green-800 mt-8 pt-6 flex justify-between items-center">
          <Link
            href="/"
            className="text-sm font-mono uppercase hover:text-green-300 transition-colors"
          >
            &lt;- RETURN TO INDEX
          </Link>
          <div className="text-sm font-mono text-green-600">END OF FILE</div>
        </footer>
      </main>

      {/* ステータスバー */}
      <StatusBar status="VIEWING ARTICLE" />
    </div>
  );
}
