import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const filePath = path.join(process.cwd(), 'contents', ...segments)

  // ディレクトリトラバーサル防止
  const resolved = path.resolve(filePath)
  const contentsDir = path.resolve(path.join(process.cwd(), 'contents'))
  if (!resolved.startsWith(contentsDir)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    return new NextResponse('Not found', { status: 404 })
  }

  const file = fs.readFileSync(resolved)
  const ext = path.extname(resolved).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  return new NextResponse(file, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
