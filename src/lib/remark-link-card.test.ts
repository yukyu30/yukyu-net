import { describe, expect, it } from 'vitest'
import remarkLinkCard, { bareUrlFromParagraph } from './remark-link-card.mjs'

const URL = 'https://example.com/page'

function paragraph(children: unknown[]) {
  return { type: 'paragraph', children }
}

function text(value: string) {
  return { type: 'text', value }
}

function link(url: string, label = url) {
  return { type: 'link', url, children: [text(label)] }
}

describe('bareUrlFromParagraph', () => {
  it('段落の唯一の子が text のベタ貼り URL を検出する', () => {
    expect(bareUrlFromParagraph(paragraph([text(URL)]))).toBe(URL)
  })

  it('前後の空白を許容する', () => {
    expect(bareUrlFromParagraph(paragraph([text(`  ${URL}  `)]))).toBe(URL)
  })

  it('gfm オートリンク後の link ノード（text===url）を検出する', () => {
    expect(bareUrlFromParagraph(paragraph([link(URL)]))).toBe(URL)
  })

  it('[text](url) のように label が url と異なるリンクは対象外', () => {
    expect(bareUrlFromParagraph(paragraph([link(URL, 'クリック')]))).toBeNull()
  })

  it('文中インラインの URL（他のテキストと混在）は対象外', () => {
    expect(
      bareUrlFromParagraph(paragraph([text('見て '), link(URL), text(' ね')]))
    ).toBeNull()
  })

  it('文章だけの段落は対象外', () => {
    expect(bareUrlFromParagraph(paragraph([text('ただの文章')]))).toBeNull()
  })

  it('http/https 以外のスキームは対象外', () => {
    expect(bareUrlFromParagraph(paragraph([text('ftp://example.com')]))).toBeNull()
  })
})

describe('remarkLinkCard transformer', () => {
  function run(tree: unknown) {
    remarkLinkCard()(tree)
    return tree
  }

  it('ベタ貼り URL 段落を LinkCard ノードに置換する', () => {
    const tree = { type: 'root', children: [paragraph([text(URL)])] } as {
      type: string
      children: Array<Record<string, unknown>>
    }
    run(tree)
    const node = tree.children[0]
    expect(node.type).toBe('mdxJsxFlowElement')
    expect(node.name).toBe('LinkCard')
    expect(node.attributes).toEqual([
      { type: 'mdxJsxAttribute', name: 'url', value: URL }
    ])
  })

  it('通常の段落は変更しない', () => {
    const original = paragraph([text('そのまま')])
    const tree = { type: 'root', children: [original] } as {
      type: string
      children: unknown[]
    }
    run(tree)
    expect(tree.children[0]).toBe(original)
  })

  it('blockquote など入れ子の中のベタ貼り URL も変換する', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'blockquote', children: [paragraph([text(URL)])] }]
    }
    run(tree)
    const inner = tree.children[0].children[0] as { type: string }
    expect(inner.type).toBe('mdxJsxFlowElement')
  })
})
