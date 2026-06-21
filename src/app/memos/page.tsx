import { Link } from 'next-view-transitions'
import {
  createMemosClientFromEnv,
  isPublicMemo,
  publicImages,
  type Attachment,
  type Memo
} from '@/lib/memos'
import { MemoTimeline } from '@/components/memo-timeline'
import { MemoAlbum } from '@/components/memo-album'

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
// isPublicMemo（PUBLIC かつ非アーカイブ）でフィルタする。
async function loadTimeline(): Promise<{ memos: Memo[]; error: boolean }> {
  try {
    const memos = await createMemosClientFromEnv().listMemos({ pageSize: 50 })
    return { memos: memos.filter(isPublicMemo), error: false }
  } catch {
    return { memos: [], error: true }
  }
}

async function loadAlbum(): Promise<{ images: Attachment[]; error: boolean }> {
  try {
    const client = createMemosClientFromEnv()
    // /attachments で全添付を取得しつつ、PUBLIC memo に紐づく画像だけに絞る。
    const [attachments, memos] = await Promise.all([
      client.listAttachments(),
      client.listMemos({ pageSize: 200 })
    ])
    return { images: publicImages(memos, attachments), error: false }
  } catch {
    return { images: [], error: true }
  }
}

const TABS: Array<{ key: 'timeline' | 'album'; label: string; href: string }> = [
  { key: 'timeline', label: 'timeline', href: '/memos' },
  { key: 'album', label: 'album', href: '/memos?mode=album' }
]

export default async function MemosPage({
  searchParams
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode } = await searchParams
  const isAlbum = mode === 'album'

  const timeline = isAlbum ? null : await loadTimeline()
  const album = isAlbum ? await loadAlbum() : null

  const count = isAlbum ? album!.images.length : timeline!.memos.length
  const error = isAlbum ? album!.error : timeline!.error

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
            <div className="hero__meta-num">{count}</div>
            <div className="hero__meta-sub">{isAlbum ? 'photos' : 'memos'}</div>
          </div>
        </div>
      </section>

      <nav className="memos__tabs" aria-label="表示切り替え">
        {TABS.map(tab => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`memos__tab${(isAlbum ? 'album' : 'timeline') === tab.key ? ' is-active' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {error ? (
        <p className="memos__empty">memo を読み込めませんでした。</p>
      ) : isAlbum ? (
        <section className="memos">
          <MemoAlbum images={album!.images} />
        </section>
      ) : (
        <section className="memos">
          <MemoTimeline memos={timeline!.memos} />
        </section>
      )}
    </div>
  )
}
