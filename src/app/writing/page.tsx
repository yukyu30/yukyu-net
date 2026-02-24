import { getExternalPosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import GridLayout from '@/components/GridLayout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Writing - yukyu.net',
  description: '外部サイトでの執筆・登壇資料一覧',
}

export default function WritingPage() {
  const posts = getExternalPosts()

  return (
    <GridLayout
      postsCount={posts.length}
      lastUpdate={posts[0]?.date}
      showProfile={false}
      currentTag="writing"
    >
      {posts.map((post, index) => (
        <PostCard key={post.slug} post={post} index={index} />
      ))}
    </GridLayout>
  )
}
