import { createMemosClientFromEnv, type Memo } from '@/lib/memos'
import { MemoTimeline } from '@/components/memo-timeline'

// リクエスト時にレンダリングし、ビルド時に API を叩かない（env 未設定や
// インスタンス不達でビルドを壊さないため）。
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'memos | yukyu.net',
  description: '短い覚え書きのタイムライン',
  // 自分用のタイムラインなので検索エンジンには載せない
  robots: { index: false, follow: false }
}

// この一覧は公開 HTML として配信されるため、誤って非公開 memo を晒さないよう
// PUBLIC かつ NORMAL（非アーカイブ）だけを表示する。
function visibleMemos(memos: Memo[]): Memo[] {
  return memos.filter(m => m.visibility === 'PUBLIC' && m.state === 'NORMAL')
}

async function loadMemos(): Promise<{ memos: Memo[]; error: string | null }> {
  try {
    const client = createMemosClientFromEnv()
    const memos = await client.listMemos({ pageSize: 50 })
    return { memos: visibleMemos(memos), error: null }
  } catch (e) {
    return { memos: [], error: e instanceof Error ? e.message : String(e) }
  }
}

export default async function MemosPage() {
  const { memos, error } = await loadMemos()

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <h1 className="hero__title">
              <span className="hero__title-slash">/</span>memos
            </h1>
          </div>
          <div>
            <div className="hero__meta-num">{memos.length}</div>
            <div className="hero__meta-sub">memos</div>
          </div>
        </div>
      </section>

      {error ? (
        <p className="memos__empty">memo を読み込めませんでした。</p>
      ) : (
        <section className="memos">
          <MemoTimeline memos={memos} />
        </section>
      )}
    </div>
  )
}
