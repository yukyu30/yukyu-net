'use client'

import { SearchIcon, X } from 'lucide-react'
import { Search } from 'nextra/components'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface DocumentPictureInPicture {
  readonly window: Window | null
  requestWindow(options?: {
    width?: number
    height?: number
    disallowReturnToOpener?: boolean
    preferInitialWindowPlacement?: boolean
  }): Promise<Window>
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture
  }
}

function copyStyles(targetDocument: Document) {
  for (const styleSheet of Array.from(document.styleSheets)) {
    try {
      const cssText = Array.from(styleSheet.cssRules)
        .map(rule => rule.cssText)
        .join('')
      const style = targetDocument.createElement('style')
      style.textContent = cssText
      targetDocument.head.append(style)
    } catch {
      if (!styleSheet.href) continue
      const link = targetDocument.createElement('link')
      link.rel = 'stylesheet'
      link.href = styleSheet.href
      targetDocument.head.append(link)
    }
  }
}

export function PictureInPictureSearch() {
  const [pipRoot, setPipRoot] = useState<HTMLElement | null>(null)
  const [fallbackOpen, setFallbackOpen] = useState(false)
  const pipWindowRef = useRef<Window | null>(null)
  const searchContainerRef = useRef<HTMLDivElement | null>(null)

  const close = () => {
    const activeWindow =
      pipWindowRef.current ?? window.documentPictureInPicture?.window
    if (activeWindow && !activeWindow.closed) activeWindow.close()
    setFallbackOpen(false)
  }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    const container = searchContainerRef.current
    if (!container) return

    const targetDocument = container.ownerDocument
    const targetWindow = targetDocument.defaultView
    if (!targetWindow) return

    let animationFrame = 0

    const positionResults = () => {
      targetWindow.cancelAnimationFrame(animationFrame)
      animationFrame = targetWindow.requestAnimationFrame(() => {
        const input = container.querySelector<HTMLInputElement>(
          'input[type="search"]'
        )
        const results =
          targetDocument.querySelector<HTMLElement>('.nextra-search-results')
        if (!input || !results) return

        const inputRect = input.getBoundingClientRect()
        results.classList.add('site-search-results--below')
        results.style.setProperty(
          '--site-search-results-top',
          `${inputRect.bottom + 10}px`
        )
        results.style.setProperty(
          '--site-search-results-left',
          `${inputRect.left}px`
        )
        results.style.setProperty(
          '--site-search-results-width',
          `${inputRect.width}px`
        )
        results.style.setProperty(
          '--site-search-results-height',
          `${Math.max(0, targetWindow.innerHeight - inputRect.bottom - 24)}px`
        )
      })
    }

    const observer = new MutationObserver(positionResults)
    observer.observe(targetDocument.body, { childList: true, subtree: true })
    targetWindow.addEventListener('resize', positionResults)
    targetWindow.addEventListener('scroll', positionResults, true)
    container.addEventListener('input', positionResults)
    positionResults()

    return () => {
      observer.disconnect()
      targetWindow.cancelAnimationFrame(animationFrame)
      targetWindow.removeEventListener('resize', positionResults)
      targetWindow.removeEventListener('scroll', positionResults, true)
      container.removeEventListener('input', positionResults)
    }
  }, [fallbackOpen, pipRoot])

  const open = async () => {
    const documentPictureInPicture = window.documentPictureInPicture
    const activeWindow =
      pipWindowRef.current ?? documentPictureInPicture?.window

    if (activeWindow && !activeWindow.closed) {
      activeWindow.close()
      return
    }

    if (!documentPictureInPicture) {
      setFallbackOpen(true)
      return
    }

    try {
      const pipWindow = await documentPictureInPicture.requestWindow({
        width: 520,
        height: 720
      })
      pipWindowRef.current = pipWindow

      const pipDocument = pipWindow.document
      pipDocument.title = 'Search | yukyu.net'
      pipDocument.documentElement.lang = 'ja'

      const viewport = pipDocument.createElement('meta')
      viewport.name = 'viewport'
      viewport.content = 'width=device-width, initial-scale=1'
      pipDocument.head.append(viewport)
      copyStyles(pipDocument)

      const root = pipDocument.createElement('div')
      root.className = 'site-search-pip-root'
      pipDocument.body.replaceChildren(root)
      setPipRoot(root)

      pipWindow.addEventListener(
        'pagehide',
        () => {
          pipWindowRef.current = null
          setPipRoot(null)
        },
        { once: true }
      )
    } catch {
      pipWindowRef.current = null
      setPipRoot(null)
    }
  }

  const panel = (
    <section className="site-search-panel" aria-label="サイト内検索">
      <header className="site-search-panel__header">
        <span>Search</span>
        <button
          type="button"
          className="site-search-panel__close"
          aria-label="検索を閉じる"
          title="閉じる"
          onClick={close}
        >
          <X aria-hidden="true" size={18} strokeWidth={1.8} />
        </button>
      </header>
      <div className="site-search-panel__content" ref={searchContainerRef}>
        <Search
          placeholder="記事を検索..."
          emptyResult="検索結果がありません"
          loading="検索中..."
          errorText="検索インデックスを読み込めませんでした"
          autoFocus
        />
      </div>
    </section>
  )

  return (
    <>
      <button
        type="button"
        className={`site-header__search-toggle${pipRoot || fallbackOpen ? ' is-open' : ''}`}
        aria-label={pipRoot || fallbackOpen ? '検索を閉じる' : '検索を開く'}
        aria-expanded={Boolean(pipRoot || fallbackOpen)}
        onClick={pipRoot || fallbackOpen ? close : open}
      >
        <SearchIcon aria-hidden="true" size={15} strokeWidth={1.8} />
        <span>{pipRoot || fallbackOpen ? 'Close' : 'Search'}</span>
      </button>
      {pipRoot && createPortal(panel, pipRoot)}
      {fallbackOpen &&
        createPortal(
          <div className="site-search-dialog" role="presentation">
            {panel}
          </div>,
          document.body
        )}
    </>
  )
}
