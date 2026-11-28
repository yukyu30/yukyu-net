import { describe, expect, it } from 'vitest'
import { IDLE, reduceNavigation, type Navigation, type NavigationEvent } from './console-navigation'

const run = (events: NavigationEvent[], from: Navigation = IDLE) => events.reduce(reduceNavigation, from)

describe('reduceNavigation', () => {
  it('ボタンを押すと出発する', () => {
    expect(run([{ type: 'press', href: '/posts' }])).toEqual({ phase: 'departing', href: '/posts', arrived: false, wound: false })
  })

  it('出発後の二度押しは無視する', () => {
    const state = run([{ type: 'press', href: '/posts' }, { type: 'press', href: '/works' }])
    expect(state).toMatchObject({ phase: 'departing', href: '/posts' })
  })

  it('溜めが終わっただけでは飛び込まない', () => {
    expect(run([{ type: 'press', href: '/posts' }, { type: 'wound' }])).toMatchObject({ phase: 'departing', wound: true })
  })

  it('行き先に着いただけでは飛び込まない', () => {
    expect(run([{ type: 'press', href: '/posts' }, { type: 'route', pathname: '/posts' }])).toMatchObject({ phase: 'departing', arrived: true })
  })

  it('溜めと到着が揃うと、順番によらず飛び込む', () => {
    const diving = { phase: 'diving', href: '/posts' }
    expect(run([{ type: 'press', href: '/posts' }, { type: 'wound' }, { type: 'route', pathname: '/posts' }])).toEqual(diving)
    expect(run([{ type: 'press', href: '/posts' }, { type: 'route', pathname: '/posts' }, { type: 'wound' }])).toEqual(diving)
  })

  it('ホームのままのルート通知では出発を続ける', () => {
    expect(run([{ type: 'press', href: '/posts' }, { type: 'route', pathname: '/' }])).toMatchObject({ phase: 'departing', arrived: false })
  })

  it('着いたあと溜めの途中でホームへ戻ると待機に戻る', () => {
    const state = run([{ type: 'press', href: '/posts' }, { type: 'route', pathname: '/posts' }, { type: 'route', pathname: '/' }, { type: 'wound' }])
    expect(state).toEqual(IDLE)
  })

  it('行き先に着かないまま時間切れになると待機に戻る', () => {
    expect(run([{ type: 'press', href: '/posts' }, { type: 'wound' }, { type: 'expired' }])).toEqual(IDLE)
  })

  it('飛び込みの途中で時間切れになると待機に戻る', () => {
    expect(run([{ type: 'expired' }], { phase: 'diving', href: '/posts' })).toEqual(IDLE)
  })

  it('着地すると待機に戻る', () => {
    expect(run([{ type: 'landed' }], { phase: 'diving', href: '/posts' })).toEqual(IDLE)
  })

  it('途中で別のルートへ移ると待機に戻る', () => {
    expect(run([{ type: 'press', href: '/posts' }, { type: 'route', pathname: '/tags' }])).toEqual(IDLE)
    expect(run([{ type: 'route', pathname: '/' }], { phase: 'diving', href: '/posts' })).toEqual(IDLE)
  })

  it('待機中は押下以外を無視する', () => {
    expect(run([{ type: 'wound' }, { type: 'landed' }, { type: 'expired' }, { type: 'route', pathname: '/posts' }])).toBe(IDLE)
  })
})
