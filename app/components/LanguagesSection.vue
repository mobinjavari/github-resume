<template>
  <ClientOnly>
    <Section
      v-if="pending || error || report.totalLanguageCount"
      :pending="pending"
      :error="error"
      title="Top Languages"
      :icon="CodeIcon"
    >
      <div class="flex flex-wrap gap-2 mb-4">
        <div class="rounded-full bg-theme-100 dark:bg-theme-950 border border-theme-200 dark:border-theme-800 px-4 py-2 flex items-center gap-2 text-[11px]">
          <span class="text-theme-500 dark:text-theme-400">Languages</span>
          <span class="text-sm font-semibold">{{ report.totalLanguageCount }}</span>
        </div>
        <div class="rounded-full bg-theme-100 dark:bg-theme-950 border border-theme-200 dark:border-theme-800 px-4 py-2 flex items-center gap-2 text-[11px]">
          <span class="text-theme-500 dark:text-theme-400">Repositories analyzed</span>
          <span class="text-sm font-semibold">{{ report.totalRepositoryCount }}</span>
        </div>
        <div class="rounded-full bg-theme-100 dark:bg-theme-950 border border-theme-200 dark:border-theme-800 px-4 py-2 flex items-center gap-2 text-[11px]">
          <span class="text-theme-500 dark:text-theme-400">Total size</span>
          <span class="text-sm font-semibold">{{ formatBytes(report.totalBytes) }}</span>
        </div>
      </div>

      <p
        v-if="report.mostPolyglotRepository"
        class="text-xs text-theme-600 dark:text-theme-400 mb-2"
      >
        <CodeIcon class="inline-block size-3.5 mr-1 align-text-bottom text-primary-500" />
        Most polyglot repo: <span class="font-semibold text-theme-800 dark:text-theme-100">{{ report.mostPolyglotRepository.name }}</span> uses <span class="font-semibold text-theme-800 dark:text-theme-100">{{ report.mostPolyglotRepository.languageCount }}</span> languages
      </p>

      <p
        v-if="topLanguageDiffers"
        class="text-xs text-theme-600 dark:text-theme-400 mb-4"
      >
        <GraphIcon class="inline-block size-3.5 mr-1 align-text-bottom text-info-500" />
        <span class="font-semibold text-theme-800 dark:text-theme-100">{{ topLanguageDiffers.bySize }}</span> makes up the most code, but <span class="font-semibold text-theme-800 dark:text-theme-100">{{ topLanguageDiffers.byRepos }}</span> is used in the most repos.
      </p>

      <div class="grid sm:grid-cols-2 gap-4">
        <div
          v-for="panel in summaryPanels"
          :key="panel.key"
          class="rounded-xl border border-theme-200 dark:border-theme-800 bg-theme-100 dark:bg-theme-950 p-4"
        >
          <div
            class="flex items-center gap-1.5 text-xs font-semibold mb-3"
            :class="panel.key === 'size' ? 'text-primary-600 dark:text-primary-400' : 'text-success-600 dark:text-success-400'"
          >
            <component
              :is="panel.icon"
              class="size-3.5"
            />
            {{ panel.title }}
          </div>

          <div class="space-y-2.5">
            <div
              v-for="item in panel.items"
              :key="item.name"
              class="flex items-center gap-2.5"
            >
              <span class="text-xs w-20 flex-none truncate">{{ item.name }}</span>
              <div class="flex-1 h-2 rounded-full bg-theme-200 dark:bg-theme-800 overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :class="!item.color && 'bg-theme-400 dark:bg-theme-600'"
                  :style="{ width: `${item.percentage}%`, backgroundColor: item.color ?? undefined }"
                />
              </div>
              <span class="text-xs font-semibold tabular-nums w-8 text-right flex-none">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </Section>

    <template #fallback>
      <Section
        :pending="true"
        title="Top Languages"
        :icon="CodeIcon"
      />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import Section from '~/components/ui/Section.vue'
import CodeIcon from '~/components/icons/CodeIcon.vue'
import RepoIcon from '~/components/icons/RepoIcon.vue'
import GraphIcon from '~/components/icons/GraphIcon.vue'
import type { LanguageReport } from '~~/types/user/languages'

const { data: report, pending, error } = await useFetch<LanguageReport>('/api/user/languages', {
  server: false,
  default: () => ({
    languagesBySize: [],
    languagesByRepositoryCount: [],
    totalLanguageCount: 0,
    totalBytes: 0,
    totalRepositoryCount: 0,
    mostPolyglotRepository: null,
  }),
})

if (error.value) {
  console.error('Failed to load languages:', error.value)
}

const summaryPanels = computed(() => [
  {
    key: 'size' as const,
    title: 'By Code Size',
    icon: CodeIcon,
    items: report.value.languagesBySize,
  },
  {
    key: 'repos' as const,
    title: 'By Repository Usage',
    icon: RepoIcon,
    items: report.value.languagesByRepositoryCount,
  },
])

const topLanguageDiffers = computed(() => {
  const bySize = report.value.languagesBySize[0]
  const byRepos = report.value.languagesByRepositoryCount[0]
  if (!bySize || !byRepos || bySize.name === byRepos.name) return null
  return { bySize: bySize.name, byRepos: byRepos.name }
})
</script>
