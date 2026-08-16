/**
 * Heuristic for rejecting obviously malformed Server Action IDs.
 *
 * Real Next.js action IDs are long, non-deterministic strings. Probe traffic
 * often sends values like `x` or `test`, which still cold-start serverless
 * containers and log "Failed to find Server Action".
 *
 * Keep this conservative: only reject short IDs so legitimate format changes
 * are unlikely to break real clients.
 */
export const MIN_SERVER_ACTION_ID_LENGTH = 10

export function isMalformedServerActionId(actionId: string): boolean {
  return actionId.trim().length < MIN_SERVER_ACTION_ID_LENGTH
}
