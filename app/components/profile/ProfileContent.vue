<template>
    <div
        class="relative h-40 sm:h-36 bg-gradient-to-r from-gradient-from-600/20 via-gradient-via-500/20 to-gradient-to-600/20 dark:from-gradient-from-500/10 dark:via-gradient-via-400/10 dark:to-gradient-to-500/10 overflow-visible">
        <MiniSpark />
    </div>

    <div class="p-5 -mt-12 sm:-mt-14">
        <div class="flex flex-col md:flex-row gap-5 items-start">
            <ProfileAvatar :url="profile.avatarUrl" />
            <div class="flex-1 space-y-2 relative z-10">
                <div class="flex items-center gap-2 flex-wrap pb-2">
                    <h2 class="text-2xl font-bold">{{ profile.name }}</h2>
                    <span class="text-sm text-theme-600 dark:text-theme-300">
                        @<a :href="profile.url" target="_blank" rel="noopener" class="hover:underline">
                            {{ profile.login }}
                        </a>
                    </span>
                    <ProfileMeta :profile="profile" />
                </div>

                <p v-if="profile.bio" class="text-sm text-theme-700 dark:text-theme-300 pb-2">
                    {{ profile.bio }}
                </p>
                <ProfileBadge :profile="profile" />
            </div>
        </div>
        <ProfileStats :profile="profile" />
    </div>
</template>

<script setup lang="ts">
import MiniSpark from './MiniSpark.vue';
import ProfileAvatar from './ProfileAvatar.vue';
import ProfileMeta from './ProfileMeta.vue';
import ProfileBadge from './ProfileBadge.vue'
import ProfileStats from './ProfileStats.vue'
import type { Profile } from '~/../types/profile'

defineProps<{ profile: Profile }>()
</script>