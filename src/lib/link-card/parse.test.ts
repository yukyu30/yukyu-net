import { describe, expect, it } from 'vitest'
import { parseHtmlMeta } from './parse'
import { extractCardUrlsFromMdx } from './extract-urls'

describe('parseHtmlMeta', () => {
  it('reads OG tags and falls back to <title>', () => {
    const html = `
      <html><head>
        <title>Inner Title</title>
        <meta property="og:title" content="OG Title"/>
        <meta property="og:description" content="hello"/>
        <meta property="og:image" content="/cover.jpg"/>
        <meta property="og:site_name" content="Demo"/>
      </head></html>
    `
    const meta = parseHtmlMeta(html, 'https://example.com/foo')
    expect(meta.title).toBe('OG Title')
    expect(meta.description).toBe('hello')
    expect(meta.image).toBe('https://example.com/cover.jpg')
    expect(meta.siteName).toBe('Demo')
  })

  it('extracts price from JSON-LD Product schema', () => {
    const html = `
      <html><head>
        <title>Body Mist</title>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Perfumed Body Mist",
          "image": ["https://cdn.example.com/mist.jpg"],
          "offers": { "@type": "Offer", "price": "1430", "priceCurrency": "JPY" }
        }
        </script>
      </head></html>
    `
    const meta = parseHtmlMeta(html, 'https://shop.example.com/mist')
    expect(meta.price).toBe('1430')
    expect(meta.currency).toBe('JPY')
    expect(meta.image).toBe('https://cdn.example.com/mist.jpg')
    expect(meta.title).toBe('Perfumed Body Mist')
  })

  it('reads Open Graph product price tags', () => {
    const html = `
      <html><head>
        <title>X</title>
        <meta property="product:price:amount" content="2980"/>
        <meta property="product:price:currency" content="JPY"/>
      </head></html>
    `
    const meta = parseHtmlMeta(html, 'https://shop.example.com/x')
    expect(meta.price).toBe('2980')
    expect(meta.currency).toBe('JPY')
  })
})

describe('extractCardUrlsFromMdx', () => {
  it('picks bare URL on its own line', () => {
    const mdx = [
      '---',
      'title: t',
      '---',
      '',
      'intro',
      '',
      'https://example.com/article',
      '',
      'after'
    ].join('\n')
    expect(extractCardUrlsFromMdx(mdx)).toEqual(['https://example.com/article'])
  })

  it('ignores URLs inside fenced code blocks', () => {
    const mdx = [
      '```',
      'https://example.com/secret',
      '```',
      '',
      'https://ok.example.com/visible'
    ].join('\n')
    expect(extractCardUrlsFromMdx(mdx)).toEqual(['https://ok.example.com/visible'])
  })

  it('ignores inline-list URLs', () => {
    const mdx = '- foo: https://inline.example.com\n'
    expect(extractCardUrlsFromMdx(mdx)).toEqual([])
  })
})
