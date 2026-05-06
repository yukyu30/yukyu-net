import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LinkCardCache, LinkCardMeta } from './types'

const CACHE_PATH = resolve(process.cwd(), 'content/link-cards.json')

let cache: LinkCardCache | null = null

export function loadLinkCardCache(): LinkCardCache {
  if (cache) return cache
  if (!existsSync(CACHE_PATH)) {
    cache = {}
    return cache
  }
  try {
    cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8')) as LinkCardCache
  } catch {
    cache = {}
  }
  return cache
}

export function getLinkCardMeta(url: string): LinkCardMeta | undefined {
  return loadLinkCardCache()[url]
}

export const LINK_CARD_CACHE_PATH = CACHE_PATH
