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

  it('rewrites bare relative image paths to /posts/{slug}/...', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

![cap](2021-05-18-1.png)
`
    const { mdx } = convertPost({ source: input, slug: '2021-05-18' })
    expect(mdx).toContain('![cap](/posts/2021-05-18/2021-05-18-1.png)')
  })

  it('strips @@img@@/ prefix when present', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

![cap](@@img@@/final.jpg)
`
    const { mdx } = convertPost({ source: input, slug: 'whatever' })
    expect(mdx).toContain('![cap](/posts/whatever/final.jpg)')
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

  it('self-closes void HTML tags so MDX can parse them', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

line1<br>line2

<hr>

<img src="x.png" alt="x">
`
    const { mdx } = convertPost({ source: input, slug: 's' })
    expect(mdx).toContain('<br />')
    expect(mdx).toContain('<hr />')
    expect(mdx).toMatch(/<img [^>]+\/>/)
    expect(mdx).not.toMatch(/<br>/)
    expect(mdx).not.toMatch(/<hr>/)
  })

  it('leaves already self-closed void tags alone', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

<br />
<hr/>
`
    const { mdx } = convertPost({ source: input })
    expect(mdx).toContain('<br />')
    expect(mdx).toContain('<hr/>')
    expect((mdx.match(/<br/g) ?? []).length).toBe(1)
  })

  it('extracts the first markdown image as thumbnail', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

intro

![cap](./first.png)

more text

![cap2](./second.png)
`
    const { mdx, frontmatter } = convertPost({ source: input, slug: 'sample' })
    expect(frontmatter.thumbnail).toBe('/posts/sample/first.png')
    expect(mdx).toMatch(/^---\n[\s\S]*thumbnail: \/posts\/sample\/first\.png[\s\S]*---/m)
  })

  it('uses absolute URL as thumbnail when first image is external', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

![ext](https://example.com/cover.png)
`
    const { frontmatter } = convertPost({ source: input, slug: 's' })
    expect(frontmatter.thumbnail).toBe('https://example.com/cover.png')
  })

  it('uses HTML <img> src as thumbnail fallback', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

<img src="/posts/s/x.png" alt="x" />
`
    const { frontmatter } = convertPost({ source: input, slug: 's' })
    expect(frontmatter.thumbnail).toBe('/posts/s/x.png')
  })

  it('omits thumbnail when no image is found', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

text only.
`
    const { mdx, frontmatter } = convertPost({ source: input, slug: 's' })
    expect(frontmatter.thumbnail).toBeUndefined()
    expect(mdx).not.toMatch(/^thumbnail:/m)
  })

  it('rewrites HTML attributes to JSX equivalents inside raw tags', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

<iframe class="x" frameborder="0" allowfullscreen="true" src="https://e.example/v"></iframe>
`
    const { mdx } = convertPost({ source: input, slug: 's' })
    expect(mdx).toContain('className="x"')
    expect(mdx).toContain('frameBorder="0"')
    expect(mdx).toContain('allowFullScreen="true"')
    expect(mdx).not.toContain(' class="')
    expect(mdx).not.toContain('frameborder=')
    expect(mdx).not.toContain('allowfullscreen=')
  })

  it('strips inline style="..." attributes that JSX cannot accept as strings', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

<iframe src="x" style="border: 0px; width: 100%;" data-ratio="1.7"></iframe>
`
    const { mdx } = convertPost({ source: input, slug: 's' })
    expect(mdx).not.toMatch(/\sstyle="/)
    expect(mdx).toContain('data-ratio="1.7"')
    expect(mdx).toContain('src="x"')
  })

  it('does not touch data-* attributes or class names inside markdown text', () => {
    const input = `---
title: t
created_at: 2020-07-01
---

通常テキスト class="not-an-attribute" のような文字列はそのまま。

<div data-foo="bar" class="real">x</div>
`
    const { mdx } = convertPost({ source: input, slug: 's' })
    expect(mdx).toContain('class="not-an-attribute"')
    expect(mdx).toContain('data-foo="bar"')
    expect(mdx).toContain('className="real"')
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
