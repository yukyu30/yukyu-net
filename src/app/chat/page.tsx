import { Metadata } from 'next'
import McpAppHost from '@/components/McpAppHost'
import MenuBar from '@/components/MenuBar'

export const metadata: Metadata = {
  title: 'DecoBoco Chat | yukyu.net',
  description: 'yukyuのブログについて聞いてみよう - MCP Apps',
}

interface ChatPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const { q } = await searchParams

  return (
    <div className="h-screen flex flex-col bg-black">
      <MenuBar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <McpAppHost
          appUrl="/mcp-apps/chat.html"
          initialQuery={q}
          className="w-full h-full"
        />
      </main>
    </div>
  )
}
