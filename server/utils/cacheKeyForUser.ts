import type { H3Event } from 'h3'

export function cacheKeyForUser(event: H3Event) {
  const params = getQuery(event)
  return (params.username as string | undefined) ?? 'viewer'
}
