import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export const metadata = {
  title: 'yukyu.net',
  description: 'yukyu.netのブログ'
}

export default function Home() {
  const posts = getAllPosts()
  return (
    <main className="post-list">
      <h1>yukyu.net</h1>
      <ul>
        {posts.map(p => (
          <li key={p.slug}>
            <time dateTime={p.frontMatter.date}>{p.frontMatter.date}</time>
            <Link href={`/posts/${p.slug}`}>{p.frontMatter.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
