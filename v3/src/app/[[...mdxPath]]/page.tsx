import Link from 'next/link'
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'
import { getAllPosts } from '@/lib/posts'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

interface PageProps {
  params: Promise<{ mdxPath?: string[] }>
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  return metadata
}

const themeComponents = getMDXComponents()
const ThemeWrapper = themeComponents.wrapper

interface FrontMatterShape {
  title?: string
  date?: string
  tag?: string[]
  description?: string
}

function PostMeta({ slug, frontMatter, readTime }: {
  slug: string
  frontMatter: FrontMatterShape
  readTime: number
}) {
  const tags = frontMatter.tag ?? []
  return (
    <section className="post-hero">
      <div className="post-hero__caption">
        Entry — <Link href={`/posts/${slug}`} style={{ color: 'inherit' }}>/posts/{slug}</Link>
      </div>
      <h1 className="post-hero__title">{frontMatter.title}</h1>
      <div className="post-hero__meta">
        <div>
          <span className="post-hero__meta-key">date:</span> {frontMatter.date}
        </div>
        <div>
          <span className="post-hero__meta-key">read:</span> {readTime} min
        </div>
        {tags.length > 0 && (
          <div>
            <span className="post-hero__meta-key">tags:</span>{' '}
            {tags.map(t => '#' + t).join(' ')}
          </div>
        )}
      </div>
    </section>
  )
}

export default async function Page(props: PageProps) {
  const params = await props.params
  const segments = params.mdxPath
  const result = await importPage(segments)
  const { default: MDXContent, toc, metadata } = result

  const isPost = Array.isArray(segments) && segments[0] === 'posts' && segments.length === 2
  const slug = isPost ? segments![1] : null

  if (isPost && slug) {
    const post = getAllPosts().find(p => p.slug === slug)
    if (post) {
      return (
        <div className="page">
          <PostMeta slug={slug} frontMatter={post.frontMatter} readTime={post.readTime} />
          <section className="post-layout">
            <aside className="post-toc">
              <div className="post-toc__head">— Table of Contents</div>
              <ol className="post-toc__list">
                {toc.map((entry: { id: string; value: string; depth: number }, i: number) => (
                  <li
                    key={entry.id}
                    className={`post-toc__item${entry.depth >= 3 ? ' is-sub' : ''}`}
                  >
                    <span className="post-toc__no">{String(i + 1).padStart(2, '0')}.</span>
                    <a className="post-toc__link" href={`#${entry.id}`}>{entry.value}</a>
                  </li>
                ))}
              </ol>
            </aside>
            <article className="post-body">
              <MDXContent {...props} params={params} />
              <div className="post-end">
                <span>
                  <span className="post-end__accent">END</span> · {post.frontMatter.date}
                </span>
                <span>
                  <Link href="/">← back to /index</Link>
                </span>
              </div>
            </article>
          </section>
        </div>
      )
    }
  }

  if (ThemeWrapper) {
    return (
      <div className="page">
        <article className="post-body" style={{ maxWidth: 720, margin: '0 auto', padding: '40px 36px' }}>
          <ThemeWrapper toc={toc} metadata={metadata}>
            <MDXContent {...props} params={params} />
          </ThemeWrapper>
        </article>
      </div>
    )
  }

  return (
    <div className="page">
      <article className="post-body" style={{ maxWidth: 720, margin: '0 auto', padding: '40px 36px' }}>
        <MDXContent {...props} params={params} />
      </article>
    </div>
  )
}
