import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export type AIProvider = 'openai' | 'claude'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StreamChunk {
  type: 'content' | 'done' | 'error'
  content?: string
  error?: string
}

export interface AIProviderConfig {
  provider: AIProvider
  systemPrompt: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

// Get the configured AI provider
export function getAIProvider(): AIProvider {
  const configured = process.env.AI_PROVIDER as AIProvider | undefined

  if (configured === 'openai' || configured === 'claude') {
    return configured
  }

  // Default to Claude if available, otherwise OpenAI
  if (process.env.ANTHROPIC_API_KEY) {
    return 'claude'
  }

  return 'openai'
}

// Check if any AI provider is available
export function isAIAvailable(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
}

// Get the provider-specific client
export function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export function getAnthropicClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
}

// Stream chat completion with the configured provider
export async function* streamChatCompletion(config: AIProviderConfig): AsyncGenerator<StreamChunk> {
  const { provider, systemPrompt, messages, temperature = 0.7, maxTokens = 1000 } = config

  if (provider === 'claude') {
    yield* streamClaudeCompletion(systemPrompt, messages, temperature, maxTokens)
  } else {
    yield* streamOpenAICompletion(systemPrompt, messages, temperature, maxTokens)
  }
}

async function* streamOpenAICompletion(
  systemPrompt: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): AsyncGenerator<StreamChunk> {
  const openai = getOpenAIClient()

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-5.1',
      messages: openaiMessages,
      temperature,
      max_completion_tokens: maxTokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield { type: 'content', content }
      }
    }

    yield { type: 'done' }
  } catch (error) {
    console.error('OpenAI streaming error:', error)
    yield { type: 'error', error: 'OpenAI API error' }
  }
}

async function* streamClaudeCompletion(
  systemPrompt: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): AsyncGenerator<StreamChunk> {
  const anthropic = getAnthropicClient()

  const claudeMessages: Anthropic.MessageParam[] = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: claudeMessages,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta
        if ('text' in delta) {
          yield { type: 'content', content: delta.text }
        }
      }
    }

    yield { type: 'done' }
  } catch (error) {
    console.error('Claude streaming error:', error)
    yield { type: 'error', error: 'Claude API error' }
  }
}

// Non-streaming completion for simple tasks (like bad word check)
export async function getChatCompletion(
  provider: AIProvider,
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const { temperature = 0, maxTokens = 100 } = options || {}

  if (provider === 'claude') {
    const anthropic = getAnthropicClient()
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    return textBlock?.text || ''
  } else {
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_completion_tokens: maxTokens,
    })

    return response.choices[0]?.message?.content || ''
  }
}
