'use client'

import { useRef, useEffect, useCallback } from 'react'

interface McpAppHostProps {
  appUrl: string
  initialQuery?: string
  className?: string
}

/**
 * MCP Apps Host Component
 *
 * Hosts an MCP App in an iframe and bridges communication
 * between the app and the server via postMessage.
 */
export default function McpAppHost({ appUrl, initialQuery, className }: McpAppHostProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Send message to iframe
  const sendToApp = useCallback((type: string, data: Record<string, unknown> = {}) => {
    iframeRef.current?.contentWindow?.postMessage({ type, ...data }, '*')
  }, [])

  // Handle chat request from app
  const handleChat = useCallback(async (message: string, history: Array<{ role: string; content: string }>) => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) throw new Error('Chat failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              // Forward all events to the app
              sendToApp(data.type, data)
            } catch {
              // JSON parse error, skip
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Chat error:', error)
        sendToApp('error', { message: 'エラーが発生しました' })
      }
    }
  }, [sendToApp])

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our iframe
      if (event.source !== iframeRef.current?.contentWindow) return

      const { type, ...data } = event.data || {}

      switch (type) {
        case 'ready':
          // App is ready, send initial query if present
          if (initialQuery) {
            sendToApp('chat', { message: `「${initialQuery}」について教えて`, history: [] })
            handleChat(`「${initialQuery}」について教えて`, [])
          }
          break

        case 'chat':
          handleChat(data.message, data.history || [])
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [initialQuery, sendToApp, handleChat])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <iframe
      ref={iframeRef}
      src={appUrl}
      className={className}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      style={{ border: 'none' }}
    />
  )
}
