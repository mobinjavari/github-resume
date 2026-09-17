<template>
  <Section
    v-if="pending || error || weeks.length"
    :pending="pending"
    :error="error"
    title="Contribution Activity"
    :icon="GraphIcon"
  >
    <div class="flex gap-1.5 mb-4 overflow-x-auto">
      <button
        v-for="period in periods"
        :key="period.value"
        type="button"
        class="flex-none whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium border transition-colors"
        :class="period.value === selectedPeriod
          ? 'bg-theme-800 text-theme-50 border-theme-800 dark:bg-theme-100 dark:text-theme-900 dark:border-theme-100'
          : 'bg-theme-100 dark:bg-theme-950 border-theme-200 dark:border-theme-800 text-theme-600 dark:text-theme-400 hover:border-theme-400/50'"
        @click="selectPeriod(period.value)"
      >
        {{ period.label }}
      </button>
    </div>

    <div class="flex gap-2 mb-4 overflow-x-auto">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex-none whitespace-nowrap rounded-full bg-theme-100 dark:bg-theme-950 border border-theme-200 dark:border-theme-800 px-4 py-2 flex items-center gap-2 text-[11px]"
      >
        <span class="text-theme-500 dark:text-theme-400">{{ stat.label }}</span>
        <span class="text-sm font-semibold">{{ stat.value }}</span>
      </div>
    </div>

    <p
      v-if="busiestDay"
      class="text-xs text-theme-600 dark:text-theme-400 mb-4"
    >
      <FlameIcon class="inline-block size-3.5 mr-1 align-text-bottom text-warning-500" />
      Most active day: <span class="font-semibold text-theme-800 dark:text-theme-100">{{ formatDisplayDate(busiestDay.date) }}</span> with <span class="font-semibold text-theme-800 dark:text-theme-100">{{ busiestDay.count }}</span> contributions
    </p>

    <div class="overflow-x-auto">
      <div class="w-fit mx-auto">
        <div
          role="img"
          :aria-label="`Contribution heatmap: ${totalContributions} contributions`"
          class="inline-flex gap-1"
        >
          <div class="flex flex-col gap-0.5 pt-[14px] text-[9px] leading-none text-theme-500 dark:text-theme-400">
            <span
              v-for="(label, index) in WEEKDAY_LABELS"
              :key="index"
              class="h-2.5 flex items-center"
            >
              {{ label }}
            </span>
          </div>

          <div class="flex flex-col gap-0.5">
            <div class="flex gap-0.5 text-[10px] leading-none text-theme-500 dark:text-theme-400">
              <span
                v-for="(label, weekIndex) in monthLabels"
                :key="weekIndex"
                class="w-2.5 flex-none whitespace-nowrap"
              >
                {{ label }}
              </span>
            </div>

            <div class="flex gap-0.5">
              <div
                v-for="(week, weekIndex) in weeks"
                :key="weekIndex"
                class="flex flex-col gap-0.5"
              >
                <template
                  v-for="(cell, dayIndex) in week"
                  :key="dayIndex"
                >
                  <a
                    v-if="cell"
                    :href="cell.href"
                    target="_blank"
                    rel="noopener"
                    :title="`${cell.count} contributions on ${cell.date}`"
                    class="size-2.5 rounded-sm block"
                    :class="LEVEL_CLASSES[cell.level]"
                  />
                  <span
                    v-else
                    class="size-2.5 rounded-sm block"
                    :class="LEVEL_CLASSES[0]"
                  />
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-theme-500 dark:text-theme-400">
      <span>Less</span>
      <span
        v-for="level in LEVEL_CLASSES"
        :key="level"
        class="size-2.5 rounded-sm"
        :class="level"
      />
      <span>More</span>
    </div>

    <div
      v-if="monthlyTotals.length"
      class="mt-6 pt-5 border-t border-theme-200 dark:border-theme-800"
    >
      <h4 class="text-xs font-semibold text-theme-600 dark:text-theme-400 mb-3">
        Monthly trend
      </h4>
      <div class="flex items-end gap-1.5 h-16">
        <div
          v-for="month in monthlyTotals"
          :key="month.key"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <div
            class="w-full max-w-4 rounded-t-sm bg-success-500 dark:bg-success-500"
            :title="`${month.count} contributions in ${month.label}`"
            :style="{ height: `${month.barHeight}px` }"
          />
          <span class="text-[9px] text-theme-500 dark:text-theme-400">{{ month.label }}</span>
        </div>
      </div>
    </div>
  </Section>
</template>

<script setup lang="ts">
import Section from '~/components/ui/Section.vue'
import GraphIcon from '~/components/icons/GraphIcon.vue'
import FlameIcon from '~/components/icons/FlameIcon.vue'
import type { Activity, ContributionBreakdown, DayData } from '~~/types/user/activity'
import { MAX_ACTIVITY_DAYS } from '~~/constants/activity'

const LEVEL_CLASSES = [
  'bg-theme-200 dark:bg-theme-800',
  'bg-success-200 dark:bg-success-900',
  'bg-success-400 dark:bg-success-700',
  'bg-success-600 dark:bg-success-500',
  'bg-success-800 dark:bg-success-400',
]

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// A 3-letter label needs more than one week-column of width to avoid overlapping its neighbor.
const MIN_WEEKS_BETWEEN_MONTH_LABELS = 3
// Sunday-first row order; only every other label is shown so they don't crowd the 10px rows.
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const ROLLING_PERIOD = 'rolling'
const MONTHLY_CHART_MAX_HEIGHT = 60

interface HeatmapCell {
  date: string
  count: number
  level: number
  href: string
}

function levelFor(count: number, maxCount: number) {
  if (count === 0) return 0
  const ratio = count / maxCount
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

function dateToUtcDay(date: string) {
  return new Date(`${date}T00:00:00Z`)
}

function formatDisplayDate(date: string) {
  return dateToUtcDay(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

// Today (the last entry) is still in progress, so a zero there shouldn't
// break an otherwise-ongoing streak the way an earlier zero day would.
function computeStreaks(days: DayData[]) {
  let longest = 0
  let running = 0
  for (const day of days) {
    running = day.count > 0 ? running + 1 : 0
    longest = Math.max(longest, running)
  }

  let current = 0
  let index = days.length - 1
  if (index >= 0 && days[index]!.count === 0) index--
  while (index >= 0 && days[index]!.count > 0) {
    current++
    index--
  }

  return { current, longest }
}

function aggregateByMonth(days: DayData[]) {
  const totals = new Map<string, number>()
  for (const day of days) {
    const utcDate = dateToUtcDay(day.date)
    const key = `${utcDate.getUTCFullYear()}-${utcDate.getUTCMonth()}`
    totals.set(key, (totals.get(key) ?? 0) + day.count)
  }

  const entries = [...totals.entries()].sort(([a], [b]) => {
    const [aYear, aMonth] = a.split('-').map(Number)
    const [bYear, bMonth] = b.split('-').map(Number)
    return aYear! - bYear! || aMonth! - bMonth!
  })
  const maxCount = Math.max(1, ...entries.map(([, count]) => count))

  return entries.map(([key, count]) => ({
    key,
    label: MONTH_NAMES[Number(key.split('-')[1])]!,
    count,
    barHeight: Math.max(4, Math.round((count / maxCount) * MONTHLY_CHART_MAX_HEIGHT)),
  }))
}

const weeks = ref<(HeatmapCell | null)[][]>([])
const monthLabels = ref<string[]>([])
const monthlyTotals = ref<ReturnType<typeof aggregateByMonth>>([])
const busiestDay = ref<DayData | null>(null)
const totalContributions = ref(0)
const currentStreak = ref(0)
const longestStreak = ref(0)
const breakdown = ref<ContributionBreakdown>({ commits: 0, pullRequests: 0, issues: 0, reviews: 0 })
const selectedPeriod = ref<string | number>(ROLLING_PERIOD)
const periods = ref<{ label: string, value: string | number }[]>([{ label: 'Last year', value: ROLLING_PERIOD }])
const pending = ref(true)
const error = ref<unknown>(null)

// A stat with nothing to report (e.g. no reviews ever left) is noise, not signal.
const stats = computed(() => [
  { label: 'Contributions', raw: totalContributions.value, value: totalContributions.value.toLocaleString('en-US') },
  { label: 'Current Streak', raw: currentStreak.value, value: `${currentStreak.value}d` },
  { label: 'Longest Streak', raw: longestStreak.value, value: `${longestStreak.value}d` },
  { label: 'Commits', raw: breakdown.value.commits, value: breakdown.value.commits.toLocaleString('en-US') },
  { label: 'Pull Requests', raw: breakdown.value.pullRequests, value: breakdown.value.pullRequests.toLocaleString('en-US') },
  { label: 'Issues', raw: breakdown.value.issues, value: breakdown.value.issues.toLocaleString('en-US') },
  { label: 'Reviews', raw: breakdown.value.reviews, value: breakdown.value.reviews.toLocaleString('en-US') },
].filter(stat => stat.raw > 0))

function selectPeriod(period: string | number) {
  if (period === selectedPeriod.value) return
  selectedPeriod.value = period
  loadActivity(period)
}

async function loadActivity(period: string | number) {
  pending.value = true
  error.value = null
  try {
    const query = period === ROLLING_PERIOD ? `days=${MAX_ACTIVITY_DAYS}` : `year=${period}`
    const activity = await $fetch<Activity>(`/api/user/activity?${query}`)
    const days = activity.data ?? []

    totalContributions.value = days.reduce((sum, day) => sum + day.count, 0)
    breakdown.value = activity.breakdown ?? { commits: 0, pullRequests: 0, issues: 0, reviews: 0 }
    monthlyTotals.value = aggregateByMonth(days)
    busiestDay.value = days.reduce<DayData | null>(
      (busiest, day) => (!busiest || day.count > busiest.count ? day : busiest),
      null,
    )
    if (busiestDay.value?.count === 0) busiestDay.value = null

    const streaks = computeStreaks(days)
    currentStreak.value = streaks.current
    longestStreak.value = streaks.longest

    periods.value = [
      { label: 'Last year', value: ROLLING_PERIOD },
      ...(activity.availableYears ?? []).map(year => ({ label: String(year), value: year })),
    ]

    if (days.length === 0) {
      weeks.value = []
      return
    }

    const cells: (HeatmapCell | null)[] = Array.from(
      { length: dateToUtcDay(days[0]!.date).getUTCDay() },
      () => null,
    )
    for (const day of days) {
      cells.push({
        date: day.date,
        count: day.count,
        level: levelFor(day.count, Math.max(1, ...days.map(d => d.count))),
        href: activity.url ? `${activity.url}?tab=overview&from=${day.date}&to=${day.date}` : '#',
      })
    }
    while (cells.length % 7 !== 0) cells.push(null)

    const builtWeeks: (HeatmapCell | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) {
      builtWeeks.push(cells.slice(i, i + 7))
    }
    weeks.value = builtWeeks

    let lastMonth = -1
    let lastLabeledWeekIndex = -MIN_WEEKS_BETWEEN_MONTH_LABELS
    monthLabels.value = builtWeeks.map((week, weekIndex) => {
      const firstCell = week.find(cell => cell !== null)
      if (!firstCell) return ''
      const month = dateToUtcDay(firstCell.date).getUTCMonth()
      if (month === lastMonth) return ''
      lastMonth = month
      if (weekIndex - lastLabeledWeekIndex < MIN_WEEKS_BETWEEN_MONTH_LABELS) return ''
      lastLabeledWeekIndex = weekIndex
      return MONTH_NAMES[month]!
    })
  }
  catch (fetchError) {
    error.value = fetchError
    console.error('Failed to load contribution activity:', fetchError)
  }
  finally {
    pending.value = false
  }
}

onMounted(() => loadActivity(selectedPeriod.value))
</script>
