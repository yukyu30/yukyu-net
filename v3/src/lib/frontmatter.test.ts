import { describe, it, expect } from 'vitest'
import {
  LegacyFrontmatterSchema,
  NextraFrontmatterSchema,
  convertFrontmatter
} from './frontmatter'

describe('LegacyFrontmatterSchema', () => {
  it('parses a typical legacy frontmatter', () => {
    const input = {
      id: 'work-cst',
      title: 'クリエイターサポートツール',
      created_at: '2020-07-01T00:00:00.000Z',
      updated_at: '2020-07-01T00:00:00.000Z',
      tags: ['work', 'つくったもの']
    }
    expect(LegacyFrontmatterSchema.parse(input)).toEqual(input)
  })

  it('allows missing id, updated_at, tags', () => {
    const input = {
      title: 'minimal',
      created_at: '2024-01-01'
    }
    const parsed = LegacyFrontmatterSchema.parse(input)
    expect(parsed.title).toBe('minimal')
    expect(parsed.created_at).toBe('2024-01-01')
  })

  it('rejects when title is missing', () => {
    const input = { created_at: '2024-01-01' }
    expect(() => LegacyFrontmatterSchema.parse(input)).toThrow()
  })

  it('rejects when no date-ish field is present', () => {
    const input = { title: 'no date' }
    expect(() => LegacyFrontmatterSchema.parse(input)).toThrow()
  })

  it('accepts createdAt (camelCase) instead of created_at', () => {
    const input = { title: 't', createdAt: '2026-04-28 02:00:00' }
    const parsed = LegacyFrontmatterSchema.parse(input)
    expect(parsed.createdAt).toBe('2026-04-28 02:00:00')
  })

  it('accepts plain date field', () => {
    const input = { title: 't', date: '2020-12-16' }
    const parsed = LegacyFrontmatterSchema.parse(input)
    expect(parsed.date).toBe('2020-12-16')
  })

  it('accepts excerpt and externalUrl fields', () => {
    const input = {
      title: 't',
      date: '2020-12-16',
      excerpt: 'summary text',
      externalUrl: 'https://example.com'
    }
    const parsed = LegacyFrontmatterSchema.parse(input)
    expect(parsed.excerpt).toBe('summary text')
    expect(parsed.externalUrl).toBe('https://example.com')
  })
})

describe('convertFrontmatter', () => {
  it('maps title and created_at to title/date', () => {
    const result = convertFrontmatter({
      title: 'hello',
      created_at: '2020-07-01T00:00:00.000Z'
    })
    expect(result.title).toBe('hello')
    expect(result.date).toBe('2020-07-01')
  })

  it('maps tags array to tag array', () => {
    const result = convertFrontmatter({
      title: 't',
      created_at: '2020-07-01',
      tags: ['work', 'blog']
    })
    expect(result.tag).toEqual(['work', 'blog'])
  })

  it('drops id and updated_at fields', () => {
    const result = convertFrontmatter({
      id: 'should-vanish',
      title: 't',
      created_at: '2020-07-01',
      updated_at: '2024-12-31'
    })
    expect((result as Record<string, unknown>).id).toBeUndefined()
    expect((result as Record<string, unknown>).updated_at).toBeUndefined()
  })

  it('omits tag when no tags given', () => {
    const result = convertFrontmatter({
      title: 't',
      created_at: '2020-07-01'
    })
    expect(result.tag).toBeUndefined()
  })

  it('produces output that NextraFrontmatterSchema accepts', () => {
    const result = convertFrontmatter({
      id: 'x',
      title: 'タイトル',
      created_at: '2021-03-01T12:34:56.000Z',
      tags: ['a', 'b']
    })
    expect(() => NextraFrontmatterSchema.parse(result)).not.toThrow()
  })

  it('handles Date object as created_at', () => {
    const result = convertFrontmatter({
      title: 't',
      created_at: new Date('2022-09-15T00:00:00.000Z')
    })
    expect(result.date).toBe('2022-09-15')
  })

  it('throws on invalid created_at string', () => {
    expect(() =>
      convertFrontmatter({
        title: 't',
        created_at: 'not-a-date'
      })
    ).toThrow()
  })

  it('falls back to createdAt when created_at is absent', () => {
    const result = convertFrontmatter({
      title: 't',
      createdAt: '2026-04-28 02:00:00'
    })
    expect(result.date).toBe('2026-04-28')
  })

  it('falls back to date when neither created_at nor createdAt is present', () => {
    const result = convertFrontmatter({
      title: 't',
      date: '2020-12-16'
    })
    expect(result.date).toBe('2020-12-16')
  })

  it('promotes excerpt to description', () => {
    const result = convertFrontmatter({
      title: 't',
      created_at: '2020-12-16',
      excerpt: 'summary text'
    })
    expect(result.description).toBe('summary text')
  })
})
