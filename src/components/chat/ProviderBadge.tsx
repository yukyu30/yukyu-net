'use client'

interface ProviderBadgeProps {
  provider: 'openai' | 'claude'
  model?: string
}

export function ProviderBadge({ provider, model }: ProviderBadgeProps) {
  const isClaudeAnthropicBrand = provider === 'claude'

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-950/50 border border-green-800/30">
      {isClaudeAnthropicBrand ? (
        // Anthropic Claude icon (simplified)
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      ) : (
        // OpenAI icon (simplified)
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      )}
      <span className="text-xs text-green-500">
        {model || (isClaudeAnthropicBrand ? 'Claude' : 'GPT')}
      </span>
    </div>
  )
}
