import type { ReactNode } from 'react'
import { useMDXComponents as getThemeComponents } from 'nextra-theme-blog'

const themeComponents = getThemeComponents()

function PassthroughWrapper({ children }: { children: ReactNode }) {
  return children
}

function PlainImg(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} />
}

export function useMDXComponents(components?: Record<string, React.ComponentType>) {
  return {
    ...themeComponents,
    wrapper: PassthroughWrapper,
    img: PlainImg,
    ...components
  }
}
