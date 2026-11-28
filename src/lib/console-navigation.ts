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

export const IDLE: Navigation = { phase: 'idle' }

function depart(state: Extract<Navigation, { phase: 'departing' }>): Navigation {
  return state.arrived && state.wound ? { phase: 'diving', href: state.href } : state
}

export function reduceNavigation(state: Navigation, event: NavigationEvent): Navigation {
  switch (state.phase) {
    case 'idle':
      return event.type === 'press' ? { phase: 'departing', href: event.href, arrived: false, wound: false } : state
    case 'departing':
      if (event.type === 'wound') return depart({ ...state, wound: true })
      if (event.type !== 'route' || event.pathname === HOME) return state
      return event.pathname === state.href ? depart({ ...state, arrived: true }) : IDLE
    case 'diving':
      if (event.type === 'landed') return IDLE
      return event.type === 'route' && event.pathname !== state.href ? IDLE : state
  }
}
