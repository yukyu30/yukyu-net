#!/usr/bin/env tsx
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fetchLinkCardMeta } from '../src/lib/link-card/fetch'
import { getUniqueCardUrls } from '../src/lib/link-card/extract-urls'
import type { LinkCardCache } from '../src/lib/link-card/types'

const CACHE_PATH = resolve(process.cwd(), 'content/link-cards.json')

function loadCache(): LinkCardCache {
  if (!existsSync(CACHE_PATH)) return {}
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf8')) as LinkCardCache
  } catch {
    return {}
  }
}

function saveCache(cache: LinkCardCache): void {
  const sorted: LinkCardCache = {}
  for (const key of Object.keys(cache).sort()) {
    sorted[key] = cache[key]
  }
  writeFileSync(CACHE_PATH, JSON.stringify(sorted, null, 2) + '\n')
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force')
  const only = process.argv.find(a => a.startsWith('--url='))?.slice('--url='.length)

  const cache = loadCache()
  const urls = only ? [only] : getUniqueCardUrls()
  const targets = urls.filter(u => force || !cache[u])

  console.log(
    `[link-cards] total=${urls.length} cached=${urls.length - targets.length} to-fetch=${targets.length}`
  )

  let ok = 0
  let failed = 0
  for (const url of targets) {
    process.stdout.write(`  → ${url} ... `)
    try {
      const meta = await fetchLinkCardMeta(url)
      cache[url] = meta
      ok++
      console.log(`ok${meta.price ? ` (¥${meta.price})` : ''}`)
    } catch (err) {
      failed++
      console.log(`fail (${err instanceof Error ? err.message : String(err)})`)
    }
    saveCache(cache)
  }

  console.log(`[link-cards] done ok=${ok} failed=${failed}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
