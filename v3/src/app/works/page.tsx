import Link from 'next/link'
import { getPostsByTag } from '@/lib/posts'

export const metadata = {
  title: 'Works | yukyu.net',
  description: 'つくったもの'
}

export default function Works() {
  const posts = [...getPostsByTag('work'), ...getPostsByTag('つくったもの')]
  const unique = Array.from(new Map(posts.map(p => [p.slug, p])).values())
    .sort((a, b) => b.frontMatter.date.localeCompare(a.frontMatter.date))

  return (
    <main className="post-list">
      <h1>Works</h1>
      <ul>
        {unique.map(p => (
          <li key={p.slug}>
            <time dateTime={p.frontMatter.date}>{p.frontMatter.date}</time>
            <Link href={`/posts/${p.slug}`}>{p.frontMatter.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
