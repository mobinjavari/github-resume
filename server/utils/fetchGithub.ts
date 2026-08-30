interface GraphQLError {
  message: string
}

interface GraphQLResponse<T> {
  data?: { user?: T, viewer?: T }
  errors?: GraphQLError[]
}

export async function fetchGitHub<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  // Read directly from process.env (not runtimeConfig): a value pulled from
  // process.env inside nuxt.config.ts is baked in at build time, so it would
  // never see a token supplied only when the built server actually starts.
  const token = process.env.GITHUB_TOKEN

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

  // GraphQL can return partial data alongside field-level errors (e.g. a scope
  // the token lacks for just one field) — only treat it as fatal when there's
  // no usable data at all, not whenever the errors array is non-empty.
  if (response.errors) {
    console.error('GitHub GraphQL API returned errors:', response.errors)
  }

  const result = isUserLookup ? response.data?.user : response.data?.viewer
  if (!result) {
    throw createError({
      statusCode: response.errors ? 502 : 404,
      statusMessage: response.errors ? 'Failed to fetch data from GitHub' : 'GitHub user not found',
    })
  }

  return result
}
