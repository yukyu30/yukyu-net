import { z } from 'zod'

// Memos v1 API（https://usememos.com/docs/api/latest）のクライアント。
// レスポンスは grpc-gateway / protojson 由来で JSON キーは camelCase。
// 外部データなのでスキーマは寛容にし、壊れた 1 件で一覧全体が落ちないよう
// レコード単位で safeParse する。

const DEFAULT_PAGE_SIZE = 30

const RawAttachmentSchema = z.object({
  name: z.string().default(''),
  filename: z.string().default(''),
  externalLink: z.string().default(''),
  type: z.string().default(''),
  size: z.coerce.number().catch(0).default(0),
  memo: z.string().default(''),
  createTime: z.string().default('')
})

const RawMemoSchema = z.object({
  name: z.string(),
  content: z.string().default(''),
  snippet: z.string().default(''),
  createTime: z.string().default(''),
  updateTime: z.string().default(''),
  pinned: z.boolean().default(false),
  visibility: z.string().default('PRIVATE'),
  state: z.string().default('NORMAL'),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.unknown()).default([])
})

const ListMemosResponseSchema = z.object({
  memos: z.array(z.unknown()).default([]),
  nextPageToken: z.string().default('')
})

export interface Attachment {
  /** name から取り出した uid（例: "fpPGZx3i2QHEKs4SJNoYHb"） */
  id: string
  /** API のリソース名（例: "attachments/fpPGZx3i2QHEKs4SJNoYHb"） */
  name: string
  filename: string
  externalLink: string
  type: string
  /** バイト数（API は文字列で返すので数値化） */
  size: number
  isImage: boolean
  /** 紐づく memo の uid（例: "nchFRjYGryKD8KdiXJnLZT"）。未紐付けなら "" */
  memoId: string
  createTime: string
}

export interface Memo {
  /** name から取り出した uid（例: "nchFRjYGryKD8KdiXJnLZT"） */
  id: string
  /** API のリソース名（例: "memos/nchFRjYGryKD8KdiXJnLZT"） */
  name: string
  content: string
  snippet: string
  createTime: string
  updateTime: string
  pinned: boolean
  visibility: string
  state: string
  tags: string[]
  attachments: Attachment[]
}

export interface MemosClientConfig {
  apiUrl: string
  apiToken: string
  /** テスト用にネットワークを差し替えるための注入口。省略時はグローバル fetch。 */
  fetchFn?: typeof fetch
}

export interface ListMemosOptions {
  pageSize?: number
}

export interface MemosClient {
  listMemos(options?: ListMemosOptions): Promise<Memo[]>
  getMemo(id: string): Promise<Memo | null>
}

/** "memos/{uid}" や "attachments/{uid}" から uid 部分を取り出す。 */
function resourceId(name: string): string {
  const i = name.indexOf('/')
  return i === -1 ? name : name.slice(i + 1)
}

function toAttachment(raw: z.infer<typeof RawAttachmentSchema>): Attachment {
  return {
    id: resourceId(raw.name),
    name: raw.name,
    filename: raw.filename,
    externalLink: raw.externalLink,
    type: raw.type,
    size: raw.size,
    isImage: raw.type.startsWith('image/'),
    memoId: raw.memo ? resourceId(raw.memo) : '',
    createTime: raw.createTime
  }
}

function parseAttachments(rawList: unknown[]): Attachment[] {
  const out: Attachment[] = []
  for (const a of rawList) {
    const parsed = RawAttachmentSchema.safeParse(a)
    if (parsed.success) out.push(toAttachment(parsed.data))
  }
  return out
}

function toMemo(raw: z.infer<typeof RawMemoSchema>): Memo {
  return {
    id: resourceId(raw.name),
    name: raw.name,
    content: raw.content,
    snippet: raw.snippet,
    createTime: raw.createTime,
    updateTime: raw.updateTime,
    pinned: raw.pinned,
    visibility: raw.visibility,
    state: raw.state,
    tags: raw.tags,
    attachments: parseAttachments(raw.attachments)
  }
}

function parseMemos(json: unknown): Memo[] {
  const envelope = ListMemosResponseSchema.safeParse(json)
  const rawMemos = envelope.success ? envelope.data.memos : []
  const memos: Memo[] = []
  for (const raw of rawMemos) {
    const parsed = RawMemoSchema.safeParse(raw)
    if (parsed.success) memos.push(toMemo(parsed.data))
  }
  return memos.sort((a, b) => b.createTime.localeCompare(a.createTime))
}

export function createMemosClient(config: MemosClientConfig): MemosClient {
  const { apiUrl, apiToken, fetchFn = fetch } = config
  const base = apiUrl.replace(/\/+$/, '')
  const authHeaders = { Authorization: `Bearer ${apiToken}` }

  function get(path: string): Promise<Response> {
    return fetchFn(`${base}${path}`, { headers: authHeaders })
  }

  function failed(res: Response): Error {
    return new Error(
      `Memos API request failed: ${res.status} ${res.statusText}`.trim()
    )
  }

  return {
    async listMemos(options = {}) {
      const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
      const res = await get(`/memos?pageSize=${pageSize}`)
      if (!res.ok) throw failed(res)
      return parseMemos(await res.json())
    },

    async getMemo(id) {
      const res = await get(`/memos/${encodeURIComponent(id)}`)
      if (res.status === 404) return null
      if (!res.ok) throw failed(res)
      const parsed = RawMemoSchema.safeParse(await res.json())
      return parsed.success ? toMemo(parsed.data) : null
    }
  }
}

/**
 * 公開ページに出してよい memo か（PUBLIC かつ非アーカイブ）。
 * 公開 HTML として配信する一覧・詳細・アルバムの単一フィルタ。
 */
export function isPublicMemo(memo: Pick<Memo, 'visibility' | 'state'>): boolean {
  return memo.visibility === 'PUBLIC' && memo.state === 'NORMAL'
}

/**
 * PUBLIC な memo に「埋め込まれた」画像添付を返す（アルバム用）。
 * ListAttachments(/attachments) はトークン所有者にスコープされ、別ユーザの
 * トークンでは空になるため、memo 一覧に埋め込まれた添付から組み立てる。
 * 非公開（PRIVATE/PROTECTED）・アーカイブ・非画像は fail-closed で除外する。
 * 添付に memoId が無い場合は親 memo の id で補完する。
 */
export function publicMemoImages(memos: Memo[]): Attachment[] {
  const out: Attachment[] = []
  for (const memo of memos) {
    if (!isPublicMemo(memo)) continue
    for (const a of memo.attachments) {
      if (!a.isImage) continue
      out.push(a.memoId ? a : { ...a, memoId: memo.id })
    }
  }
  return out
}

/**
 * 環境変数（MEMOS_API_URL / MEMOS_API_TOKEN）から設定済みクライアントを作る。
 * サーバー専用。トークンは公開されない（NEXT_PUBLIC_ ではない）。
 */
export function createMemosClientFromEnv(): MemosClient {
  const apiUrl = process.env.MEMOS_API_URL
  const apiToken = process.env.MEMOS_API_TOKEN
  if (!apiUrl || !apiToken) {
    throw new Error(
      'MEMOS_API_URL と MEMOS_API_TOKEN を環境変数に設定してください'
    )
  }
  return createMemosClient({ apiUrl, apiToken })
}
