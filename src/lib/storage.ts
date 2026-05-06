import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { getAllPostUrls } from './link-card/extract-urls'
import { loadLinkCardCache } from './link-card/cache'
import { getAllPosts } from './posts'

const POSTS_DIR = resolve(process.cwd(), 'content/posts')
const IMAGE_EXTENSIONS = new Set(['.gif', '.png', '.jpg', '.jpeg', '.webp', '.avif'])

export interface StorageImageItem {
  kind: 'image'
  slug: string
  src: string
  postTitle: string
  postDate: string
}

export interface StorageLinkItem {
  kind: 'link'
  slug: string
  url: string
  postTitle: string
  postDate: string
  title: string
  image?: string
  siteName?: string
  price?: string
  currency?: string
}

export type StorageItem = StorageImageItem | StorageLinkItem

function listImages(slug: string): string[] {
  const dir = join(POSTS_DIR, slug)
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  return entries
    .filter(name => IMAGE_EXTENSIONS.has(extname(name).toLowerCase()))
    .filter(name => {
      try {
        return statSync(join(dir, name)).isFile()
      } catch {
        return false
      }
    })
}

function thumbnailFor(slug: string): string | null {
  const indexPath = join(POSTS_DIR, slug, 'index.mdx')
  let raw: string
  try {
    raw = readFileSync(indexPath, 'utf8')
  } catch {
    return null
  }
  const m = raw.match(/^thumbnail:\s*(.+)$/m)
  if (!m) return null
  return m[1].trim().replace(/^['"]|['"]$/g, '')
}

export function getStorageItems(): StorageItem[] {
  const posts = getAllPosts()
  const postIndex = new Map(posts.map(p => [p.slug, p]))
  const cache = loadLinkCardCache()
  const items: StorageItem[] = []

  for (const post of posts) {
    const thumb = thumbnailFor(post.slug)
    const images = listImages(post.slug)
    const seen = new Set<string>()
    if (thumb) {
      const file = thumb.split('/').pop()
      if (file) seen.add(file)
      items.push({
        kind: 'image',
        slug: post.slug,
        src: thumb,
        postTitle: post.frontMatter.title,
        postDate: post.frontMatter.date
      })
    }
    for (const file of images) {
      if (seen.has(file)) continue
      items.push({
        kind: 'image',
        slug: post.slug,
        src: `/posts/${post.slug}/${file}`,
        postTitle: post.frontMatter.title,
        postDate: post.frontMatter.date
      })
    }
  }

  for (const { slug, url } of getAllPostUrls()) {
    const post = postIndex.get(slug)
    if (!post) continue
    const meta = cache[url]
    items.push({
      kind: 'link',
      slug,
      url,
      postTitle: post.frontMatter.title,
      postDate: post.frontMatter.date,
      title: meta?.title ?? url,
      image: meta?.image,
      siteName: meta?.siteName,
      price: meta?.price,
      currency: meta?.currency
    })
  }

  items.sort((a, b) => b.postDate.localeCompare(a.postDate))
  return items
}
