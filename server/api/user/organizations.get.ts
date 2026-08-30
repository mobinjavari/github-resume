import type { Organizations } from '~/../types/user/organizations'
import { API_CACHE_MAX_AGE_SECONDS } from '~/../constants/cache'

interface OrganizationsQueryResult {
  organizations: {
    nodes: Organizations
  }
}

export default defineCachedEventHandler(async (event): Promise<Organizations> => {
  const params = getQuery(event)
  const username = params.username as string | undefined

  const query = `
    organizations(first: 10) {
      nodes {
        name
        login
        description
        url
        avatarUrl
      }
    }
  `

  const result = await fetchGitHub<OrganizationsQueryResult>(query, { username })
  return result.organizations.nodes
}, {
  name: 'user-organizations',
  maxAge: API_CACHE_MAX_AGE_SECONDS,
  getKey: cacheKeyForUser,
})
