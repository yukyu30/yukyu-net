import { z } from 'zod'

const dateLike = z.union([z.string(), z.date()])

export const LegacyFrontmatterSchema = z
  .object({
    id: z.string().optional(),
    title: z.string(),
    created_at: dateLike.optional(),
    createdAt: dateLike.optional(),
    date: dateLike.optional(),
    updated_at: dateLike.optional(),
    updatedAt: dateLike.optional(),
    tags: z.array(z.string()).optional(),
    excerpt: z.string().optional(),
    externalUrl: z.string().optional(),
    rss: z.boolean().optional()
  })
  .refine(
    data => data.created_at !== undefined || data.createdAt !== undefined || data.date !== undefined,
    { message: 'one of created_at / createdAt / date is required' }
  )

export type LegacyFrontmatter = z.infer<typeof LegacyFrontmatterSchema>

export const AUTHORS = ['yukyuu', 'claude-opus-4-7'] as const
export const AuthorSchema = z.enum(AUTHORS)
export type Author = z.infer<typeof AuthorSchema>

export const NextraFrontmatterSchema = z.object({
  title: z.string(),
  date: z.preprocess(
    v => (v instanceof Date ? formatLocalDate(v) : v),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
  ),
  description: z.string().optional(),
  tag: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  author: AuthorSchema,
  coAuthors: z.array(AuthorSchema).optional()
})

export type NextraFrontmatter = z.infer<typeof NextraFrontmatterSchema>

function toIsoDate(input: string | Date): string {
  if (typeof input === 'string') {
    const prefix = input.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (prefix) {
      return `${prefix[1]}-${prefix[2]}-${prefix[3]}`
    }
    const d = new Date(input)
    if (Number.isNaN(d.getTime())) {
      throw new Error(`Invalid date: ${input}`)
    }
    return formatLocalDate(d)
  }
  return formatLocalDate(input)
}

function formatLocalDate(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function convertFrontmatter(legacy: LegacyFrontmatter): NextraFrontmatter {
  const rawDate = legacy.created_at ?? legacy.createdAt ?? legacy.date
  if (rawDate === undefined) {
    throw new Error('legacy frontmatter has no date-ish field')
  }
  const out: NextraFrontmatter = {
    title: legacy.title,
    date: toIsoDate(rawDate),
    author: 'yukyuu'
  }
  if (legacy.excerpt) {
    out.description = legacy.excerpt
  }
  if (legacy.tags && legacy.tags.length > 0) {
    out.tag = legacy.tags
  }
  return out
}
