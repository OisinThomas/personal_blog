import { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/posts/queries'
import siteMetadata from '@/lib/siteMetaData'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts()

  const postUrls = posts.map((post) => ({
    url: `${siteMetadata.siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at
      ? new Date(post.updated_at)
      : post.published_at
        ? new Date(post.published_at)
        : new Date(),
  }))

  const staticPages = [
    {
      url: siteMetadata.siteUrl,
      lastModified: new Date(),
    },
    {
      url: `${siteMetadata.siteUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${siteMetadata.siteUrl}/all`,
      lastModified: new Date(),
    },
    {
      url: `${siteMetadata.siteUrl}/blogroll`,
      lastModified: new Date(),
    },
    {
      url: `${siteMetadata.siteUrl}/privacy`,
      lastModified: new Date(),
    },
  ]

  return [...staticPages, ...postUrls]
}
