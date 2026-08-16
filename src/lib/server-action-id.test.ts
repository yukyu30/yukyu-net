import { describe, expect, it } from 'vitest'
import {
  MIN_SERVER_ACTION_ID_LENGTH,
  isMalformedServerActionId
} from './server-action-id'

describe('isMalformedServerActionId', () => {
  it('rejects common bot probe values', () => {
    expect(isMalformedServerActionId('x')).toBe(true)
    expect(isMalformedServerActionId('test')).toBe(true)
    expect(isMalformedServerActionId('')).toBe(true)
    expect(isMalformedServerActionId('   ')).toBe(true)
  })

  it('accepts IDs at or above the minimum length', () => {
    const borderline = 'a'.repeat(MIN_SERVER_ACTION_ID_LENGTH)
    const realistic =
      '7fef8ef258cb9f0948e1b65bda8c999a8a41645584'

    expect(isMalformedServerActionId(borderline)).toBe(false)
    expect(isMalformedServerActionId(realistic)).toBe(false)
  })
})
