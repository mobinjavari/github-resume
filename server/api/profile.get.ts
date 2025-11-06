import { fetchGitHub } from '../utils/fetchGithub'
import { Profile } from '../../types/profile'

export default defineEventHandler(async (event) => {
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

  const user = await fetchGitHub(query, { username })
  const stars = user.repositories.nodes.reduce(
    (acc: number, repo: { stargazerCount: number }) => acc + repo.stargazerCount,
    0
  )

  return <Profile>{
    name: user.name,
    login: user.login,
    url: user.url,
    avatarUrl: user.avatarUrl,
    bio: user.bio?.trim(),
    company: user.company,
    location: user.location,
    websiteUrl: user.websiteUrl,
    email: user.email,
    status: user.status,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    repositories: user.publicRepos.totalCount,
    gists: user.gists.totalCount,
    stars,
    contributions: user.contributionsCollection.contributionCalendar.totalContributions,
    createdAt: user.createdAt,
  }
})
