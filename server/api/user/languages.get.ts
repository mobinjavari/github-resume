import type { Languages } from '~/../types/user/languages'
import { API_CACHE_MAX_AGE_SECONDS } from '~/../constants/cache'

const REPOSITORY_SAMPLE_SIZE = 100
const LANGUAGES_PER_REPOSITORY = 10
const TOP_LANGUAGES_LIMIT = 5

interface LanguagesQueryResult {
  repositories: {
    nodes: {
      languages: {
        edges: { size: number, node: { name: string, color: string | null } }[]
      } | null
    }[]
  } | null
}

export default defineCachedEventHandler(async (event): Promise<Languages> => {
  const params = getQuery(event)
  const username = params.username as string | undefined

  const query = `
    repositories(first: ${REPOSITORY_SAMPLE_SIZE}, ownerAffiliations: OWNER, isFork: false) {
      nodes {
        languages(first: ${LANGUAGES_PER_REPOSITORY}, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
      }
    }
  `

  const result = await fetchGitHub<LanguagesQueryResult>(query, { username })

  const sizeByLanguage = new Map<string, { size: number, color: string | null }>()
  for (const repo of result.repositories?.nodes ?? []) {
    for (const { size, node } of repo.languages?.edges ?? []) {
      const existing = sizeByLanguage.get(node.name)
      sizeByLanguage.set(node.name, { size: (existing?.size ?? 0) + size, color: node.color })
    }
  }

  const totalSize = [...sizeByLanguage.values()].reduce((sum, { size }) => sum + size, 0)
  if (totalSize === 0) return []

  const sortedLanguages = [...sizeByLanguage.entries()].sort(([, a], [, b]) => b.size - a.size)
  const topLanguages = sortedLanguages.slice(0, TOP_LANGUAGES_LIMIT)
  const otherSize = sortedLanguages.slice(TOP_LANGUAGES_LIMIT).reduce((sum, [, { size }]) => sum + size, 0)

  const languages: Languages = topLanguages.map(([name, { size, color }]) => ({
    name,
    color,
    percentage: Math.round((size / totalSize) * 100),
  }))

  if (otherSize > 0) {
    languages.push({ name: 'Other', color: null, percentage: Math.round((otherSize / totalSize) * 100) })
  }

  return languages
}, {
  name: 'user-languages',
  maxAge: API_CACHE_MAX_AGE_SECONDS,
  getKey: cacheKeyForUser,
})
