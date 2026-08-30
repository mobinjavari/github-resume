export default defineEventHandler((event) => {
  const { public: { siteUrl } } = useRuntimeConfig()

  setHeader(event, 'Content-Type', 'text/plain')

  if (import.meta.dev) {
    return 'User-agent: *\nDisallow: /\n'
  }

  return `User-agent: *\nDisallow:\n\nSitemap: ${siteUrl}/sitemap.xml\n`
})
