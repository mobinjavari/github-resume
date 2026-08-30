import type { Profile, Status } from '~/../types/user/profile'

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
  status: Status | null
  followers: { totalCount: number }
  following: { totalCount: number }
  publicRepos: { totalCount: number }
  gists: { totalCount: number }
  repositories: { nodes: { stargazerCount: number }[] }
  contributionsCollection: { contributionCalendar: { totalContributions: number } }
  createdAt: string
}

export default defineEventHandler(async (event): Promise<Profile> => {
  const params = getQuery(event)
  const username = params.username as string | undefined

  const query = `
    name
    login
    url
    avatarUrl(size: 200)
    bio
    company
    location
    websiteUrl
    email
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
    email: user.email ?? undefined,
    status: user.status ?? undefined,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    repositories: user.publicRepos.totalCount,
    gists: user.gists.totalCount,
    stars,
    contributions: user.contributionsCollection.contributionCalendar.totalContributions,
    createdAt: user.createdAt,
  }
})
