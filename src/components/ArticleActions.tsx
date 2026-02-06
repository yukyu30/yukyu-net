'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface ArticleActionsProps {
  title: string;
}

export default function ArticleActions({ title }: ArticleActionsProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const match = pathname.match(/^\/posts\/(.+)$/);
  const articleDir = match ? match[1] : null;
  const markdownUrl = articleDir ? `/contents/${articleDir}/index.md` : null;
  const githubEditUrl = articleDir
    ? `https://github.com/yukyu30/yukyu-net-v2/edit/main/contents/${articleDir}/index.md`
    : null;

  const shareOnX = () => {
    const text = encodeURIComponent(title);
    const url = encodeURIComponent(currentUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert('URL COPIED TO CLIPBOARD');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 py-4">
      {/* View Markdown button */}
      {markdownUrl && (
        <a
          href={markdownUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-mono text-green-600 hover:text-green-400 transition-colors"
        >
          [VIEW MARKDOWN]
        </a>
      )}

      {/* GitHub edit button */}
      {githubEditUrl && (
        <a
          href={githubEditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-mono text-green-600 hover:text-green-400 transition-colors"
        >
          [EDIT ON GITHUB]
        </a>
      )}

      {/* X button */}
      <button
        onClick={shareOnX}
        className="text-sm font-mono text-green-600 hover:text-green-400 transition-colors"
        aria-label="Share on X"
      >
        [SHARE ON X]
      </button>

      {/* Link button */}
      <button
        onClick={copyToClipboard}
        className="text-sm font-mono text-green-600 hover:text-green-400 transition-colors"
        aria-label="Copy link"
      >
        [COPY LINK]
      </button>
    </div>
  );
}
