import type { HTMLAttributes, ImgHTMLAttributes, ReactNode, TableHTMLAttributes } from 'react'
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

function PlainPre({ children, ...rest }: HTMLAttributes<HTMLPreElement>) {
  return <pre {...rest}>{children}</pre>
}

function ResponsiveTable({ children, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="post-table-scroll">
      <table {...rest}>{children}</table>
    </div>
  )
}

export function useMDXComponents(components?: Record<string, React.ComponentType>) {
  return {
    ...themeComponents,
    wrapper: PassthroughWrapper,
    img: PlainImg,
    pre: PlainPre,
    table: ResponsiveTable,
    ...components
  }
}
