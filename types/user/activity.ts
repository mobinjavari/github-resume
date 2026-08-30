export interface DayData {
  date: string
  count: number
}

export interface ContributionBreakdown {
  commits: number
  pullRequests: number
  issues: number
  reviews: number
}

export interface Activity {
  url: string
  data: DayData[]
  breakdown: ContributionBreakdown
  availableYears: number[]
}
