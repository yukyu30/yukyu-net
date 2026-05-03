import { z } from 'zod'

export const LegacyFrontmatterSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]).optional(),
  tags: z.array(z.string()).optional()
})

export type LegacyFrontmatter = z.infer<typeof LegacyFrontmatterSchema>

export const NextraFrontmatterSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  description: z.string().optional(),
  tag: z.array(z.string()).optional()
})

export type NextraFrontmatter = z.infer<typeof NextraFrontmatterSchema>

function toIsoDate(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${String(input)}`)
  }
  return d.toISOString().slice(0, 10)
}

export function convertFrontmatter(legacy: LegacyFrontmatter): NextraFrontmatter {
  const out: NextraFrontmatter = {
    title: legacy.title,
    date: toIsoDate(legacy.created_at)
  }
  if (legacy.tags && legacy.tags.length > 0) {
    out.tag = legacy.tags
  }
  return out
}
