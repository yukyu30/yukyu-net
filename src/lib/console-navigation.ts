const HOME = '/'

export type Navigation =
  | { phase: 'idle' }
  | { phase: 'departing'; href: string; arrived: boolean; wound: boolean }
  | { phase: 'diving'; href: string }

export type NavigationEvent =
  | { type: 'press'; href: string }
  | { type: 'wound' }
  | { type: 'route'; pathname: string }
  | { type: 'landed' }
  | { type: 'expired' }

export const IDLE: Navigation = { phase: 'idle' }

function depart(state: Extract<Navigation, { phase: 'departing' }>): Navigation {
  return state.arrived && state.wound ? { phase: 'diving', href: state.href } : state
}

export function reduceNavigation(state: Navigation, event: NavigationEvent): Navigation {
  switch (state.phase) {
    case 'idle':
      return event.type === 'press' ? { phase: 'departing', href: event.href, arrived: false, wound: false } : state
    case 'departing':
      if (event.type === 'expired') return IDLE
      if (event.type === 'wound') return depart({ ...state, wound: true })
      if (event.type !== 'route') return state
      if (event.pathname === state.href) return depart({ ...state, arrived: true })
      return event.pathname === HOME && !state.arrived ? state : IDLE
    case 'diving':
      if (event.type === 'landed' || event.type === 'expired') return IDLE
      return event.type === 'route' && event.pathname !== state.href ? IDLE : state
  }
}
