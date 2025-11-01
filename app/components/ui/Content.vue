<template>
    <Section>
        <ContentSkeleton v-if="pending" />
        <div v-else-if="error" class="p-4 text-center bg-danger-900/20 text-danger-600 border-danger-400/20">
            {{ error }}
        </div>
        <slot v-else />
    </Section>
</template>

<script setup>
import Section from './Section.vue'
import ContentSkeleton from './skeleton/ContentSkeleton.vue'

defineProps({
    pending: Boolean | undefined,
    error: Boolean | undefined
})
</script>