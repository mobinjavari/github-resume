<template>
    <Content :pending="pending" :error="error" :data="profile">
        <ProfileContent v-if="profile" :profile="profile" />
    </Content>
</template>

<script setup lang="ts">
import Content from '~/components/ui/Content.vue'
import ProfileContent from './profile/ProfileContent.vue'

const { data: profile, pending, error } = await useFetch('/api/profile', {
    server: false,
    async onRequest({ options }) {
        await new Promise(r => setTimeout(r, 1000))
    }
})
</script>
