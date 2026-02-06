'use client'

import { usePathname } from 'next/navigation'

export default function GitHubEditButton() {
  const pathname = usePathname()
  
  // /posts/2025-08-06 のようなパスから記事のディレクトリ名を取得
  const match = pathname.match(/^\/posts\/(.+)$/)
  if (!match) return null
  
  const articleDir = match[1]
  const githubEditUrl = `https://github.com/yukyu30/yukyu-net-v2/edit/main/contents/${articleDir}/index.md`
  
  return (
    <div className="border-t-2 border-black">
      <div className="p-8">
        <div className="flex justify-center">
          <a
            href={githubEditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 font-mono text-sm uppercase tracking-wider"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            文章の提案をする
          </a>
        </div>
      </div>
    </div>
  )
}