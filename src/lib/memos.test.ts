import { describe, it, expect, vi } from 'vitest'
import { createMemosClient } from './memos'

// Memos v1 API（grpc-gateway / protojson）の実レスポンス形状に合わせたフィクスチャ。
// キーは camelCase、name は "memos/{uid}"、画像は attachments[].externalLink。
function memoFixture(overrides: Record<string, unknown> = {}) {
  return {
    name: 'memos/nchFRjYGryKD8KdiXJnLZT',
    state: 'NORMAL',
    creator: 'users/ugo',
    createTime: '2026-06-21T12:59:12Z',
    updateTime: '2026-06-21T12:59:12Z',
    content: 'test',
    visibility: 'PUBLIC',
    tags: [],
    pinned: false,
    attachments: [],
    snippet: 'test',
    ...overrides
  }
}

function jsonResponse(
  body: unknown,
  init: { ok?: boolean; status?: number; statusText?: string } = {}
): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? '',
    json: async () => body
  } as unknown as Response
}

function clientWith(response: Response) {
  const fetchFn = vi.fn<typeof fetch>(async () => response)
  const client = createMemosClient({
    apiUrl: 'https://memos.example.com/api/v1',
    apiToken: 'secret-token',
    fetchFn
  })
  return { client, fetchFn }
}

describe('createMemosClient.listMemos', () => {
  it('指定した pageSize で memos エンドポイントを Bearer トークン付きで呼ぶ', async () => {
    const { client, fetchFn } = clientWith(jsonResponse({ memos: [] }))

    await client.listMemos({ pageSize: 5 })

    expect(fetchFn).toHaveBeenCalledTimes(1)
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe('https://memos.example.com/api/v1/memos?pageSize=5')
    expect(init?.headers).toMatchObject({
      Authorization: 'Bearer secret-token'
    })
  })

  it('pageSize 未指定ならデフォルト値を使う', async () => {
    const { client, fetchFn } = clientWith(jsonResponse({ memos: [] }))

    await client.listMemos()

    const [url] = fetchFn.mock.calls[0]
    expect(url).toMatch(/pageSize=\d+$/)
  })

  it('name "memos/{uid}" から id を抽出する', async () => {
    const { client } = clientWith(
      jsonResponse({ memos: [memoFixture({ name: 'memos/abc123' })] })
    )

    const memos = await client.listMemos()

    expect(memos[0].id).toBe('abc123')
    expect(memos[0].name).toBe('memos/abc123')
  })

  it('attachments を正規化し画像かどうかを判定する', async () => {
    const { client } = clientWith(
      jsonResponse({
        memos: [
          memoFixture({
            attachments: [
              {
                name: 'attachments/x',
                filename: 'cover.png',
                externalLink: 'https://cdn.example.com/cover.png',
                type: 'image/png',
                content: ''
              },
              {
                name: 'attachments/y',
                filename: 'spec.pdf',
                externalLink: 'https://cdn.example.com/spec.pdf',
                type: 'application/pdf',
                content: ''
              }
            ]
          })
        ]
      })
    )

    const [memo] = await client.listMemos()

    expect(memo.attachments).toHaveLength(2)
    expect(memo.attachments[0]).toMatchObject({
      filename: 'cover.png',
      externalLink: 'https://cdn.example.com/cover.png',
      type: 'image/png',
      isImage: true
    })
    expect(memo.attachments[1].isImage).toBe(false)
  })

  it('memos が空配列なら空配列を返す', async () => {
    const { client } = clientWith(jsonResponse({ memos: [], nextPageToken: '' }))

    expect(await client.listMemos()).toEqual([])
  })

  it('memos キーが欠落していても空配列を返す', async () => {
    const { client } = clientWith(jsonResponse({}))

    expect(await client.listMemos()).toEqual([])
  })

  it('HTTP が非 2xx ならステータス付きでエラーを投げる', async () => {
    const { client } = clientWith(
      jsonResponse({ message: 'unauthorized' }, { ok: false, status: 401, statusText: 'Unauthorized' })
    )

    await expect(client.listMemos()).rejects.toThrow(/401/)
  })

  it('不正なレコードは握りつぶし、正常なレコードだけ返す', async () => {
    const { client } = clientWith(
      jsonResponse({
        memos: [
          { foo: 'bar' }, // name が無い不正レコード
          memoFixture({ name: 'memos/ok' })
        ]
      })
    )

    const memos = await client.listMemos()

    expect(memos).toHaveLength(1)
    expect(memos[0].id).toBe('ok')
  })

  it('createTime の降順で並べ替える', async () => {
    const { client } = clientWith(
      jsonResponse({
        memos: [
          memoFixture({ name: 'memos/old', createTime: '2026-01-01T00:00:00Z' }),
          memoFixture({ name: 'memos/new', createTime: '2026-06-01T00:00:00Z' }),
          memoFixture({ name: 'memos/mid', createTime: '2026-03-01T00:00:00Z' })
        ]
      })
    )

    const ids = (await client.listMemos()).map(m => m.id)

    expect(ids).toEqual(['new', 'mid', 'old'])
  })
})
