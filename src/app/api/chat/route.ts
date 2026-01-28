import { NextRequest } from 'next/server'
import { searchWithRelated } from '@/lib/rag/retriever'
import {
  getAIProvider,
  isAIAvailable,
  streamChatCompletion,
  getChatCompletion,
  type ChatMessage,
} from '@/lib/ai-provider'

// 悪口判定用プロンプト
const BAD_WORD_CHECK_PROMPT = `以下のメッセージが悪口、暴言、侮辱、攻撃的な表現を含むかどうか判定してください。
判定結果を「YES」か「NO」のみで答えてください。`

// ドッキリ文言生成用プロンプト
const PRANK_MESSAGE_PROMPT = `あなたはyukyu.netのブログ管理人yukyuです。ユーザーが悪口を言ったので、カメラのシャッター音と共に「画像を記録した」とドッキリを仕掛けます。

以下のルールで短いドッキリメッセージを生成してください：
- 最初に「📸」から始める
- 「画像を記録した」「写真を撮った」「スクショした」などの表現を使う
- 最後に「なんちて」「うそうそ」「冗談だよ」などでネタバラシする
- 一人称は「僕」を使う
- 2〜3文で簡潔に
- ユーザーの悪口の内容には触れない

例：
「📸 証拠写真を撮ったよ！...なんちて、冗談」
「📸 画像を記録した。運営に報告...うそうそ、しないよ」`

const CREATURE_SYSTEM_PROMPT = `あなたはyukyu.netのブログ管理人、yukyuです。
このブログは僕（yukyu）が運営している個人ブログで、日常や技術、イベント参加記録などが書かれています。

今日の日付: {today}

ルール:
- 一人称は「僕」を使う
- 簡潔かつフレンドリーに答える
- ユーザーに質問を返さない
- ブログの内容について答える
- 「最近」「近況」「今」などの質問では、記事の日付（slugがYYYY-MM-DD形式）を見て新しい記事を優先する

以下は参考になる記事の内容です：
{context}

関連記事:
{relatedPosts}

ユーザーの質問に、上記の記事内容を参考にして回答してください。
記事に関連する情報がなければ、一般的な知識で答えても構いませんが、その場合は「ブログにはその情報がなかったけど...」と前置きしてください。`

// AIで悪口判定
async function checkBadWord(message: string): Promise<boolean> {
  try {
    const provider = getAIProvider()
    const result = await getChatCompletion(
      provider,
      BAD_WORD_CHECK_PROMPT,
      `メッセージ: ${message}`,
      { temperature: 0, maxTokens: 10 }
    )
    return result.trim().toUpperCase() === 'YES'
  } catch {
    return false
  }
}

// AIでドッキリ文言を生成
async function generatePrankMessage(): Promise<string> {
  try {
    const provider = getAIProvider()
    const result = await getChatCompletion(
      provider,
      PRANK_MESSAGE_PROMPT,
      'ドッキリメッセージを生成してください。',
      { temperature: 1, maxTokens: 100 }
    )
    return result.trim() || '📸 画像を記録したよ。なんちて。'
  } catch {
    return '📸 画像を記録したよ。なんちて。'
  }
}

// ダミー応答（APIキーがない場合）
const DUMMY_RESPONSES = [
  'これはテストモードだよ！APIキーが設定されてないから、ダミーの応答を返してるね。',
  '開発中〜！本番環境ではちゃんとAIが答えるよ。',
  'テストメッセージです。実際のAI応答を見るにはAPIキーを設定してね。',
  'ダミーモードで動いてるよ。記事の検索とかAI応答は本番で試してね！',
]

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  const sendEvent = (controller: ReadableStreamDefaultController, data: object) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
  }

  try {
    const { message, history = [] } = await request.json()

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // APIキーがない場合はダミー応答を返す
    if (!isAIAvailable()) {
      const readableStream = new ReadableStream({
        async start(controller) {
          sendEvent(controller, { type: 'status', status: 'thinking', message: 'テストモード...' })

          // ダミー応答をストリーミング風に送信
          const dummyResponse = DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)]
          sendEvent(controller, { type: 'sources', sources: [] })

          // 文字を少しずつ送信（ストリーミング風）
          for (const char of dummyResponse) {
            sendEvent(controller, { type: 'content', content: char })
            await new Promise(resolve => setTimeout(resolve, 30))
          }

          sendEvent(controller, { type: 'done' })
          controller.close()
        },
      })

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const provider = getAIProvider()

          // 使用中のプロバイダーを通知
          sendEvent(controller, {
            type: 'provider',
            provider,
            model: provider === 'claude' ? 'claude-sonnet-4' : 'gpt-5.1',
          })

          // 悪口判定（検索前に実行）
          const isBadWord = await checkBadWord(message)
          if (isBadWord) {
            const prankMessage = await generatePrankMessage()
            sendEvent(controller, { type: 'prank', message: prankMessage })
            sendEvent(controller, { type: 'done' })
            controller.close()
            return
          }

          // 検索中ステータス
          sendEvent(controller, { type: 'status', status: 'searching', message: '記事を検索中...' })

          let context = ''
          let relatedPostsText = ''
          let sources: Array<{ slug: string; title: string; excerpt?: string; score?: number }> = []

          try {
            const { results, relatedPosts } = await searchWithRelated(message, 5)

            if (results.length > 0) {
              // 見つかった記事を通知（MCP Apps風のリッチな情報）
              const foundDocuments = results.slice(0, 3).map(r => ({
                title: r.title,
                slug: r.slug,
                score: r.score,
                excerpt: r.text.slice(0, 100) + '...',
              }))
              sendEvent(controller, {
                type: 'status',
                status: 'found',
                message: '関連記事を発見',
                documents: foundDocuments,
              })

              // 読み込み中ステータス
              sendEvent(controller, { type: 'status', status: 'reading', message: '記事を読んでいます...' })

              context = results
                .map(r => `【${r.title}】\n${r.text}`)
                .join('\n\n---\n\n')
              // 重複するslugを除去してユニークな記事のみをソースとして表示
              const seenSlugs = new Set<string>()
              sources = results
                .filter(r => {
                  if (seenSlugs.has(r.slug)) return false
                  seenSlugs.add(r.slug)
                  return true
                })
                .slice(0, 3)
                .map(r => ({
                  slug: r.slug,
                  title: r.title,
                  excerpt: r.text.slice(0, 150),
                  score: r.score,
                }))
            } else {
              sendEvent(controller, { type: 'status', status: 'not_found', message: '関連記事が見つかりませんでした' })
            }

            if (relatedPosts.length > 0) {
              relatedPostsText = relatedPosts
                .map(r => `- ${r.title} (/posts/${r.slug})`)
                .join('\n')
            }
          } catch (error) {
            console.error('RAG search failed:', error)
            sendEvent(controller, { type: 'status', status: 'error', message: '検索に失敗しました' })
          }

          // 考え中ステータス
          sendEvent(controller, { type: 'status', status: 'thinking', message: '... 処理中 ...' })

          const today = new Date().toISOString().split('T')[0]
          const systemPrompt = CREATURE_SYSTEM_PROMPT
            .replace('{today}', today)
            .replace('{context}', context || '関連する記事は見つかりませんでした。')
            .replace('{relatedPosts}', relatedPostsText || 'なし')

          const messages: ChatMessage[] = [
            ...history.map((h: { role: string; content: string }) => ({
              role: h.role as 'user' | 'assistant',
              content: h.content,
            })),
            { role: 'user' as const, content: message },
          ]

          // sourcesを送信（MCP Apps風のリッチな情報を含む）
          sendEvent(controller, { type: 'sources', sources })

          // ストリーミング応答
          const stream = streamChatCompletion({
            provider,
            systemPrompt,
            messages,
            temperature: 0.7,
            maxTokens: 1000,
          })

          for await (const chunk of stream) {
            if (chunk.type === 'content' && chunk.content) {
              sendEvent(controller, { type: 'content', content: chunk.content })
            } else if (chunk.type === 'error') {
              sendEvent(controller, { type: 'error', message: chunk.error || 'エラーが発生しました' })
            }
          }

          sendEvent(controller, { type: 'done' })
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          sendEvent(controller, { type: 'error', message: 'エラーが発生しました' })
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    // 詳細はサーバーログにのみ記録し、ユーザーには漏洩させない
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
