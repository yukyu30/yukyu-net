import {
  createMemosClientFromEnv,
  publicMemoImages,
  type Attachment
} from '@/lib/memos'
import { MemoAlbum } from '@/components/memo-album'
import { MemoTabs } from '@/components/memo-tabs'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'album | yukyu.net',
  description: 'memo の画像アルバム',
  robots: { index: false, follow: false }
}

// PUBLIC memo に埋め込まれた画像から組み立てる（/attachments はトークン
// 所有者にスコープされ、別ユーザのトークンでは取得できないため使わない）。
async function loadAlbum(): Promise<{ images: Attachment[]; error: boolean }> {
  try {
    const memos = await createMemosClientFromEnv().listMemos({ pageSize: 200 })
    return { images: publicMemoImages(memos), error: false }
  } catch {
    return { images: [], error: true }
  }
}

export default async function MemosAlbumPage() {
  const { images, error } = await loadAlbum()

  return (
    <>
      <MemoTabs active="album" />
      {error ? (
        <p className="memos__empty">memo を読み込めませんでした。</p>
      ) : (
        <MemoAlbum images={images} />
      )}
    </>
  )
}
