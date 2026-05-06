import type { Author } from './frontmatter'

interface AuthorInfo {
  name: string
  avatar: string
}

export const AUTHOR_INFO: Record<Author, AuthorInfo> = {
  yukyu: {
    name: 'yukyu',
    avatar: '/authors/yukyu.jpg'
  },
  'claude-opus-4-7': {
    name: 'Claude Opus 4.7',
    avatar: '/authors/claude-opus-4-7.svg'
  }
}
