import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { readdirSync, statSync } from 'node:fs'
import { notFound } from 'next/navigation'

export const dynamic = 'force-static'
export const dynamicParams = false

const POSTS_DIR = resolve(process.cwd(), 'content/posts')

const CONTENT_TYPES: Record<string, string> = {
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif'
}

export function generateStaticParams() {
  const params: Array<{ slug: string; file: string }> = []
  for (const slug of readdirSync(POSTS_DIR)) {
    const dir = join(POSTS_DIR, slug)
    let s
    try {
      s = statSync(dir)
    } catch {
      continue
    }
    if (!s.isDirectory()) continue
    for (const name of readdirSync(dir)) {
      const ext = extname(name).toLowerCase()
      if (!CONTENT_TYPES[ext]) continue
      params.push({ slug, file: name })
    }
  }
  return params
}

interface RouteContext {
  params: Promise<{ slug: string; file: string }>
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { slug, file } = await ctx.params
  const ext = extname(file).toLowerCase()
  const type = CONTENT_TYPES[ext]
  if (!type) notFound()

  const target = join(POSTS_DIR, slug, file)
  const safeRoot = POSTS_DIR + '/'
  if (!normalize(target).startsWith(safeRoot)) notFound()

  let body: Buffer
  try {
    body = await readFile(target)
  } catch {
    notFound()
  }

  const s = await stat(target)
  return new Response(new Uint8Array(body), {
    headers: {
      'Content-Type': type,
      'Content-Length': String(s.size),
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}
