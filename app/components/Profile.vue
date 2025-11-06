<template>
    <Content :error="error">
        <ProfileContent v-if="profile" :profile="profile" />
    </Content>
</template>

<script setup lang="ts">
import Content from '~/components/ui/Content.vue'
import ProfileContent from './profile/ProfileContent.vue'

const { data: profile, error } = await useFetch('/api/profile')
</script>
