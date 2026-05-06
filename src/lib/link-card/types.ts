export interface LinkCardMeta {
  url: string
  title: string
  description?: string
  image?: string
  siteName?: string
  favicon?: string
  price?: string
  currency?: string
  fetchedAt: string
}

export type LinkCardCache = Record<string, LinkCardMeta>
