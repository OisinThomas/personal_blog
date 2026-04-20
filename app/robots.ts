import { MetadataRoute } from 'next'
import siteMetadata from '@/lib/siteMetaData'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'ia_archiver',
        disallow: '/',
      },
    ],
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
  }
}
