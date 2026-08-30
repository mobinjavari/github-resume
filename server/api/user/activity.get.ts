import type { Activity, DayData } from '~/../types/user/activity'
import { DEFAULT_ACTIVITY_DAYS, MIN_ACTIVITY_DAYS, MAX_ACTIVITY_DAYS } from '~/../constants/activity'
import { API_CACHE_MAX_AGE_SECONDS } from '~/../constants/cache'

interface ContributionDay {
  date: string
  contributionCount: number
}

interface ActivityQueryResult {
  url: string
  contributionsCollection: {
    totalCommitContributions: number
    totalIssueContributions: number
    totalPullRequestContributions: number
    totalPullRequestReviewContributions: number
    contributionYears: number[]
    contributionCalendar: {
      weeks: { contributionDays: ContributionDay[] }[]
    }
  } | null
}

// A `year` param selects a full calendar year; otherwise falls back to a
// rolling window of `days` ending now (clamped to a sane range).
function resolveDateRange(params: Record<string, unknown>) {
  const year = Number(params.year)
  if (Number.isInteger(year)) {
    return {
      from: new Date(Date.UTC(year, 0, 1)).toISOString(),
      to: new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString(),
    }
  }

  const requestedDays = Number(params.days) || DEFAULT_ACTIVITY_DAYS
  const days = Math.min(Math.max(requestedDays, MIN_ACTIVITY_DAYS), MAX_ACTIVITY_DAYS)
  const now = new Date()
  return {
    from: new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString(),
    to: now.toISOString(),
  }
}

export default defineCachedEventHandler(async (event): Promise<Activity> => {
  const params = getQuery(event)
  const username = params.username as string | undefined
  const { from, to } = resolveDateRange(params)

  const query = `
    url
    contributionsCollection(from: "${from}", to: "${to}") {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      contributionYears
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  `

  const activity = await fetchGitHub<ActivityQueryResult>(query, { username })
  const collection = activity.contributionsCollection
  const weeks = collection?.contributionCalendar.weeks ?? []

  const daysData: DayData[] = []
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      daysData.push({ date: day.date, count: day.contributionCount })
    }
  }

  return {
    url: activity.url,
    data: daysData,
    breakdown: {
      commits: collection?.totalCommitContributions ?? 0,
      pullRequests: collection?.totalPullRequestContributions ?? 0,
      issues: collection?.totalIssueContributions ?? 0,
      reviews: collection?.totalPullRequestReviewContributions ?? 0,
    },
    availableYears: collection?.contributionYears ?? [],
  }
}, {
  // Bump this suffix whenever the Activity response shape changes — the cache
  // is keyed by name, so a stale, differently-shaped entry from before the
  // change would otherwise keep being served until it naturally expires.
  name: 'user-activity-v2',
  maxAge: API_CACHE_MAX_AGE_SECONDS,
  getKey: event => `${cacheKeyForUser(event)}-${getQuery(event).year ?? getQuery(event).days ?? DEFAULT_ACTIVITY_DAYS}`,
})
