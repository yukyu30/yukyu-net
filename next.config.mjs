import nextra from 'nextra'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const withNextra = nextra({
  contentDirBasePath: '/',
  search: {
    codeblocks: false
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
