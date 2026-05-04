import type { ImgHTMLAttributes, ReactNode } from 'react'
import { useMDXComponents as getThemeComponents } from 'nextra-theme-blog'

const themeComponents = getThemeComponents()

function PassthroughWrapper({ children }: { children: ReactNode }) {
  return children
}

type StaticImageLike = { src: string; width?: number; height?: number }

type PlainImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | StaticImageLike
}

function PlainImg({ src, width, height, ...rest }: PlainImgProps) {
  if (src && typeof src === 'object') {
    return (
      <img
        src={src.src}
        width={width ?? src.width}
        height={height ?? src.height}
        {...rest}
      />
    )
  }
  return <img src={src} width={width} height={height} {...rest} />
}

export function useMDXComponents(components?: Record<string, React.ComponentType>) {
  return {
    ...themeComponents,
    wrapper: PassthroughWrapper,
    img: PlainImg,
    ...components
  }
}
