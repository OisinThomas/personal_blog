'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { usePathname, useSearchParams } from 'next/navigation'

// Hook for tracking page views (already implemented in providers.tsx)
export const usePostHogPageView = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString()
      }
      
      posthog.capture('$pageview', { 
        '$current_url': url,
        referrer: document.referrer
      })
    }
  }, [pathname, searchParams])
}

// Hook for tracking scroll depth
export const usePostHogScrollDepth = () => {
  useEffect(() => {
    let maxScrollDepth = 0
    const trackScrollDepth = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      
      const scrollDepthPercentage = Math.floor(
        (scrollTop / (scrollHeight - clientHeight)) * 100
      )
      
      if (scrollDepthPercentage > maxScrollDepth && scrollDepthPercentage % 25 === 0) {
        maxScrollDepth = scrollDepthPercentage
        posthog.capture('scroll_depth', { depth: maxScrollDepth })
      }
    }
    
    window.addEventListener('scroll', trackScrollDepth)
    return () => window.removeEventListener('scroll', trackScrollDepth)
  }, [])
}

// Hook for tracking time spent on page
export const usePostHogTimeOnPage = () => {
  useEffect(() => {
    const startTime = Date.now()
    
    return () => {
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000)
      posthog.capture('time_on_page', { 
        seconds: timeSpentSeconds,
        page: window.location.pathname
      })
    }
  }, [])
}

// Utility function for tracking link clicks
export const trackLinkClick = (linkType: string, linkUrl: string, linkText: string) => {
  posthog.capture('link_click', {
    link_type: linkType,
    link_url: linkUrl,
    link_text: linkText
  })
}

// Utility function for tracking button clicks
export const trackButtonClick = (buttonName: string, buttonLocation: string) => {
  posthog.capture('button_click', {
    button_name: buttonName,
    button_location: buttonLocation
  })
}

// Utility function for tracking blog post views
export const trackBlogPostView = (postSlug: string, postTitle: string, postCategories: string[]) => {
  posthog.capture('blog_post_view', {
    post_slug: postSlug,
    post_title: postTitle,
    post_categories: postCategories
  })
}
