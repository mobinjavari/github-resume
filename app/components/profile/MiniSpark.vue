<template>
    <div role="img" aria-label="Activity last 30 days" class="absolute right-0 bottom-0 z-20">
        <div class="relative z-10">
            <div class="flex items-end gap-0.5 h-20 w-44 max-w-72"
                style="mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);">
                <a v-for="(bar, i) in bars" :key="i" :href="bar.href" target="_blank" rel="noopener" :title="bar.title"
                    class="block w-[4px] sm:w-[6px] rounded-t transition-all duration-500 bg-theme-950/40 dark:bg-theme-50/50"
                    :style="{
                        height: `${bar.height}px`,
                        opacity: Math.min(0.3 + bar.value / maxValue, 1)
                    }"></a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { Activity } from '~~/types/user/activity'

const bars = ref<{ height: number; value: number; title: string; href: string }[]>([])
const maxValue = ref(1)

async function fetchActivity() {
    const res = await $fetch<Activity>('/api/user/activity')
    const data = res.data || []
    maxValue.value = Math.max(1, ...data.map(d => d.count))

    bars.value = data.map((day) => ({
        height: 0,
        value: day.count,
        title: `${day.count} on ${day.date}`,
        href: res.url ? `${res.url}?tab=overview&from=${day.date}&to=${day.date}` : '#'
    }))

    await nextTick()

    bars.value.forEach((bar, i) => {
        setTimeout(() => {
            bar.height = Math.max(2, Math.round((bar.value / maxValue.value) * 56))
        }, i * 100)
    })
}

onMounted(fetchActivity)
</script>
