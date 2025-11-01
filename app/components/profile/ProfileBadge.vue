<template>
    <div class="flex flex-wrap gap-2 text-xs pb-2">
        <span v-for="item in items">
            <a v-if="item" :href="item.href" :target="item?.targetBlank ? '_blank' : undefined"
                class="inline-flex items-center gap-1 rounded-md border border-theme-200 dark:border-theme-800 px-2 py-1"
                rel="noopener">
                <component :is="item.icon" class="w-3 h-3" />
                {{ item.text }}
            </a>
        </span>
    </div>
</template>

<script setup lang="ts">
import type { Profile } from '~/../types/profile'
import CompanyIcon from '~/components/icons/CompanyIcon.vue'
import LocationIcon from '~/components/icons/LocationIcon.vue'
import EmailIcon from '~/components/icons/EmailIcon.vue'
import LinkIcon from '~/components/icons/LinkIcon.vue'

const { profile } = defineProps<{ profile: Profile }>()
const items = [
    profile?.company ? {
        text: profile.company,
        icon: CompanyIcon,
        href: profile.company.startsWith('@') ? `https://github.com/${profile.company.slice(1)}` : undefined,
        targetBlank: true
    } : null,
    profile?.location ? {
        text: profile.location,
        icon: LocationIcon,
        href: `https://www.google.com/maps/search/${encodeURIComponent(profile.location)}`,
        targetBlank: true
    } : null,
    profile?.websiteUrl ? {
        text: profile.websiteUrl,
        icon: LinkIcon,
        href: profile.websiteUrl,
        targetBlank: true
    } : null,
    profile?.email ? {
        text: profile.email,
        icon: EmailIcon,
        href: `mailto:${profile.email}`
    } : null
]
</script>