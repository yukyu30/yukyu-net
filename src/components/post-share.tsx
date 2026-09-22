'use client'

import { useEffect, useRef, useState } from 'react'
import { copyText } from '@/lib/clipboard'

interface Props {
  url: string
  title: string
}

export function PostShare({ url, title }: Props) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const xUrl =
    'https://x.com/intent/tweet?text=' +
    encodeURIComponent(title) +
    '&url=' +
    encodeURIComponent(url)

  const onCopy = async () => {
    if (timer.current) clearTimeout(timer.current)
    const success = await copyText(url)
    setCopied(success)
    setCopyFailed(!success)
    if (success) {
      timer.current = setTimeout(() => setCopied(false), 1500)
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
      <span role="status" className="post-share__status">
        {copied && 'リンクをコピーしました。'}
        {copyFailed && '自動コピーできませんでした。下のURLを選択してコピーしてください。'}
      </span>
      {copyFailed && (
        <input
          className="post-share__url"
          aria-label="記事のURL"
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
          onClick={(event) => event.currentTarget.select()}
        />
      )}
    </div>
  )
}
