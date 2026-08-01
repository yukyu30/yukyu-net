'use client'

import { useLayoutEffect } from 'react'

export function ViewTransitionGuard() {
  useLayoutEffect(() => {
    if (!('startViewTransition' in document)) return

    const original = document.startViewTransition
    const guarded: typeof document.startViewTransition = (...args) => {
      const transition = original.call(document, ...args)
      void transition.ready.catch(() => undefined)
      void transition.updateCallbackDone.catch(() => undefined)
      void transition.finished.catch(() => undefined)
      return transition
    }

    document.startViewTransition = guarded
    return () => {
      if (document.startViewTransition === guarded) {
        document.startViewTransition = original
      }
    }
  }, [])

  return null
}
