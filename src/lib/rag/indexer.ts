import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { getAllPosts, getPostBySlug } from '../posts'
import { embedMany } from './embeddings'
import { initializeIndex, upsertVectors, deleteVectorsBySlug, loadHashCache, saveHashToCache, deleteHashFromCache } from './vector-store'

const CHUNK_SIZE = 350 // 日本語は1文字≒1トークンで情報密度が高いため小さめに
const CHUNK_OVERLAP = 70 // チャンクサイズの20%でコンテキスト切断を防止

function computeContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

// 記事のMarkdownコンテンツを直接読み取る（ハッシュ計算用）
function getPostRawContent(slug: string): string | null {
  const postsDirectory = path.join(process.cwd(), 'contents')
  const indexPath = path.join(postsDirectory, slug, 'index.md')
  
  if (!fs.existsSync(indexPath)) {
    return null
  }
  
  return fs.readFileSync(indexPath, 'utf-8')
}

export interface Chunk {
  text: string
  slug: string
  title: string
  chunkIndex: number
}

export function chunkText(text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start += chunkSize - overlap
    
    if (start >= text.length) break
  }

  return chunks
}

export async function indexPost(slug: string): Promise<number> {
  const post = await getPostBySlug(slug)
  if (!post || !post.content) {
    return 0
  }

  // 既存のベクトルを削除
  await deleteVectorsBySlug(slug)

  // Markdownのコンテンツをチャンク分割
  const textChunks = chunkText(post.content)
  if (textChunks.length === 0) {
    return 0
  }

  // チャンクのメタデータを作成
  const chunks: Chunk[] = textChunks.map((text, index) => ({
    text,
    slug: post.slug,
    title: post.title,
    chunkIndex: index,
  }))

  // Embeddingを生成
  const embeddings = await embedMany(textChunks)

  // ベクトルストアに保存
  await upsertVectors(embeddings, chunks)

  return chunks.length
}

export async function indexAllPosts(): Promise<{ total: number; indexed: number }> {
  // インデックスを初期化
  await initializeIndex()

  const posts = await getAllPosts()
  let indexed = 0

  for (const post of posts) {
    try {
      const rawContent = getPostRawContent(post.slug)
      if (!rawContent) {
        console.warn(`Skipped ${post.slug} (content not found)`)
        continue
      }
      
      const chunkCount = await indexPost(post.slug)
      indexed += chunkCount
      
      // ハッシュをDBに保存
      const contentHash = computeContentHash(rawContent)
      await saveHashToCache(post.slug, contentHash)
      
      console.log(`Indexed ${post.slug}: ${chunkCount} chunks`)
    } catch (error) {
      console.error(`Failed to index ${post.slug}:`, error)
    }
  }

  return { total: posts.length, indexed }
}

export interface IndexResult {
  total: number
  skipped: number
  indexed: number
  deleted: number
  failed: string[]
}

export async function indexNewPostsOnly(): Promise<IndexResult> {
  // インデックスを初期化
  await initializeIndex()

  const posts = await getAllPosts()
  const cachedHashes = await loadHashCache()

  let indexed = 0
  let skipped = 0
  let deleted = 0
  const failed: string[] = []

  // 現在の記事のslugセットを作成
  const currentSlugs = new Set(posts.map(p => p.slug))

  // 削除された記事をベクトルストアとキャッシュから削除
  for (const [slug] of cachedHashes) {
    if (!currentSlugs.has(slug)) {
      try {
        // ベクトル削除とキャッシュ削除を連続して実行
        // どちらかが失敗した場合はエラーを記録し、次回の実行で再試行される
        await deleteVectorsBySlug(slug)
        await deleteHashFromCache(slug)
        console.log(`Deleted ${slug} (post removed)`)
        deleted++
      } catch (error) {
        console.error(`Failed to delete ${slug}:`, error)
        failed.push(slug)
      }
    }
  }

  for (const post of posts) {
    // 記事の生のコンテンツを取得してハッシュを計算
    const rawContent = getPostRawContent(post.slug)
    if (!rawContent) {
      console.warn(`Skipped ${post.slug} (content not found)`)
      continue
    }

    const contentHash = computeContentHash(rawContent)
    const cachedHash = cachedHashes.get(post.slug)

    // ハッシュが一致する場合はスキップ
    if (cachedHash === contentHash) {
      skipped++
      console.log(`Skipped ${post.slug} (unchanged)`)
      continue
    }

    // 新規または更新された記事をインデックス
    try {
      const chunkCount = await indexPost(post.slug)
      indexed += chunkCount

      // ハッシュをDBに保存
      await saveHashToCache(post.slug, contentHash)

      console.log(`Indexed ${post.slug}: ${chunkCount} chunks${cachedHash ? ' (updated)' : ' (new)'}`)
    } catch (error) {
      console.error(`Failed to index ${post.slug}:`, error)
      failed.push(post.slug)
    }
  }

  return { total: posts.length, skipped, indexed, deleted, failed }
}

export { CHUNK_SIZE, CHUNK_OVERLAP }
