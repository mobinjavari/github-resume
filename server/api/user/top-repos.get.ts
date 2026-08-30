import type { Repositories } from '~/../types/user/repository'
import { API_CACHE_MAX_AGE_SECONDS } from '~/../constants/cache'

const TOP_REPOS_LIMIT = 6

interface TopReposQueryResult {
  repositories: {
    nodes: Repositories
  } | null
}

export default defineCachedEventHandler(async (event): Promise<Repositories> => {
  const params = getQuery(event)
  const username = params.username as string | undefined

  const query = `
    repositories(first: ${TOP_REPOS_LIMIT}, ownerAffiliations: OWNER, isFork: false, orderBy: { field: STARGAZERS, direction: DESC }) {
      nodes {
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
  `

  const result = await fetchGitHub<TopReposQueryResult>(query, { username })
  return result.repositories?.nodes ?? []
}, {
  name: 'user-top-repos',
  maxAge: API_CACHE_MAX_AGE_SECONDS,
  getKey: cacheKeyForUser,
})
