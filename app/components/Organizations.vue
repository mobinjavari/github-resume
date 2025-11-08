<template>
    <Section v-if="orgs?.length" :pending="pending" :error="error" title="Organizations" :icon="CompanyIcon">
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <a v-for="org in orgs" :key="org.login" :href="org.url" target="_blank" rel="noopener noreferrer"
                class="group bg-theme-100 dark:bg-theme-950 border border-theme-200 dark:border-theme-300/20 rounded-2xl flex items-center gap-3 hover:border-theme-400/30 transform transition-transform duration-300 ease-out hover:scale-105">

                <img :src="org.avatarUrl" :alt="org.name"
                    class="size-20 rounded-l-2xl opacity-90 shadow-sm object-cover" />

                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-theme-800 dark:text-theme-100 line-clamp-1">
                        @{{ org.name }}
                    </h4>
                    <p v-if="org.description" class="text-xs text-theme-600 dark:text-theme-400 line-clamp-1">
                        {{ org.description }}
                    </p>
                    <p v-else class="text-xs text-theme-500 italic dark:text-theme-500">
                        No description
                    </p>
                </div>

                <ArrowLeftIcon
                    class="size-4 text-theme-400 group-hover:text-theme-500 transition-colors duration-300 mr-2" />
            </a>
        </div>
    </Section>
</template>

<script setup lang="ts">
import Section from '~/components/ui/Section.vue';
import CompanyIcon from '~/components/icons/CompanyIcon.vue';
import ArrowLeftIcon from '~/components/icons/ArrowRightIcon.vue';
import type { Organizations } from '~~/types/user/organizations';

const { data: orgs, pending, error } =
    await useFetch<Organizations>('/api/user/organizations', { server: false })
</script>