import { z } from 'zod'

// Memos v1 API（https://usememos.com/docs/api/latest）のクライアント。
// レスポンスは grpc-gateway / protojson 由来で JSON キーは camelCase。
// 外部データなのでスキーマは寛容にし、壊れた 1 件で一覧全体が落ちないよう
// memo 単位で safeParse する。

const DEFAULT_PAGE_SIZE = 30

const RawAttachmentSchema = z.object({
  filename: z.string().default(''),
  externalLink: z.string().default(''),
  type: z.string().default('')
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

export interface MemoAttachment {
  filename: string
  externalLink: string
  type: string
  isImage: boolean
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
  attachments: MemoAttachment[]
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
}

function attachmentId(name: string): string {
  const i = name.indexOf('/')
  return i === -1 ? name : name.slice(i + 1)
}

function toAttachment(raw: z.infer<typeof RawAttachmentSchema>): MemoAttachment {
  return {
    filename: raw.filename,
    externalLink: raw.externalLink,
    type: raw.type,
    isImage: raw.type.startsWith('image/')
  }
}

function toMemo(raw: z.infer<typeof RawMemoSchema>): Memo {
  const attachments: MemoAttachment[] = []
  for (const a of raw.attachments) {
    const parsed = RawAttachmentSchema.safeParse(a)
    if (parsed.success) attachments.push(toAttachment(parsed.data))
  }
  return {
    id: attachmentId(raw.name),
    name: raw.name,
    content: raw.content,
    snippet: raw.snippet,
    createTime: raw.createTime,
    updateTime: raw.updateTime,
    pinned: raw.pinned,
    visibility: raw.visibility,
    state: raw.state,
    tags: raw.tags,
    attachments
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

  return {
    async listMemos(options = {}) {
      const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
      const url = `${base}/memos?pageSize=${pageSize}`
      const res = await fetchFn(url, {
        headers: { Authorization: `Bearer ${apiToken}` }
      })
      if (!res.ok) {
        throw new Error(
          `Memos API request failed: ${res.status} ${res.statusText}`.trim()
        )
      }
      return parseMemos(await res.json())
    }
  }
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
