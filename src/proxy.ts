import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { isMalformedServerActionId } from '@/lib/server-action-id'

/**
 * Reject obviously malformed Server Action probes before they reach the
 * action handler and produce noisy "Failed to find Server Action" logs.
 */
export function proxy(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.next()
  }

  const actionId = request.headers.get('next-action')
  if (!actionId || !isMalformedServerActionId(actionId)) {
    return NextResponse.next()
  }

  return new NextResponse('Bad Request', { status: 400 })
}

export const config = {
  matcher: [
    {
      source: '/:path*',
      has: [{ type: 'header', key: 'next-action' }]
    }
  ]
}
