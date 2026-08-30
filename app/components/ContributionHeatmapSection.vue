<template>
  <Section
    v-if="pending || error || weeks.length"
    :pending="pending"
    :error="error"
    title="Contribution Activity"
    :icon="GraphIcon"
  >
    <p class="text-xs text-theme-500 dark:text-theme-400 mb-3">
      {{ totalContributions.toLocaleString('en-US') }} contributions in the last year
    </p>

    <div class="overflow-x-auto">
      <div
        role="img"
        :aria-label="`Contribution heatmap: ${totalContributions} contributions in the last year`"
        class="inline-flex flex-col gap-1"
      >
        <div class="flex gap-0.5 text-[10px] text-theme-500 dark:text-theme-400">
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
                class="size-2.5 block"
              />
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center gap-1.5 text-[10px] text-theme-500 dark:text-theme-400">
      <span>Less</span>
      <span
        v-for="level in LEVEL_CLASSES"
        :key="level"
        class="size-2.5 rounded-sm"
        :class="level"
      />
      <span>More</span>
    </div>
  </Section>
</template>

<script setup lang="ts">
import Section from '~/components/ui/Section.vue'
import GraphIcon from '~/components/icons/GraphIcon.vue'
import type { Activity } from '~~/types/user/activity'
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

const weeks = ref<(HeatmapCell | null)[][]>([])
const monthLabels = ref<string[]>([])
const totalContributions = ref(0)
const pending = ref(true)
const error = ref<unknown>(null)

async function loadActivity() {
  try {
    const activity = await $fetch<Activity>(`/api/user/activity?days=${MAX_ACTIVITY_DAYS}`)
    const days = activity.data
    if (days.length === 0) return

    totalContributions.value = days.reduce((sum, day) => sum + day.count, 0)
    const maxCount = Math.max(1, ...days.map(day => day.count))

    const cells: (HeatmapCell | null)[] = Array.from(
      { length: dateToUtcDay(days[0]!.date).getUTCDay() },
      () => null,
    )
    for (const day of days) {
      cells.push({
        date: day.date,
        count: day.count,
        level: levelFor(day.count, maxCount),
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

onMounted(loadActivity)
</script>
