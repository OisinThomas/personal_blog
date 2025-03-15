'use client'

import { trackLinkClick, usePostHogScrollDepth, usePostHogTimeOnPage } from '@/lib/posthog'
import Link from 'next/link'
import { type PostData } from '@/lib/utils'

// Props interface for the HomeTracking component
interface HomeTrackingProps {
  children: React.ReactNode
}

// Main wrapper component that adds tracking hooks
export function HomeTracking({ children }: HomeTrackingProps) {
  // Use PostHog tracking hooks
  usePostHogScrollDepth()
  usePostHogTimeOnPage()
  
  return <>{children}</>
}

// Tracked link components
export function TrackedExternalLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="cursor-pointer underline"
      onClick={() => trackLinkClick('external', href, typeof children === 'string' ? children : href)}
    >
      {children}
    </Link>
  )
}

export function TrackedAnchorLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="cursor-pointer hover:underline"
      onClick={() => trackLinkClick('anchor', href, typeof children === 'string' ? children : href)}
    >
      {children}
    </Link>
  )
}

export function TrackedInternalLink({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
  return (
    <Link
      href={href}
      className={className || "cursor-pointer underline"}
      onClick={() => trackLinkClick('internal', href, typeof children === 'string' ? children : href)}
    >
      {children}
    </Link>
  )
}

export function TrackedBlogPostLink({ post, children, className }: { post: PostData, children?: React.ReactNode, className?: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={className || "cursor-pointer hover:underline"}
      onClick={() => trackLinkClick('blog_post', `/blog/${post.slug}`, post.title)}
    >
      {children || (
        <h3 className="text-xl font-semibold mb-2">
          {post.title}{" "}
          {post.language === "ga" ? `[${post.language.toUpperCase()}]` : ""}
        </h3>
      )}
    </Link>
  )
}

export function TrackedRecentPostLink({ post }: { post: PostData }) {
  return (
    <div className="mb-2 underline">
      <Link
        href={`/blog/${post.slug}`}
        onClick={() => trackLinkClick('blog_post', `/blog/${post.slug}`, post.title)}
      >
        {post.title.split(":")[0]}{" "}
        {post.language === "ga" ? `[${post.language.toUpperCase()}]` : ""}
      </Link>
    </div>
  )
}
