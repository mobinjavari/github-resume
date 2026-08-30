<template>
  <Section
    v-if="pending || error || languages.length"
    :pending="pending"
    :error="error"
    title="Top Languages"
    :icon="CodeIcon"
  >
    <div class="flex h-2.5 w-full gap-0.5">
      <span
        v-for="language in languages"
        :key="language.name"
        :title="`${language.name} — ${language.percentage}%`"
        class="h-full first:rounded-l-full last:rounded-r-full"
        :class="!language.color && 'bg-theme-400 dark:bg-theme-600'"
        :style="{ width: `${language.percentage}%`, backgroundColor: language.color ?? undefined }"
      />
    </div>
    <div class="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-theme-600 dark:text-theme-400">
      <span
        v-for="language in languages"
        :key="language.name"
        class="inline-flex items-center gap-1.5"
      >
        <span
          class="size-2.5 rounded-full"
          :class="!language.color && 'bg-theme-400 dark:bg-theme-600'"
          :style="{ backgroundColor: language.color ?? undefined }"
        />
        {{ language.name }}
        <span class="text-theme-400 dark:text-theme-600">{{ language.percentage }}%</span>
      </span>
    </div>
  </Section>
</template>

<script setup lang="ts">
import Section from '~/components/ui/Section.vue'
import CodeIcon from '~/components/icons/CodeIcon.vue'
import type { Languages } from '~~/types/user/languages'

const { data: languages, pending, error } = await useFetch<Languages>('/api/user/languages', {
  server: false,
  default: () => [],
})

if (error.value) {
  console.error('Failed to load languages:', error.value)
}
</script>
