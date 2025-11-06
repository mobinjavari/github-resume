<template>
    <template v-for="item in items">
        <span v-if="item" class="text-[11px] rounded-full px-2 py-0.5 font-medium border inline-flex items-center gap-1 
            dark:text-theme-100 dark:bg-theme-950/20 dark:border-theme-600/40 
            text-theme-600 bg-theme-300/20 border-theme-400/40">
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
        text: profile.status.message
    } : null,
    {
        text: `Member ${timeSince(profile.createdAt)}`,
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