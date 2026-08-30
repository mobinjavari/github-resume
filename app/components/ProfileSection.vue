<template>
  <Section :error="error">
    <ProfileContent
      v-if="profile"
      :profile="profile"
    />
  </Section>
</template>

<script setup lang="ts">
import Section from '~/components/ui/Section.vue'
import ProfileContent from './profile/ProfileContent.vue'

import type { Profile } from '~~/types/user/profile'

const { data: profile, error } = await useFetch<Profile>('/api/user/profile')
if (error.value) {
  console.error('Failed to load profile:', error.value)
}

const { public: { siteUrl } } = useRuntimeConfig()
const route = useRoute()
const canonicalUrl = `${siteUrl}${route.path}`

const summary = computed(() => {
  if (!profile.value) return 'Auto-generated GitHub resume built from public GitHub profile data.'
  return profile.value.bio
    || `${profile.value.name} on GitHub — ${profile.value.repositories} public repos, ${profile.value.stars} stars, ${profile.value.followers} followers.`
})

useSeoMeta({
  title: () => profile.value ? `${profile.value.name} (@${profile.value.login})` : 'GitHub Resume',
  description: summary,
  ogSiteName: 'GitHub Resume',
  ogTitle: () => profile.value ? `${profile.value.name} (@${profile.value.login})` : 'GitHub Resume',
  ogDescription: summary,
  ogImage: () => profile.value?.avatarUrl,
  ogUrl: canonicalUrl,
  twitterCard: 'summary',
  twitterCreator: () => profile.value?.twitterUsername ? `@${profile.value.twitterUsername}` : undefined,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: profile.value
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          'name': profile.value.name,
          'alternateName': profile.value.login,
          'url': profile.value.url,
          'image': profile.value.avatarUrl,
          'description': profile.value.bio,
          'jobTitle': profile.value.company || undefined,
          'address': profile.value.location || undefined,
          'sameAs': [profile.value.websiteUrl, profile.value.url].filter(Boolean),
        }),
      }]
    : [],
}))
</script>
