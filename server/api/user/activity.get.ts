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
    contributionCalendar: {
      weeks: { contributionDays: ContributionDay[] }[]
    }
  }
}

export default defineCachedEventHandler(async (event): Promise<Activity> => {
  const params = getQuery(event)
  const username = params.username as string | undefined
  const requestedDays = Number(params.days) || DEFAULT_ACTIVITY_DAYS
  const days = Math.min(Math.max(requestedDays, MIN_ACTIVITY_DAYS), MAX_ACTIVITY_DAYS)

  const now = new Date()
  const to = now.toISOString()
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()

  const query = `
    url
    contributionsCollection(from: "${from}", to: "${to}") {
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
  const weeks = activity.contributionsCollection.contributionCalendar.weeks

  const daysData: DayData[] = []
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      daysData.push({ date: day.date, count: day.contributionCount })
    }
  }

  return {
    url: activity.url,
    data: daysData,
  }
}, {
  name: 'user-activity',
  maxAge: API_CACHE_MAX_AGE_SECONDS,
  getKey: event => `${cacheKeyForUser(event)}-${getQuery(event).days ?? DEFAULT_ACTIVITY_DAYS}`,
})
