export default defineEventHandler((event) => {
  const { public: { siteUrl } } = useRuntimeConfig()
  const isProduction = process.env.NODE_ENV === 'production'

  setHeader(event, 'Content-Type', 'text/plain')

  if (!isProduction) {
    return 'User-agent: *\nDisallow: /\n'
  }

  return `User-agent: *\nDisallow:\n\nSitemap: ${siteUrl}/sitemap.xml\n`
})
