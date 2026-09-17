import type { LanguageReport, LanguageStat } from '~/../types/user/languages'
import { API_CACHE_MAX_AGE_SECONDS } from '~/../constants/cache'

const REPOSITORY_SAMPLE_SIZE = 100
const LANGUAGES_PER_REPOSITORY = 10
const LANGUAGE_REPO_SOURCES = ['owned', 'organizations', 'contributed'] as const
type LanguageRepoSource = typeof LANGUAGE_REPO_SOURCES[number]

interface RepositoryNode {
  nameWithOwner: string
  languages: {
    edges: { size: number, node: { name: string, color: string | null } }[]
  } | null
}

interface LanguagesQueryResult {
  // A node comes back null when the token can see the repo exists (e.g. via
  // org/contribution affiliation) but lacks access to its details — common
  // with fine-grained PATs that only grant specific repos.
  ownedRepositories?: { nodes: (RepositoryNode | null)[] } | null
  organizationRepositories?: { nodes: (RepositoryNode | null)[] } | null
  contributedRepositories?: { nodes: (RepositoryNode | null)[] } | null
}

interface LanguageTotal {
  name: string
  color: string | null
  bytes: number
  repositoryCount: number
}

// Site owner's opt-out for languages they don't want counted at all (build
// tooling configs, generated docs, etc.) — e.g. IGNORED_LANGUAGES=HTML,CSS
function getIgnoredLanguages() {
  return new Set(
    (process.env.IGNORED_LANGUAGES ?? '')
      .split(',')
      .map(language => language.trim().toLowerCase())
      .filter(Boolean),
  )
}

// Site owner's cap on how many languages each ranking panel shows —
// e.g. MAX_LANGUAGES_DISPLAYED=6. 0 (the default) shows every language.
function getMaxLanguagesDisplayed() {
  const limit = Number(process.env.MAX_LANGUAGES_DISPLAYED)
  return Number.isFinite(limit) && limit > 0 ? limit : 0
}

// Which repos count toward Top Languages: "owned" (default) is only repos in the
// user's personal namespace; "organizations" adds repos owned by orgs they belong
// to (needs a token with read:org); "contributed" adds other people's repos they've
// committed or opened PRs against. "all" is shorthand for every source.
function getLanguageRepoSources(): Set<LanguageRepoSource> {
  const requested = (process.env.LANGUAGE_REPO_SOURCES ?? '')
    .split(',')
    .map(source => source.trim().toLowerCase())
    .filter(Boolean)

  if (requested.includes('all')) return new Set(LANGUAGE_REPO_SOURCES)

  const knownSources = requested.filter((source): source is LanguageRepoSource =>
    (LANGUAGE_REPO_SOURCES as readonly string[]).includes(source))
  return knownSources.length > 0 ? new Set(knownSources) : new Set(['owned'])
}

export default defineCachedEventHandler(async (event): Promise<LanguageReport> => {
  const params = getQuery(event)
  const username = params.username as string | undefined
  const ignoredLanguages = getIgnoredLanguages()
  const maxLanguagesDisplayed = getMaxLanguagesDisplayed()
  const repoSources = getLanguageRepoSources()

  const repositoryFields = `
    nameWithOwner
    languages(first: ${LANGUAGES_PER_REPOSITORY}, orderBy: { field: SIZE, direction: DESC }) {
      edges {
        size
        node {
          name
          color
        }
      }
    }
  `
  const repositoryOrder = 'orderBy: { field: PUSHED_AT, direction: DESC }'

  const queryFields: string[] = []
  if (repoSources.has('owned')) {
    queryFields.push(`ownedRepositories: repositories(first: ${REPOSITORY_SAMPLE_SIZE}, ownerAffiliations: OWNER, isFork: false, ${repositoryOrder}) { nodes { ${repositoryFields} } }`)
  }
  if (repoSources.has('organizations')) {
    queryFields.push(`organizationRepositories: repositories(first: ${REPOSITORY_SAMPLE_SIZE}, ownerAffiliations: ORGANIZATION_MEMBER, isFork: false, ${repositoryOrder}) { nodes { ${repositoryFields} } }`)
  }
  if (repoSources.has('contributed')) {
    queryFields.push(`contributedRepositories: repositoriesContributedTo(first: ${REPOSITORY_SAMPLE_SIZE}, contributionTypes: [COMMIT, PULL_REQUEST], ${repositoryOrder}) { nodes { ${repositoryFields} } }`)
  }

  const result = await fetchGitHub<LanguagesQueryResult>(queryFields.join('\n'), { username })

  // nameWithOwner ("owner/repo") is globally unique, so it doubles as the
  // dedup key for repos that show up in more than one source (e.g. an org
  // repo you've also committed to, when both sources are enabled).
  const seenRepositories = new Set<string>()
  const repositories: RepositoryNode[] = []
  for (const list of [result.ownedRepositories, result.organizationRepositories, result.contributedRepositories]) {
    for (const repo of list?.nodes ?? []) {
      if (!repo || seenRepositories.has(repo.nameWithOwner)) continue
      seenRepositories.add(repo.nameWithOwner)
      repositories.push(repo)
    }
  }

  const languageTotals = new Map<string, { color: string | null, bytes: number, repositories: Set<string> }>()
  let mostPolyglotRepository: LanguageReport['mostPolyglotRepository'] = null

  for (const repo of repositories) {
    const repoLanguages = (repo.languages?.edges ?? [])
      .filter(({ node }) => !ignoredLanguages.has(node.name.toLowerCase()))

    if (repoLanguages.length > (mostPolyglotRepository?.languageCount ?? 1)) {
      mostPolyglotRepository = { name: repo.nameWithOwner, languageCount: repoLanguages.length }
    }

    for (const { size, node } of repoLanguages) {
      const existing = languageTotals.get(node.name)
      if (existing) {
        existing.bytes += size
        existing.repositories.add(repo.nameWithOwner)
      }
      else {
        languageTotals.set(node.name, { color: node.color, bytes: size, repositories: new Set([repo.nameWithOwner]) })
      }
    }
  }

  const totalBytes = [...languageTotals.values()].reduce((sum, { bytes }) => sum + bytes, 0)
  const totalRepositoryCount = repositories.length

  const languages: LanguageTotal[] = [...languageTotals.entries()]
    .map(([name, { color, bytes, repositories: repoNames }]) => ({
      name,
      color,
      bytes,
      repositoryCount: repoNames.size,
    }))

  const rankLanguages = (metric: (language: LanguageTotal) => number, total: number): LanguageStat[] => {
    const ranked = [...languages]
      .sort((a, b) => metric(b) - metric(a))
      .map(language => ({ ...language, percentage: total > 0 ? Math.round((metric(language) / total) * 100) : 0 }))
    return maxLanguagesDisplayed > 0 ? ranked.slice(0, maxLanguagesDisplayed) : ranked
  }

  return {
    languagesBySize: rankLanguages(language => language.bytes, totalBytes),
    // Not a mutually exclusive share (a repo can use several languages), so
    // this percentage is an adoption rate per language, not a part-to-whole split.
    languagesByRepositoryCount: rankLanguages(language => language.repositoryCount, totalRepositoryCount),
    totalLanguageCount: languages.length,
    totalBytes,
    totalRepositoryCount,
    mostPolyglotRepository,
  }
}, {
  // Bump this suffix whenever the response shape changes — see user-activity-v2
  // for why: a stale, differently-shaped cache entry would otherwise linger
  // until it naturally expires.
  name: 'user-languages-v3',
  maxAge: API_CACHE_MAX_AGE_SECONDS,
  getKey: cacheKeyForUser,
})
