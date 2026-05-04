import type { ReactNode } from 'react'
import { useMDXComponents as getThemeComponents } from 'nextra-theme-blog'
import { Image as NextraImage } from 'nextra/mdx-components/image'

const themeComponents = getThemeComponents()

function PassthroughWrapper({ children }: { children: ReactNode }) {
  return children
}

export function useMDXComponents(components?: Record<string, React.ComponentType>) {
  return {
    ...themeComponents,
    wrapper: PassthroughWrapper,
    img: NextraImage,
    ...components
  }
}
