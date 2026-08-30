import type { Repositories } from '~/../types/user/repository'
import { API_CACHE_MAX_AGE_SECONDS } from '~/../constants/cache'

const PINNED_REPOS_LIMIT = 6

interface PinnedReposQueryResult {
  pinnedItems: {
    nodes: Repositories
  } | null
}

export default defineCachedEventHandler(async (event): Promise<Repositories> => {
  const params = getQuery(event)
  const username = params.username as string | undefined

  const query = `
    pinnedItems(first: ${PINNED_REPOS_LIMIT}, types: [REPOSITORY]) {
      nodes {
        ... on Repository {
          name
          description
          url
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
        }
      }
    }
  `

  const result = await fetchGitHub<PinnedReposQueryResult>(query, { username })
  return result.pinnedItems?.nodes ?? []
}, {
  name: 'user-pinned-repos',
  maxAge: API_CACHE_MAX_AGE_SECONDS,
  getKey: cacheKeyForUser,
})
