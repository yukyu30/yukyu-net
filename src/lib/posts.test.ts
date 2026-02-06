import { getAllPosts, getPostBySlug, getAllTags, getPostsByTag } from './posts'
import fs from 'fs'
import path from 'path'

describe('記事一覧を取得する関数', () => {
  describe('getAllPosts', () => {
    test('記事一覧が取得できること', () => {
      const posts = getAllPosts()
      expect(posts).toBeDefined()
      expect(Array.isArray(posts)).toBe(true)
      expect(posts.length).toBeGreaterThan(0)
    })

    test('記事が日付順（新しい順）にソートされていること', () => {
      const posts = getAllPosts()
      for (let i = 0; i < posts.length - 1; i++) {
        const current = new Date(posts[i].date)
        const next = new Date(posts[i + 1].date)
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime())
      }
    })

    test('記事のメタデータ（title, date, excerpt）が取得できること', () => {
      const posts = getAllPosts()
      const firstPost = posts[0]
      expect(firstPost).toHaveProperty('title')
      expect(firstPost).toHaveProperty('date')
      expect(firstPost).toHaveProperty('excerpt')
    })

    test('記事のslugが取得できること', () => {
      const posts = getAllPosts()
      const firstPost = posts[0]
      expect(firstPost).toHaveProperty('slug')
      expect(typeof firstPost.slug).toBe('string')
    })

    test('記事のタグが取得できること', () => {
      const posts = getAllPosts()
      const postsWithTags = posts.filter(post => post.tags && post.tags.length > 0)
      expect(postsWithTags.length).toBeGreaterThan(0)
      expect(Array.isArray(postsWithTags[0].tags)).toBe(true)
    })

    test('READMEやprivacy-policyなどの特殊なディレクトリが除外されること', () => {
      const posts = getAllPosts()
      const hasReadme = posts.some(post => post.slug === 'README')
      const hasPrivacyPolicy = posts.some(post => post.slug === 'privacy-policy')
      expect(hasReadme).toBe(false)
      expect(hasPrivacyPolicy).toBe(false)
    })

    test('meディレクトリが記事一覧に含まれること', () => {
      const posts = getAllPosts()
      const hasMe = posts.some(post => post.slug === 'me')
      expect(hasMe).toBe(true)
    })
  })
})

describe('記事詳細を取得する関数', () => {
  describe('getPostBySlug', () => {
    test('指定したslugの記事が取得できること', async () => {
      const post = await getPostBySlug('2025-06-30')
      expect(post).toBeDefined()
      expect(post).not.toBeNull()
    })

    test('記事の本文がHTMLに変換されていること', async () => {
      const post = await getPostBySlug('2025-06-30')
      expect(post).toHaveProperty('content')
      expect(post?.content).toContain('<')
      expect(post?.content).toContain('>')
    })

    test('URLが自動的にリンクに変換されること', async () => {
      const post = await getPostBySlug('2022-12-17-hakusyon')
      if (post?.content) {
        // URLが自動的にリンクタグに変換されているか確認
        expect(post.content).toContain('<a href="https://hakusyu.yukyu.net"')
      }
    })

    test('記事のメタデータが取得できること', async () => {
      const post = await getPostBySlug('2025-06-30')
      expect(post).toHaveProperty('title')
      expect(post).toHaveProperty('date')
      expect(post).toHaveProperty('slug')
    })

    test('記事のタグが取得できること', async () => {
      const post = await getPostBySlug('2021-03-07')
      expect(post).toHaveProperty('tags')
      expect(Array.isArray(post?.tags)).toBe(true)
      if (post?.tags && post.tags.length > 0) {
        expect(post.tags).toContain('日記')
      }
    })

    test('存在しないslugの場合はnullが返ること', async () => {
      const post = await getPostBySlug('not-exist-slug')
      expect(post).toBeNull()
    })

    test('画像パスが適切に処理されること', async () => {
      const post = await getPostBySlug('2025-06-30')
      if (post?.content) {
        const hasAbsolutePath = post.content.includes('/contents/2025-06-30/')
        expect(hasAbsolutePath).toBe(true)
      }
    })
  })
})

describe('タグ関連の関数', () => {
  describe('getAllTags', () => {
    test('すべてのタグが取得できること', () => {
      const tags = getAllTags()
      expect(tags).toBeDefined()
      expect(tags instanceof Map).toBe(true)
      expect(tags.size).toBeGreaterThan(0)
    })

    test('タグごとの記事数が正しくカウントされること', () => {
      const tags = getAllTags()
      const posts = getAllPosts()
      
      // 日記タグの数を手動でカウント
      const diaryCount = posts.filter(post => post.tags?.includes('日記')).length
      if (tags.has('日記')) {
        expect(tags.get('日記')).toBe(diaryCount)
      }
    })
  })

  describe('getPostsByTag', () => {
    test('指定したタグの記事一覧が取得できること', () => {
      const posts = getPostsByTag('日記')
      expect(posts).toBeDefined()
      expect(Array.isArray(posts)).toBe(true)
      expect(posts.length).toBeGreaterThan(0)
      
      // すべての記事に指定タグが含まれていること
      posts.forEach(post => {
        expect(post.tags).toContain('日記')
      })
    })

    test('存在しないタグの場合は空配列が返ること', () => {
      const posts = getPostsByTag('存在しないタグ')
      expect(posts).toBeDefined()
      expect(Array.isArray(posts)).toBe(true)
      expect(posts.length).toBe(0)
    })

    test('タグでフィルタリングされた記事が日付順にソートされていること', () => {
      const posts = getPostsByTag('日記')
      for (let i = 0; i < posts.length - 1; i++) {
        const current = new Date(posts[i].date)
        const next = new Date(posts[i + 1].date)
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime())
      }
    })
  })
})