import { NextResponse } from 'next/server'
import siteMetadata from '@/lib/siteMetaData'

export async function GET() {
  const content = `# ${siteMetadata.title}

> A personal blog covering AI, education, technology, and Irish translation. Features thoughts, technical tinkering, and translations including published works like Winnie-the-Pooh in Irish.

## About the Author
Oisín Thomas is Head of AI at Examfly and Co-founder at Weeve. Trinity College Dublin graduate with 1st Class Honours in Computer Science, Linguistics, and Irish.

## Content Categories
Posts are organized into three major categories:
- **Thoughts** - Personal essays and insights
- **Tinkering** - Technical projects and experiments
- **Translations** - Translated content (English/Irish)

## Pages
- [Home](${siteMetadata.siteUrl}/): Homepage with featured posts
- [All Posts](${siteMetadata.siteUrl}/all): Browse all posts with tag filtering
- [About](${siteMetadata.siteUrl}/about): Author biography and background
- [RSS Feed](${siteMetadata.siteUrl}/rss.xml): RSS 2.0 feed
- [Sitemap](${siteMetadata.siteUrl}/sitemap.xml): XML sitemap for search engines
- [Robots.txt](${siteMetadata.siteUrl}/robots.txt): Crawler instructions

## Optional
- [Blogroll](${siteMetadata.siteUrl}/blogroll): Curated list of favorite blogs
- [Privacy Policy](${siteMetadata.siteUrl}/privacy): Privacy and cookie policy
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
