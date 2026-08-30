// GitHub GraphQL API is rate-limited per token; caching keeps every visitor
// from triggering a fresh call, since this profile data rarely changes minute-to-minute.
export const API_CACHE_MAX_AGE_SECONDS = 600
