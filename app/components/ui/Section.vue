<template>
    <section
        class="rounded-2xl border border-theme-200 dark:border-theme-800 bg-theme-50 dark:bg-theme-900 overflow-hidden mb-5">
        <SectionSkeleton v-if="pending" />
        <div v-else-if="error" class="p-4 text-center text-danger-600">
            {{ error }}
        </div>
        <div v-else>
            <div v-if="title" class="flex items-center gap-3 px-5 py-4">
                <component v-if="icon" :is="icon" class="size-5 text-theme-500 dark:text-theme-400" />
                <h3 class="text-md font-semibold text-theme-800 dark:text-theme-100">
                    {{ title }}
                </h3>
            </div>
            <div :class="title ? `px-5 pb-5 pt-2 space-y-4` : ``">
                <slot />
            </div>
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