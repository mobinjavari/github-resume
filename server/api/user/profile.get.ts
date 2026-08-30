import type { Profile, Status } from '~/../types/user/profile'
import { API_CACHE_MAX_AGE_SECONDS } from '~/../constants/cache'

interface ProfileQueryResult {
  name: string
  login: string
  url: string
  avatarUrl: string
  bio: string | null
  company: string | null
  location: string | null
  websiteUrl: string | null
  email: string | null
  twitterUsername: string | null
  status: Status | null
  followers: { totalCount: number } | null
  following: { totalCount: number } | null
  publicRepos: { totalCount: number } | null
  repositories: { nodes: { stargazerCount: number }[] } | null
  contributionsCollection: { contributionCalendar: { totalContributions: number } } | null
  createdAt: string
}

interface GistsQueryResult {
  gists: { totalCount: number } | null
}

// GitHub's `gists` field is non-nullable in its schema, so a scope error on it
// (the `gist` scope isn't granted to most tokens) nulls out the entire parent
// object, not just this field. Fetching it as its own request keeps a missing
// `gist` scope from taking down the rest of the profile.
async function fetchGistsCount(username: string | undefined) {
  try {
    const result = await fetchGitHub<GistsQueryResult>('gists(privacy: PUBLIC) { totalCount }', { username })
    return result.gists?.totalCount ?? 0
  }
  catch {
    return 0
  }
}

export default defineCachedEventHandler(async (event): Promise<Profile> => {
  const params = getQuery(event)
  const username = params.username as string | undefined
  // Read directly from process.env: a value pulled from process.env inside
  // nuxt.config.ts is baked in at build time, so it wouldn't react to this
  // being toggled only when the built server actually starts.
  const showEmail = process.env.SHOW_EMAIL === 'true'

  const query = `
    name
    login
    url
    avatarUrl(size: 200)
    bio
    company
    location
    websiteUrl
    ${showEmail ? 'email' : ''}
    twitterUsername
    status {
      message
      emojiHTML
      indicatesLimitedAvailability
    }
    followers {
      totalCount
    }
    following {
      totalCount
    }
    publicRepos: repositories(privacy: PUBLIC) {
      totalCount
    }
    repositories(ownerAffiliations: OWNER, first: 100) {
      nodes {
        stargazerCount
      }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
      }
    }
    createdAt
  `

  const [user, gists] = await Promise.all([
    fetchGitHub<ProfileQueryResult>(query, { username }),
    fetchGistsCount(username),
  ])
  // Each of these can come back null if the token lacks the scope for that
  // one field — GitHub still returns the rest of the profile, so default the
  // missing piece instead of failing.
  const stars = (user.repositories?.nodes ?? []).reduce((total, repo) => total + repo.stargazerCount, 0)

  return {
    name: user.name,
    login: user.login,
    url: user.url,
    avatarUrl: user.avatarUrl,
    bio: user.bio?.trim(),
    company: user.company ?? undefined,
    location: user.location ?? undefined,
    websiteUrl: user.websiteUrl ?? undefined,
    email: showEmail ? (user.email ?? undefined) : undefined,
    twitterUsername: user.twitterUsername ?? undefined,
    status: user.status ?? undefined,
    followers: user.followers?.totalCount ?? 0,
    following: user.following?.totalCount ?? 0,
    repositories: user.publicRepos?.totalCount ?? 0,
    gists,
    stars,
    contributions: user.contributionsCollection?.contributionCalendar.totalContributions ?? 0,
    createdAt: user.createdAt,
  }
}, {
  name: 'user-profile',
  maxAge: API_CACHE_MAX_AGE_SECONDS,
  getKey: cacheKeyForUser,
})
