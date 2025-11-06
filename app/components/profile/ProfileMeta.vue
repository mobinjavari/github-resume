<template>
    <template v-for="item in items">
        <span v-if="item" class="text-[11px] rounded-full px-2 py-0.5 font-medium border inline-flex items-center gap-1"
            :class="item.class">
            <span v-if="item.html" v-html="item.html" class="size-3"></span>
            {{ item.text }}
        </span>
    </template>
</template>

<script setup lang="ts">
import type { Profile } from '~/../types/profile'

const { profile } = defineProps<{ profile: Profile }>()

const items = [
    profile.status ? {
        html: profile.status?.emojiHTML,
        text: profile.status.message,
        class: profile.status.indicatesLimitedAvailability
            ? 'text-warning-600 bg-warning-300/20 border-warning-600/40 dark:text-warning-100 dark:bg-warning-950/20 dark:border-warning-600/40'
            : 'text-theme-600 bg-theme-300/20 border-theme-600/40 dark:text-theme-100 dark:bg-theme-950/20 dark:border-theme-600/40'
    } : undefined,
    {
        text: `Member ${timeSince(profile.createdAt)}`,
        class: 'text-info-600 bg-info-300/20 border-info-400/40 dark:text-info-100 dark:bg-info-950/20 dark:border-info-600/40'
    }
]

function timeSince(dateString: string) {
    const seconds = (Date.now() - new Date(dateString).getTime()) / 1000
    const days = Math.floor(seconds / 86400)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0) return `${years}y`
    if (months > 0) return `${months}m`
    return `${days}d`
}
</script>