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
  followers: { totalCount: number }
  following: { totalCount: number }
  publicRepos: { totalCount: number }
  gists: { totalCount: number }
  repositories: { nodes: { stargazerCount: number }[] }
  contributionsCollection: { contributionCalendar: { totalContributions: number } }
  createdAt: string
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
    gists(privacy: PUBLIC) {
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

  const user = await fetchGitHub<ProfileQueryResult>(query, { username })
  const stars = user.repositories.nodes.reduce((total, repo) => total + repo.stargazerCount, 0)

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
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    repositories: user.publicRepos.totalCount,
    gists: user.gists.totalCount,
    stars,
    contributions: user.contributionsCollection.contributionCalendar.totalContributions,
    createdAt: user.createdAt,
  }
}, {
  name: 'user-profile',
  maxAge: API_CACHE_MAX_AGE_SECONDS,
  getKey: cacheKeyForUser,
})
