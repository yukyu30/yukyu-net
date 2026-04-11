import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'
import ArticleLayout from '@/components/ArticleLayout'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Not Found',
    }
  }

  const encodedTitle = encodeURIComponent(post.title)
  const ogImageUrl = `https://yukyu-site-og.vercel.app/api/og?title=${encodedTitle}`

  return {
    title: post.title,
    description: post.excerpt || post.content?.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content?.substring(0, 160),
      type: 'article',
      publishedTime: post.date,
      authors: ['yukyu'],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content?.substring(0, 160),
      images: [ogImageUrl],
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <ArticleLayout
      slug={post.slug}
      title={post.title}
      date={post.date}
      tags={post.tags}
      content={post.content || ''}
      rawMarkdown={post.rawMarkdown || ''}
    />
  )
}
