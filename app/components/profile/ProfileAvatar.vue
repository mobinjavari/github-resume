<template>
    <img :src="url" alt="avatar"
        class="size-28 rounded-2xl bg-theme-50 dark:bg-theme-900 border-4 border-theme-50 dark:border-theme-900 object-cover shadow z-10" />
</template>

<script setup lang="ts">
defineProps<{ url: string }>()
</script>