// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/styles/main.scss'],
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    THEME_COLOR: process.env.THEME_COLOR || '0',
  },
})
