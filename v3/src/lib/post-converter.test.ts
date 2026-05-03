import { describe, it, expect } from 'vitest'
import { convertPost } from './post-converter'

describe('convertPost', () => {
  it('converts a typical legacy post into Nextra MDX', () => {
    const input = `---
id: work-cst
title: クリエイターサポートツール
created_at: 2020-07-01T00:00:00.000Z
updated_at: 2020-07-01T00:00:00.000Z
tags:
  - work
  - つくったもの
---

クリエイターをサポートするためのPHP製Webアプリケーションを開発しました。
`
    const { mdx, frontmatter } = convertPost({ source: input })

    expect(frontmatter.title).toBe('クリエイターサポートツール')
    expect(frontmatter.date).toBe('2020-07-01')
    expect(frontmatter.tag).toEqual(['work', 'つくったもの'])

    expect(mdx).toMatch(/^---\n/)
    expect(mdx).toContain('title: クリエイターサポートツール')
    expect(mdx).toContain('date: 2020-07-01')
    expect(mdx).toContain('クリエイターをサポートするためのPHP製Webアプリケーションを開発しました。')
    expect(mdx).not.toContain('id: work-cst')
    expect(mdx).not.toContain('updated_at:')
  })

  it('preserves the body content verbatim', () => {
    const body = '## 概要\n\nテスト本文です。\n\n```ts\nconst a = 1\n```\n'
    const input = `---
title: t
created_at: 2024-01-01
---

${body}`
    const { mdx } = convertPost({ source: input })
    expect(mdx).toContain(body.trim())
  })

  it('rewrites relative image paths to /posts/{slug}/...', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

![cap](./cst.gif)
`
    const { mdx } = convertPost({ source: input, slug: '2020-07-01-cst' })
    expect(mdx).toContain('![cap](/posts/2020-07-01-cst/cst.gif)')
    expect(mdx).not.toContain('./cst.gif')
  })

  it('leaves absolute http(s) image URLs untouched', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

![ext](https://example.com/x.png)
`
    const { mdx } = convertPost({ source: input, slug: '2020-07-01-cst' })
    expect(mdx).toContain('![ext](https://example.com/x.png)')
  })

  it('leaves root-absolute paths untouched', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

![root](/foo/bar.png)
`
    const { mdx } = convertPost({ source: input, slug: 'whatever' })
    expect(mdx).toContain('![root](/foo/bar.png)')
  })

  it('omits tag field when no tags are given', () => {
    const input = `---
title: notags
created_at: 2024-01-01
---

body
`
    const { mdx } = convertPost({ source: input })
    expect(mdx).not.toMatch(/^tag:/m)
  })

  it('throws when frontmatter is invalid', () => {
    const input = `---
created_at: 2024-01-01
---

no title
`
    expect(() => convertPost({ source: input })).toThrow()
  })
})
