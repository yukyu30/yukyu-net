import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

describe('Footer', () => {
  it('グリッドレイアウトのフッターを表示する', () => {
    render(<Footer variant="grid" />)

    expect(screen.getByText(/© \d{4} yukyu LTS/)).toBeInTheDocument()
    expect(screen.getByText('ARTICLE LIST VIEW')).toBeInTheDocument()
    expect(screen.getByText('V1.0')).toBeInTheDocument()
  })

  it('記事ページのフッターを表示する', () => {
    render(<Footer variant="article" />)

    expect(screen.getByText(/© \d{4} yukyu LTS/)).toBeInTheDocument()
    expect(screen.getByText('ARTICLE VIEW')).toBeInTheDocument()
    expect(screen.getByText('V1.0')).toBeInTheDocument()
  })

  it('プライバシーポリシーへのリンクを表示する', () => {
    render(<Footer variant="grid" />)

    const link = screen.getByRole('link', { name: 'PRIVACY POLICY' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/posts/privacy-policy')
  })
})