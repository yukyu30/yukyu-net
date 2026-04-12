import { render, screen } from '@testing-library/react'
import Header from '../Header'

// GSAPをモック
jest.mock('gsap', () => ({
  to: jest.fn(),
  registerPlugin: jest.fn(),
}));

jest.mock('@gsap/react', () => ({
  useGSAP: jest.fn(),
}));

describe('Header', () => {
  it('インデックスページのヘッダーを表示する', () => {
    const { container } = render(<Header postsCount={10} lastUpdate="2025-01-01" />)

    // DecoBocoTitleは文字を分割するため、textContentで確認
    expect(container.textContent).toContain('yukyu LTS')
    // デスクトップとモバイル両方のビューがあるため、getAllByTextを使用
    expect(screen.getAllByText('ENTRIES: 10')[0]).toBeInTheDocument()
    expect(screen.getAllByText('LAST UPDATE: 2025-01-01')[0]).toBeInTheDocument()
    expect(screen.getAllByText('RSS')[0]).toBeInTheDocument()
  })

  it('記事ページのヘッダーを表示する', () => {
    render(<Header showBackButton={true} pageType="article" />)

    expect(screen.getByText('← INDEX')).toBeInTheDocument()
    expect(screen.getByText('ARTICLE VIEW')).toBeInTheDocument()
  })

  it('TOOLSメニューに3D FACEリンクが表示される', () => {
    render(<Header postsCount={10} lastUpdate="2025-01-01" />)

    // TOOLSメニューが表示される
    expect(screen.getAllByText('TOOLS')[0]).toBeInTheDocument()

    // 3D FACEリンクが表示される
    const faceLinkElements = screen.getAllByText('3D FACE')
    expect(faceLinkElements[0]).toBeInTheDocument()

    // 外部リンクであることを確認
    const faceLink = faceLinkElements[0].closest('a')
    expect(faceLink).toHaveAttribute('href', 'https://yukyu30.github.io/3d-face/')
    expect(faceLink).toHaveAttribute('target', '_blank')
  })
})