import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { beforeAll, describe, it, expect } from 'vitest'
import {
  getAllPosts,
  getAllTagCounts,
  getEarliestYear,
  getPostBySlug,
  getPostsByTag,
  getPostsByTags,
  getProfileExcerpt,
  getTopTags,
  getWorks
} from './posts'

describe('posts', () => {
  beforeAll(() => {
    const mePath = join(resolve(process.cwd(), 'content/posts'), 'me.mdx')
    if (!existsSync(mePath)) {
      throw new Error(`Test fixture missing: ${mePath}`)
    }
  })

  it('returns posts sorted by date descending', () => {
    const posts = getAllPosts()
    expect(posts.length).toBeGreaterThan(0)
    for (let i = 1; i < posts.length; i += 1) {
      expect(posts[i - 1].frontMatter.date >= posts[i].frontMatter.date).toBe(true)
    }
  })

  it('finds a post by slug and returns undefined when missing', () => {
    const posts = getAllPosts()
    const sample = posts[0]
    expect(getPostBySlug(sample.slug)?.slug).toBe(sample.slug)
    expect(getPostBySlug('definitely-not-a-real-slug-zzz')).toBeUndefined()
  })

  it('aggregates tag counts and exposes top tags', () => {
    const counts = getAllTagCounts()
    expect(counts.length).toBeGreaterThan(0)
    for (let i = 1; i < counts.length; i += 1) {
      expect(counts[i - 1].count >= counts[i].count).toBe(true)
    }
    const top = getTopTags(3)
    expect(top.length).toBeLessThanOrEqual(3)
    expect(top[0]).toEqual(counts[0])
  })

  it('limits getPostsByTag to posts that include the tag', () => {
    const top = getTopTags(1)[0]
    const tagged = getPostsByTag(top.tag)
    expect(tagged.length).toBe(top.count)
    for (const p of tagged) {
      expect(p.frontMatter.tag ?? []).toContain(top.tag)
    }
  })

  it('extracts the profile excerpt for the me page', () => {
    const excerpt = getProfileExcerpt('me', 2)
    expect(excerpt.length).toBeGreaterThan(0)
    const lines = excerpt.split('\n').filter(Boolean)
    expect(lines.length).toBeLessThanOrEqual(2)
  })

  it('returns empty string when the profile slug does not exist', () => {
    expect(getProfileExcerpt('definitely-not-a-real-slug-zzz')).toBe('')
  })

  it('returns the earliest year as a 4-digit number', () => {
    const year = getEarliestYear()
    expect(year).toBeGreaterThanOrEqual(2000)
    expect(year).toBeLessThanOrEqual(new Date().getUTCFullYear())
  })

  it('exposes works as the union of work and つくったもの tags', () => {
    const works = getWorks()
    expect(works.length).toBeGreaterThan(0)
    for (const p of works) {
      const tags = p.frontMatter.tag ?? []
      expect(tags.includes('work') || tags.includes('つくったもの')).toBe(true)
    }
  })

  it('returns the union of multiple tags via getPostsByTags', () => {
    const single = getPostsByTag('work')
    const both = getPostsByTags(['work', 'つくったもの'])
    expect(both.length).toBeGreaterThanOrEqual(single.length)
    for (const p of both) {
      const tags = p.frontMatter.tag ?? []
      expect(tags.includes('work') || tags.includes('つくったもの')).toBe(true)
    }
  })
})
