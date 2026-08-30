<template>
  <div>
    <ProfileSection />
    <FeaturedRepositoriesSection />
    <ContributionHeatmapSection />
    <LanguagesSection />
    <OrganizationsSection />
  </div>
</template>

<script setup lang="ts">
import ProfileSection from '~/components/ProfileSection.vue'
import FeaturedRepositoriesSection from '~/components/FeaturedRepositoriesSection.vue'
import ContributionHeatmapSection from '~/components/ContributionHeatmapSection.vue'
import LanguagesSection from '~/components/LanguagesSection.vue'
import OrganizationsSection from '~/components/OrganizationsSection.vue'
</script>
