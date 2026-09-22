import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyText } from './clipboard'

afterEach(() => vi.unstubAllGlobals())

describe('copyText', () => {
  it('copies through the Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    expect(await copyText('https://yukyu.net/posts/example')).toBe(true)
    expect(writeText).toHaveBeenCalledWith('https://yukyu.net/posts/example')
  })

  it.each(['missing', 'denied', 'unsupported', 'throws'])('handles %s clipboard access', async (mode) => {
    vi.stubGlobal('navigator', mode === 'missing' ? {} : {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) }
    })
    class Element { focus = vi.fn() }
    vi.stubGlobal('HTMLElement', Element)
    const previousFocus = new Element()
    const field = { value: '', readOnly: false, style: { cssText: '' }, select: vi.fn(), remove: vi.fn() }
    const execCommand = vi.fn(() => {
      if (mode === 'throws') throw new Error('unsupported')
      return mode !== 'unsupported'
    })
    vi.stubGlobal('document', {
      activeElement: previousFocus,
      createElement: () => field,
      body: { appendChild: vi.fn() },
      execCommand
    })
    expect(await copyText('https://yukyu.net')).toBe(mode === 'missing' || mode === 'denied')
    expect(field.value).toBe('https://yukyu.net')
    expect(field.select).toHaveBeenCalledOnce()
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(field.remove).toHaveBeenCalledOnce()
    expect(previousFocus.focus).toHaveBeenCalledWith({ preventScroll: true })
  })
})
