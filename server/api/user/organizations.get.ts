import type { Organizations } from '~/../types/user/organizations'

export default defineEventHandler(async (event) => {
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

    const data = await fetchGitHub(query, { username })
    const orgs = data.organizations.nodes

    return <Organizations> orgs
})