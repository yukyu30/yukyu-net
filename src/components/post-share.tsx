'use client'

import { useState } from 'react'

interface Props {
  url: string
  title: string
}

export function PostShare({ url, title }: Props) {
  const [copied, setCopied] = useState(false)

  const xUrl =
    'https://x.com/intent/post?text=' +
    encodeURIComponent(title) +
    '&url=' +
    encodeURIComponent(url)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // noop
    }
  }

  return (
    <div className="post-share">
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="post-share__btn"
      >
        Xでシェア
      </a>
      <button type="button" onClick={onCopy} className="post-share__btn">
        {copied ? 'コピーしました' : 'リンクをコピー'}
      </button>
    </div>
  )
}
