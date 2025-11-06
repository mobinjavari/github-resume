<template>
    <Section>
        <div v-if="error" class="p-4 text-center text-danger-600">
            {{ error }}
        </div>
        <slot v-else />
    </Section>
</template>

<script setup>
import Section from './Section.vue'

defineProps({ error: Boolean | undefined })
</script>