import { createMemosClientFromEnv, isPublicMemo, type Memo } from '@/lib/memos'
import { MemoTimeline } from '@/components/memo-timeline'
import { MemoTabs } from '@/components/memo-tabs'

// リクエスト時にレンダリングし、ビルド時に API を叩かない（env 未設定や
// インスタンス不達でビルドを壊さないため）。
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'memos | yukyu.net',
  description: '短い覚え書きのタイムライン',
  // 自分用のタイムラインなので検索エンジンには載せない
  robots: { index: false, follow: false }
}

// 公開 HTML として配信されるため、誤って非公開 memo を晒さないよう
// isPublicMemo（PUBLIC かつ非アーカイブ）でフィルタする。
async function loadTimeline(): Promise<{ memos: Memo[]; error: boolean }> {
  try {
    const memos = await createMemosClientFromEnv().listMemos({ pageSize: 50 })
    return { memos: memos.filter(isPublicMemo), error: false }
  } catch {
    return { memos: [], error: true }
  }
}

export default async function MemosPage() {
  const { memos, error } = await loadTimeline()

  return (
    <>
      <MemoTabs active="timeline" />
      {error ? (
        <p className="memos__empty">memo を読み込めませんでした。</p>
      ) : (
        <MemoTimeline memos={memos} />
      )}
    </>
  )
}
