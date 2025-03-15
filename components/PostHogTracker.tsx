'use client'

import { useEffect } from 'react'
import { trackBlogPostView, usePostHogScrollDepth, usePostHogTimeOnPage } from '@/lib/posthog'

interface PostHogTrackerProps {
  slug: string | undefined
  title: string | undefined
  categories: string[] | undefined
}

export default function PostHogTracker({ slug, title, categories }: PostHogTrackerProps) {
  // Use PostHog tracking hooks
  usePostHogScrollDepth()
  usePostHogTimeOnPage()
  
  useEffect(() => {
    // Track blog post view if all required data is available
    if (slug && title) {
      trackBlogPostView(slug, title, categories || [])
    }
  }, [slug, title, categories])
  
  return null // This component doesn't render anything
}
