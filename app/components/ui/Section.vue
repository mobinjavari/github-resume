<template>
    <section
        class="rounded-2xl border border-theme-200 dark:border-theme-800 bg-theme-50 dark:bg-theme-900 overflow-hidden mb-5">
        <SectionSkeleton v-if="pending" />
        <div v-else-if="error" class="p-4 text-center text-danger-600">
            {{ error }}
        </div>
        <div v-else>
            <div v-if="title" class="flex items-center gap-2 p-4 text-theme-700 dark:text-theme-300">
                <component v-if="icon" :is="icon" class="size-4" />
                <h3 class="text-md font-medium">
                    {{ title }}
                </h3>
            </div>
            <slot />
        </div>
    </section>
</template>

<script setup>
import SectionSkeleton from './skeleton/SectionSkeleton.vue'

defineProps({
    pending: Boolean | undefined,
    error: Boolean | undefined,
    title: String | undefined,
    icon: Object | undefined
})
</script>