export async function fetchGitHub(query: string, variables: Record<string, any> = {}) {
  const config = useRuntimeConfig()
  const token = config.GITHUB_TOKEN

  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GITHUB_TOKEN is missing in environment variables'
    })
  }

  query = variables.username 
    ? `query ($username: String!) { user (login: $username) { ${query} } }`
    : `query () { viewer { ${query} } }`

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Nuxt-GitHub-App',
    },
    body: JSON.stringify({ query, variables }),
  })

  const data = await res.json()
  if (res.status > 200) {
    throw createError({
      statusCode: res.status,
      statusMessage: 'GitHub API Authentication Error'
    })
  }
  else if (data.errors) {
    throw createError({
      statusCode: 500,
      statusMessage: data.errors.map((e: any) => e.message).join(', ')
    })
  }

  return variables.username ? data?.data?.user : data?.data?.viewer
}
