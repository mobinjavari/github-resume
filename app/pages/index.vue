<template>
  <div>
    <ProfileSection />
    <OrganizationsSection />
    <FeaturedRepositoriesSection />
    <ContributionHeatmapSection />
    <LanguagesSection />
  </div>
</template>

<script setup lang="ts">
import ProfileSection from '~/components/ProfileSection.vue'
import OrganizationsSection from '~/components/OrganizationsSection.vue'
import FeaturedRepositoriesSection from '~/components/FeaturedRepositoriesSection.vue'
import ContributionHeatmapSection from '~/components/ContributionHeatmapSection.vue'
import LanguagesSection from '~/components/LanguagesSection.vue'
</script>
