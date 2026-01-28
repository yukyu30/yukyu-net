/**
 * MCP Server for yukyu.net chat
 *
 * Provides:
 * - chat tool: RAG-powered chat with blog posts
 * - ui://yukyu/chat resource: Interactive chat UI (MCP Apps)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from '@modelcontextprotocol/ext-apps/server'
import { z } from 'zod'
import { searchWithRelated } from '../lib/rag/retriever'
import {
  getAIProvider,
  streamChatCompletion,
  type ChatMessage,
} from '../lib/ai-provider'

const CHAT_UI_URI = 'ui://yukyu/chat'

const SYSTEM_PROMPT = `あなたはyukyu.netのブログ管理人、yukyuです。
このブログは僕（yukyu）が運営している個人ブログで、日常や技術、イベント参加記録などが書かれています。

ルール:
- 一人称は「僕」を使う
- 簡潔かつフレンドリーに答える
- ブログの内容について答える

以下は参考になる記事の内容です：
{context}

ユーザーの質問に、上記の記事内容を参考にして回答してください。`

// Chat UI HTML (MCP Apps format)
const CHAT_UI_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>yukyu.net Chat</title>
  <script type="module">
    import { App, PostMessageTransport } from '@modelcontextprotocol/ext-apps';

    const transport = new PostMessageTransport({ targetOrigin: '*' });
    const app = new App({
      appInfo: { name: 'yukyu-chat', version: '1.0.0' },
      capabilities: { tools: { call: true } },
      transport,
    });

    await app.connect();

    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('messages');
    const sources = document.getElementById('sources');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;

      // Add user message
      addMessage('user', message);
      input.value = '';

      // Call chat tool
      try {
        const result = await app.callTool('chat', { message });
        const data = JSON.parse(result.content[0].text);

        // Show sources
        if (data.sources?.length > 0) {
          showSources(data.sources);
        }

        // Add assistant message
        addMessage('assistant', data.response);
      } catch (error) {
        addMessage('error', 'エラーが発生しました');
      }
    });

    function addMessage(role, content) {
      const div = document.createElement('div');
      div.className = 'message ' + role;
      div.textContent = content;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function showSources(sourceList) {
      sources.innerHTML = '';
      sourceList.forEach((src, i) => {
        const a = document.createElement('a');
        a.href = '/posts/' + src.slug;
        a.target = '_blank';
        a.className = 'source-card';
        a.innerHTML = '<span class="index">' + (i + 1) + '</span><span class="title">' + src.title + '</span>';
        sources.appendChild(a);
      });
      sources.style.display = 'flex';
    }
  </script>
  <style>
    :root {
      --bg: #000;
      --fg: #22c55e;
      --fg-dim: #166534;
      --border: #14532d;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      background: var(--bg);
      color: var(--fg);
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    #sources {
      display: none;
      gap: 0.5rem;
      padding: 0.75rem;
      overflow-x: auto;
      border-bottom: 1px solid var(--border);
    }
    .source-card {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      color: var(--fg);
      text-decoration: none;
      font-size: 0.75rem;
    }
    .source-card:hover { background: rgba(34, 197, 94, 0.2); }
    .source-card .index {
      width: 1.25rem;
      height: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--fg-dim);
      border-radius: 0.25rem;
      font-size: 0.625rem;
    }
    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .message {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      max-width: 80%;
      line-height: 1.5;
    }
    .message.user {
      align-self: flex-end;
      background: var(--fg-dim);
      color: #fff;
    }
    .message.assistant {
      align-self: flex-start;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid var(--border);
    }
    .message.error {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #dc2626;
      color: #f87171;
    }
    #chat-form {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem;
      border-top: 2px solid var(--fg);
      background: rgba(0, 0, 0, 0.8);
    }
    #chat-input {
      flex: 1;
      padding: 0.75rem 1rem;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      color: var(--fg);
      font-size: 1rem;
    }
    #chat-input:focus { outline: none; border-color: var(--fg); }
    #chat-input::placeholder { color: var(--fg-dim); }
    button {
      padding: 0.75rem 1.5rem;
      background: var(--fg-dim);
      border: none;
      border-radius: 0.5rem;
      color: #000;
      font-weight: bold;
      cursor: pointer;
    }
    button:hover { background: var(--fg); }
  </style>
</head>
<body>
  <div id="sources"></div>
  <div id="messages"></div>
  <form id="chat-form">
    <input type="text" id="chat-input" placeholder="メッセージを入力..." autocomplete="off">
    <button type="submit">送信</button>
  </form>
</body>
</html>`

async function main() {
  const server = new McpServer({
    name: 'yukyu-chat',
    version: '1.0.0',
  })

  // Register chat tool with UI
  registerAppTool(
    server,
    'chat',
    {
      title: 'Chat with yukyu',
      description: 'RAG-powered chat about yukyu.net blog posts',
      inputSchema: {
        message: z.string().describe('User message'),
        history: z
          .array(
            z.object({
              role: z.enum(['user', 'assistant']),
              content: z.string(),
            })
          )
          .optional()
          .describe('Chat history'),
      },
      _meta: {
        ui: { resourceUri: CHAT_UI_URI },
      },
    },
    async ({ message, history = [] }) => {
      // Search for relevant posts
      const { results } = await searchWithRelated(message, 5)

      const context = results.length > 0
        ? results.map((r) => `【${r.title}】\n${r.text}`).join('\n\n---\n\n')
        : '関連する記事は見つかりませんでした。'

      const sources = results.slice(0, 3).map((r) => ({
        slug: r.slug,
        title: r.title,
        score: r.score,
      }))

      // Generate response
      const provider = getAIProvider()
      const systemPrompt = SYSTEM_PROMPT.replace('{context}', context)
      const messages: ChatMessage[] = [
        ...history.map((h) => ({
          role: h.role as 'user' | 'assistant',
          content: h.content,
        })),
        { role: 'user' as const, content: message },
      ]

      let response = ''
      const stream = streamChatCompletion({
        provider,
        systemPrompt,
        messages,
        temperature: 0.7,
        maxTokens: 1000,
      })

      for await (const chunk of stream) {
        if (chunk.type === 'content' && chunk.content) {
          response += chunk.content
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ response, sources, provider }),
          },
        ],
      }
    }
  )

  // Register UI resource
  registerAppResource(
    server,
    'Chat UI',
    CHAT_UI_URI,
    {
      description: 'Interactive chat UI for yukyu.net',
    },
    async () => ({
      contents: [
        {
          uri: CHAT_UI_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: CHAT_UI_HTML,
        },
      ],
    })
  )

  // Start server
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(console.error)
