import type { Organizations } from '~/../types/user/organizations'

interface OrganizationsQueryResult {
  organizations: {
    nodes: Organizations
  }
}

export default defineEventHandler(async (event): Promise<Organizations> => {
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
})
