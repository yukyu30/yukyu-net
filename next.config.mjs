import nextra from 'nextra'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import remarkLinkCard from './src/lib/link-card/remark-link-card.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const withNextra = nextra({
  contentDirBasePath: '/',
  search: {
    codeblocks: false
  },
  mdxOptions: {
    remarkPlugins: [remarkLinkCard]
  }
})

export default withNextra({
  reactStrictMode: true,
  outputFileTracingExcludes: {
    '*': [
      'content/posts/**/*.{gif,png,jpg,jpeg,svg,webp,avif}'
    ]
  },
  turbopack: {
    root: __dirname
  }
})
