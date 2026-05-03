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

  it('rejects when created_at is missing', () => {
    const input = { title: 'no date' }
    expect(() => LegacyFrontmatterSchema.parse(input)).toThrow()
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
})
