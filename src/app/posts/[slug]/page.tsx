import Link from 'next/link'
import { notFound } from 'next/navigation'
import { importPage } from 'nextra/pages'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { PostToc } from '@/components/post-toc'

export function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: PageProps) {
  const { slug } = await props.params
  try {
    const { metadata } = await importPage(['posts', slug])
    return metadata
  } catch {
    return { title: 'Not Found | yukyu.net' }
  }
}

interface TocEntry {
  id: string
  value: string
  depth: number
}

export default async function PostPage(props: PageProps) {
  const { slug } = await props.params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  let imported
  try {
    imported = await importPage(['posts', slug])
  } catch {
    notFound()
  }
  const { default: MDXContent, toc } = imported as {
    default: React.ComponentType<unknown>
    toc: TocEntry[]
  }

  const tags = post.frontMatter.tag ?? []

  return (
    <div className="page">
      <section className="post-hero">
        <div className="post-hero__caption">
          Entry — /posts/{slug}
        </div>
        <h1 className="post-hero__title">{post.frontMatter.title}</h1>
        <div className="post-hero__meta">
          <div>
            <span className="post-hero__meta-key">date:</span> {post.frontMatter.date}
          </div>
          <div>
            <span className="post-hero__meta-key">read:</span> {post.readTime} min
          </div>
          {tags.length > 0 && (
            <div>
              <span className="post-hero__meta-key">tags:</span>{' '}
              {tags.map(t => (
                <Link key={t} href={`/tags/${encodeURIComponent(t)}`} className="post-hero__meta-tag">
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="post-layout">
        <article className="post-body">
          <MDXContent />
          <div className="post-end">
            <span>
              <span className="post-end__accent">END</span> · {post.frontMatter.date}
            </span>
            <span>
              <Link href="/">← back to /index</Link>
            </span>
          </div>
        </article>
        <PostToc toc={toc} />
      </section>
    </div>
  )
}
