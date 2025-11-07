<template>
    <Section :error="error">
        <ProfileContent v-if="profile" :profile="profile" />
    </Section>
</template>

<script setup lang="ts">
import Section from '~/components/ui/Section.vue'
import ProfileContent from './profile/ProfileContent.vue'

import type { Profile } from '~~/types/user/profile'

const { data: profile, error } = await useFetch<Profile>('/api/user/profile')
</script>
