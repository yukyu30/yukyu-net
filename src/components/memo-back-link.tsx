'use client'

import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

// 「← memos」リンク。ブラウザ履歴があれば戻るのを優先し、
// 履歴が無い（直接アクセスや新規タブで開いた）場合は /memos に遷移する。
// 実体は <a href="/memos"> なので JS 無効・修飾キークリックでも壊れない。
export function MemoBackLink() {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // 新規タブで開く等の修飾キークリックは通常のリンク遷移に任せる
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return
    }
    e.preventDefault()
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/memos')
    }
  }

  return (
    <a href="/memos" className="memo-detail__back" onClick={handleClick}>
      ← memos
    </a>
  )
}
