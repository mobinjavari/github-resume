interface GraphQLError {
  message: string
}

interface GraphQLResponse<T> {
  data?: { user?: T, viewer?: T }
  errors?: GraphQLError[]
}

export async function fetchGitHub<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const config = useRuntimeConfig()
  const token = config.githubToken

  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GITHUB_TOKEN is missing in environment variables',
    })
  }

  const isUserLookup = typeof variables.username === 'string'
  const wrappedQuery = isUserLookup
    ? `query ($username: String!) { user (login: $username) { ${query} } }`
    : `query { viewer { ${query} } }`

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Nuxt-GitHub-App',
    },
    body: JSON.stringify({ query: wrappedQuery, variables }),
  })

  if (!res.ok) {
    throw createError({
      statusCode: res.status,
      statusMessage: 'GitHub API Authentication Error',
    })
  }

  const response: GraphQLResponse<T> = await res.json()

  if (response.errors) {
    console.error('GitHub GraphQL API returned errors:', response.errors)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch data from GitHub',
    })
  }

  const result = isUserLookup ? response.data?.user : response.data?.viewer
  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: 'GitHub user not found',
    })
  }

  return result
}
