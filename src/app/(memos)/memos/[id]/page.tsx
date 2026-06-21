import { cache } from 'react'
import { notFound } from 'next/navigation'
import { createMemosClientFromEnv, isPublicMemo, type Memo } from '@/lib/memos'
import { MemoDetail } from '@/components/memo-detail'
import { MemoBackLink } from '@/components/memo-back-link'

export const dynamic = 'force-dynamic'

// generateMetadata と本体で二重取得しないよう、リクエスト内でメモ化する。
const loadMemo = cache(async (id: string): Promise<Memo | null> => {
  try {
    const memo = await createMemosClientFromEnv().getMemo(id)
    if (!memo) return null
    // 公開ページなので PUBLIC / NORMAL 以外は存在しない扱いにする。
    if (!isPublicMemo(memo)) return null
    return memo
  } catch {
    return null
  }
})

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const memo = await loadMemo(id)
  const text = memo?.snippet || memo?.content || 'memo'
  return {
    title: 'memo | yukyu.net',
    description: text.slice(0, 80),
    robots: { index: false, follow: false }
  }
}

export default async function MemoDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const memo = await loadMemo(id)
  if (!memo) notFound()

  return (
    <>
      <MemoBackLink />
      <MemoDetail memo={memo} />
    </>
  )
}
