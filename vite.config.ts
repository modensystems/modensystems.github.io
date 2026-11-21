import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'

/** Project Pages (swcenter) vs org root Pages (modensystems.github.io). */
function resolveSite() {
  const repo = process.env.GITHUB_REPOSITORY || ''
  const isOrgSite = repo.endsWith('.github.io') || process.env.VITE_SITE === 'moden'

  if (process.env.VITE_BASE || process.env.VITE_SITE_URL) {
    const siteUrl = (process.env.VITE_SITE_URL || 'https://swcenter.github.io/mdsys').replace(/\/$/, '')
    const base = process.env.VITE_BASE || (isOrgSite ? '/' : '/mdsys/')
    return { base, siteUrl }
  }

  if (isOrgSite) {
    return { base: '/', siteUrl: 'https://modensystems.github.io' }
  }

  return { base: '/mdsys/', siteUrl: 'https://swcenter.github.io/mdsys' }
}

const { base, siteUrl } = resolveSite()

function seoSitePlugin(): Plugin {
  const lastmod = new Date().toISOString().slice(0, 10)
  return {
    name: 'seo-site-url',
    transformIndexHtml(html) {
      return html.replaceAll('https://swcenter.github.io/mdsys', siteUrl)
    },
    writeBundle(options) {
      const outDir = options.dir
      if (!outDir) return

      writeFileSync(
        join(outDir, 'robots.txt'),
        [
          'User-agent: *',
          'Allow: /',
          '',
          'User-agent: Yeti',
          'Allow: /',
          '',
          'User-agent: Googlebot',
          'Allow: /',
          '',
          `Sitemap: ${siteUrl}/sitemap.xml`,
          '',
        ].join('\n'),
      )

      writeFileSync(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/privacy</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
`,
      )
    },
  }
}

export default defineConfig({
  base,
  plugins: [vue(), seoSitePlugin()],
  publicDir: 'static',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
})
