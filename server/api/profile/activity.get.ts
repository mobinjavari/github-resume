import { fetchGitHub } from '../../utils/fetchGithub'
import type { activity, DayData } from '../../../types/profile/activity'

export default defineEventHandler(async (event) => {
  const params = getQuery(event)
  const username = params.username as string | undefined
  const days = Number(params.days) || 30

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

  const activity = await fetchGitHub(query, { username })
  const weeks = activity?.contributionsCollection?.contributionCalendar?.weeks || []

  const daysData: DayData[] = []
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      daysData.push({ date: day.date, count: day.contributionCount })
    }
  }

  return <activity> {
    url: activity?.url,
    data: daysData
  }
})
