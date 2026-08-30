<template>
  <Section
    v-if="pending || error || repositories.length"
    :pending="pending"
    :error="error"
    :title="usingFallback ? 'Top Repositories' : 'Pinned Repositories'"
    :icon="usingFallback ? StarIcon : PinIcon"
  >
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RepositoryCard
        v-for="repository in repositories"
        :key="repository.url"
        :repository="repository"
      />
    </div>
  </Section>
</template>

<script setup lang="ts">
import Section from '~/components/ui/Section.vue'
import PinIcon from '~/components/icons/PinIcon.vue'
import StarIcon from '~/components/icons/StarIcon.vue'
import RepositoryCard from '~/components/repository/RepositoryCard.vue'
import type { Repositories } from '~~/types/user/repository'

const repositories = ref<Repositories>([])
const usingFallback = ref(false)
const pending = ref(true)
const error = ref<unknown>(null)

// Pinned repos are the owner's own curated picks; only fall back to their
// top-starred repos (a second request) when they haven't pinned anything.
async function loadFeaturedRepositories() {
  try {
    const pinnedRepositories = await $fetch<Repositories>('/api/user/pinned-repos')
    if (pinnedRepositories.length > 0) {
      repositories.value = pinnedRepositories
      return
    }

    usingFallback.value = true
    repositories.value = await $fetch<Repositories>('/api/user/top-repos')
  }
  catch (fetchError) {
    error.value = fetchError
    console.error('Failed to load featured repositories:', fetchError)
  }
  finally {
    pending.value = false
  }
}

onMounted(loadFeaturedRepositories)

useHead(() => ({
  script: repositories.value.length
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'itemListElement': repositories.value.map((repository, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'item': {
              '@type': 'SoftwareSourceCode',
              'name': repository.name,
              'description': repository.description || undefined,
              'codeRepository': repository.url,
              'programmingLanguage': repository.primaryLanguage?.name,
            },
          })),
        }),
      }]
    : [],
}))
</script>
