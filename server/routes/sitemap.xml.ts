// One entry per file under app/pages — update this list if pages are added.
const SITE_ROUTES = ['/']

export default defineEventHandler((event) => {
  const { public: { siteUrl } } = useRuntimeConfig()

  setHeader(event, 'Content-Type', 'application/xml')

  const urlEntries = SITE_ROUTES
    .map(path => `  <url><loc>${siteUrl}${path}</loc></url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`
})
