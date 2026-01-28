'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import PNGTuberPlayer from './PNGTuberPlayer'
import { SourcesList } from './chat/SourceCard'
import { ChatStatus } from './chat/ChatStatus'
import { ProviderBadge } from './chat/ProviderBadge'

interface Source {
  slug: string
  title: string
  excerpt?: string
  score?: number
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

interface DocumentInfo {
  title: string
  slug: string
  score?: number
  excerpt?: string
}

interface StatusInfo {
  status: string
  message: string
  documents?: DocumentInfo[] | string[]
}

interface ProviderInfo {
  provider: 'openai' | 'claude'
  model?: string
}

const HISTORY_LIMIT = 6
const PROSE_CLASSES = "prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_ul]:my-2 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:my-0.5 [&_li]:text-green-400 [&_h1]:text-green-300 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-green-300 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-green-300 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_strong]:text-green-300 [&_strong]:font-bold [&_em]:text-green-500 [&_code]:text-green-300 [&_code]:bg-green-900/30 [&_code]:px-1 [&_code]:rounded [&_a]:text-green-400 [&_a]:underline"

interface CreatureChatProps {
  initialQuery?: string
}

export default function CreatureChat({ initialQuery }: CreatureChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingSources, setStreamingSources] = useState<Source[]>([])
  const [currentStatus, setCurrentStatus] = useState<StatusInfo | null>(null)
  const [currentProvider, setCurrentProvider] = useState<ProviderInfo | null>(null)
  const [isTalking, setIsTalking] = useState(false)
  const [showSourcesPanel, setShowSourcesPanel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialQuerySent = useRef(false)
  const messagesRef = useRef<Message[]>([])
  const isLoadingRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [showFlash, setShowFlash] = useState(false)

  // フラッシュと音声の演出フック
  const playPrankEffect = useCallback(() => {
    // カメラシャッター音を再生
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/camera-shutter.mp3')
    }
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})

    // フラッシュ演出
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 150)
  }, [])

  // ストリーミング中かどうかでisTalkingを更新
  useEffect(() => {
    setIsTalking(!!streamingContent)
  }, [streamingContent])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent, currentStatus])

  // messagesRef を同期
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const sendMessage = useCallback(async (userMessage: string, options?: { onPrank?: () => void }) => {
    if (!userMessage.trim() || isLoadingRef.current) return

    isLoadingRef.current = true
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    setStreamingContent('')
    setStreamingSources([])
    setCurrentStatus(null)
    setCurrentProvider(null)
    setShowSourcesPanel(false)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messagesRef.current.slice(-HISTORY_LIMIT),
        }),
      })

      if (!response.ok) throw new Error('Chat failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let accumulatedContent = ''
      let sources: Source[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'provider') {
                // AIプロバイダー情報を設定
                setCurrentProvider({
                  provider: data.provider,
                  model: data.model,
                })
              } else if (data.type === 'prank') {
                // AIが悪口を検出したのでドッキリ発動
                options?.onPrank?.()
                // prankメッセージをcontentとして扱う
                accumulatedContent = data.message
              } else if (data.type === 'status') {
                setCurrentStatus({
                  status: data.status,
                  message: data.message,
                  documents: data.documents,
                })
              } else if (data.type === 'sources') {
                sources = data.sources
                setStreamingSources(data.sources)
                setCurrentStatus(null) // ステータス表示を消す
                if (data.sources.length > 0) {
                  setShowSourcesPanel(true)
                }
              } else if (data.type === 'content') {
                accumulatedContent += data.content
                setStreamingContent(accumulatedContent)
              } else if (data.type === 'done') {
                // コンテンツがある場合のみメッセージを追加
                if (accumulatedContent) {
                  setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: accumulatedContent, sources },
                  ])
                }
                setStreamingContent('')
                setStreamingSources([])
                setCurrentStatus(null)
              }
            } catch {
              // JSON parse error, skip
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'ごめん、うまく答えられなかった...もう一度聞いてみて！' },
      ])
      setStreamingContent('')
      setStreamingSources([])
      setCurrentStatus(null)
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [])

  // 初期クエリがある場合は自動送信
  useEffect(() => {
    if (initialQuery && !initialQuerySent.current) {
      initialQuerySent.current = true
      sendMessage(`「${initialQuery}」について教えて`, { onPrank: playPrankEffect })
    }
  }, [initialQuery, sendMessage, playPrankEffect])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const userMessage = input.trim()
    setInput('')
    inputRef.current?.focus()
    sendMessage(userMessage, { onPrank: playPrankEffect })
  }

  // 最新のユーザーメッセージとアシスタントメッセージを取得
  const latestUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0]
  const latestAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0]

  // 表示するソース（ストリーミング中または最新のアシスタントメッセージから）
  const displaySources = streamingSources.length > 0
    ? streamingSources
    : latestAssistantMessage?.sources || []

  return (
    <div className="relative flex-1 overflow-hidden bg-black">
      {/* フラッシュ演出 */}
      {showFlash && (
        <div className="fixed inset-0 bg-white z-[100] pointer-events-none" />
      )}

      {/* 背景：PNGTuberをフル表示 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <PNGTuberPlayer isTalking={isTalking} className="w-full h-full" />
      </div>

      {/* プロバイダーバッジ（右上） */}
      {currentProvider && (
        <div className="absolute top-3 right-3 z-20">
          <ProviderBadge provider={currentProvider.provider} model={currentProvider.model} />
        </div>
      )}

      {/* MCP Apps風のソースパネル（左サイド） */}
      {showSourcesPanel && displaySources.length > 0 && (
        <div className="absolute top-3 left-3 z-20 w-64 max-h-[40vh] overflow-y-auto bg-black/80 backdrop-blur-sm border border-green-800/50 rounded-lg p-3 hidden md:block">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-green-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              参考記事
            </h3>
            <button
              onClick={() => setShowSourcesPanel(false)}
              className="text-green-700 hover:text-green-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SourcesList sources={displaySources} />
        </div>
      )}

      {/* オーバーレイ：テキストボックス（下部に固定） */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-black/80 border-t-2 border-green-500 backdrop-blur-sm">
          {/* 会話表示エリア */}
          <div className="p-3 md:p-4 min-h-[80px] max-h-[140px] md:max-h-[200px] overflow-y-auto space-y-2">
            {/* 初期メッセージ */}
            {messages.length === 0 && !streamingContent && !currentStatus && (
              <div className="text-green-400">
                <p className="text-base md:text-lg font-bold">yukyu</p>
                <p className="mt-1 text-sm md:text-base">何でも聞いてね！ブログの記事について教えてあげるよ。</p>
              </div>
            )}

            {/* ユーザーの質問を表示 */}
            {latestUserMessage && (
              <div className="text-cyan-400 border-b border-green-900/50 pb-2">
                <p className="text-xs text-cyan-600 mb-1">あなた</p>
                <p className="whitespace-pre-wrap text-sm md:text-base">{latestUserMessage.content}</p>
              </div>
            )}

            {/* ステータス表示 */}
            {currentStatus && !streamingContent && (
              <div className="py-1">
                <p className="text-xs text-green-600 mb-1">yukyu</p>
                <ChatStatus status={currentStatus} />
              </div>
            )}

            {/* ストリーミング中の回答 */}
            {streamingContent && (
              <div className="text-green-400">
                <p className="text-xs text-green-600 mb-1">yukyu</p>
                <div className={PROSE_CLASSES}>
                  <ReactMarkdown>{streamingContent}</ReactMarkdown>
                </div>
                {/* モバイル用のソース表示 */}
                <div className="md:hidden">
                  <SourcesList sources={streamingSources} compact />
                </div>
              </div>
            )}

            {/* 最新の回答（ストリーミング完了後） */}
            {!streamingContent && !currentStatus && latestAssistantMessage && (
              <div className="text-green-400">
                <p className="text-xs text-green-600 mb-1">yukyu</p>
                <div className={PROSE_CLASSES}>
                  <ReactMarkdown>{latestAssistantMessage.content}</ReactMarkdown>
                </div>
                {/* モバイル用のソース表示 */}
                <div className="md:hidden">
                  {latestAssistantMessage.sources && (
                    <SourcesList sources={latestAssistantMessage.sources} compact />
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 入力フォーム */}
          <form onSubmit={handleSubmit} className="p-2 md:p-3 border-t border-green-900/50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? "応答中..." : "メッセージを入力..."}
                className="flex-1 bg-black/50 border border-green-700 rounded px-3 py-2 text-base text-green-400 placeholder-green-800 focus:outline-none focus:border-green-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold px-4 md:px-6 py-2 rounded transition-colors text-base"
              >
                送信
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
