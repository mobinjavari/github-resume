<template>
    <div class="mt-5 flex gap-3 text-[11px] overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div v-for="item in items" :key="item.label"
            class="flex-none rounded-full bg-theme-50 dark:bg-theme-950 border border-theme-200 dark:border-theme-800 px-4 py-2 flex items-center gap-2">
            <div class="text-theme-500 dark:text-theme-400">
                <span class="text-xs">{{ item.label }}</span>
            </div>
            <span class="text-sm font-semibold">
                {{ new Intl.NumberFormat('en-US').format(item.value) }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Profile } from '~/../types/profile'

const { profile } = defineProps<{ profile: Profile }>()

const items = [
    { label: 'Followers', value: profile.followers },
    { label: 'Following', value: profile.following },
    { label: 'Public Repos', value: profile.repositories },
    { label: 'Public Gists', value: profile.gists },
    { label: 'Stars Reserved', value: profile.stars },
    { label: 'Contributions', value: profile.contributions },
]
</script>
