<template>
  <a
    :href="repository.url"
    target="_blank"
    rel="noopener noreferrer"
    class="group bg-theme-100 dark:bg-theme-950 border border-theme-200 dark:border-theme-300/20 rounded-2xl p-4 flex flex-col gap-2 hover:border-theme-400/30 transform transition-transform duration-300 ease-out hover:scale-105"
  >
    <h4 class="text-sm font-semibold text-theme-800 dark:text-theme-100 line-clamp-1 group-hover:underline">
      {{ repository.name }}
    </h4>
    <p
      v-if="repository.description"
      class="text-xs text-theme-600 dark:text-theme-400 line-clamp-2 flex-1"
    >
      {{ repository.description }}
    </p>
    <p
      v-else
      class="text-xs text-theme-500 italic dark:text-theme-500 flex-1"
    >
      No description
    </p>
    <div class="flex items-center gap-3 text-xs text-theme-500 dark:text-theme-400">
      <span
        v-if="repository.primaryLanguage"
        class="inline-flex items-center gap-1"
      >
        <span
          class="size-2.5 rounded-full"
          :style="{ backgroundColor: repository.primaryLanguage.color ?? 'currentColor' }"
        />
        {{ repository.primaryLanguage.name }}
      </span>
      <span class="inline-flex items-center gap-1">
        <StarIcon class="size-3.5" />
        {{ repository.stargazerCount }}
      </span>
      <span
        v-if="repository.forkCount > 0"
        class="inline-flex items-center gap-1"
      >
        <ForkIcon class="size-3.5" />
        {{ repository.forkCount }}
      </span>
    </div>
  </a>
</template>

<script setup lang="ts">
import StarIcon from '~/components/icons/StarIcon.vue'
import ForkIcon from '~/components/icons/ForkIcon.vue'
import type { Repository } from '~~/types/user/repository'

defineProps<{ repository: Repository }>()
</script>
