import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { getPostWithNodes, getPostSlugs, getPostWithNodesPreview } from "@/lib/posts/queries";
import siteMetadata from "@/lib/siteMetaData";
import Footer from "@/components/Footer";
import SubstackIcon from "@/components/icons/SubstackIcon";
import TagLink from "@/components/TagLink";
import LexicalContentRenderer, { detectBilingualNodes } from "@/components/blocks/LexicalContentRenderer";
import LanguageWrapper from "@/components/LanguageWrapper";
import type { Footnote } from "@/lib/supabase/types";
import { verifyPreviewToken } from "@/lib/preview";
import SubscribeBanner from "@/components/SubscribeBanner";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Post({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;

  // If a preview token is provided, verify it and use the service role client
  let result;
  let isPreview = false;

  if (preview) {
    // First fetch with service role to get the post (bypasses RLS)
    const previewResult = await getPostWithNodesPreview(slug);
    if (previewResult && verifyPreviewToken(previewResult.post.id, preview)) {
      result = previewResult;
      isPreview = true;
    }
  }

  // Normal fetch for published posts
  if (!result) {
    result = await getPostWithNodes(slug);
  }

  if (!result) {
    return notFound();
  }

  const { post } = result;

  const isPublished = post.status === 'published';
  const isScheduled = post.published_at && new Date(post.published_at) > new Date();
  if (!isPreview && (!isPublished || isScheduled)) {
    return notFound();
  }

  // Calculate word count
  const wordCount = post.editor_state
    ? countWordsInLexicalState(post.editor_state)
    : 0;

  const readingTime = Math.ceil(wordCount / 200);

  const footnotes: Footnote[] = post.footnotes ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.description,
    image: post.featured_image
      ? [`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.featured_image.bucket}/${post.featured_image.storage_path}`]
      : [],
    datePublished: post.published_at ? new Date(post.published_at).toISOString() : "",
    dateModified: new Date(post.updated_at).toISOString(),
    author: [
      {
        "@type": "Person",
        name: post.author || siteMetadata.author,
      },
    ],
  };

  return (
    <>
      <main className="container mx-auto px-4 mb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Preview Banner */}
        {isPreview && !isPublished && (
          <div className="max-w-3xl mx-auto mb-6 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-400 text-center">
            Preview mode — this post is not published
          </div>
        )}

        {/* Article Header */}
        <header className="max-w-3xl mx-auto mb-12">
          <h1 className="text-display text-center mb-6">
            {post.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-secondary-500 text-sm">
            {post.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
            <div className="text-secondary-400">
              {wordCount.toLocaleString()} words
            </div>
            {post.source === "Substack" && post.source_url && (
              <Link
                href={post.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors"
              >
                <SubstackIcon className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {post.tags.map((tag: string) => (
                <TagLink
                  key={tag}
                  tag={tag}
                  className="text-xs px-3 py-1 rounded-full bg-surface-1 text-secondary-500 hover:bg-blue-500 hover:!text-white focus:bg-blue-500 focus:!text-white transition-colors"
                />
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="prose dark:prose-invert max-w-3xl mx-auto">
          <LanguageWrapper
            hasBilingual={post.editor_state ? detectBilingualNodes(post.editor_state) : false}
            postLanguage={post.language}
          >
            {post.editor_state && <LexicalContentRenderer editorState={post.editor_state} />}
          </LanguageWrapper>
        </article>

        {/* Footnotes */}
        {footnotes.length > 0 && (
          <section className="max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Footnotes
            </h2>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {footnotes.map((fn) => (
                <li key={fn.id} id={`fn-${fn.id}`} className="flex gap-2">
                  <a
                    href={`#fnref-${fn.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex-shrink-0"
                  >
                    [{fn.label}]
                  </a>
                  <span>{fn.content}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Subscribe CTA */}
        <div className="max-w-3xl mx-auto mt-12">
          <SubscribeBanner />
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;

  let result;
  if (preview) {
    result = await getPostWithNodesPreview(slug);
  }
  if (!result) {
    result = await getPostWithNodes(slug);
  }

  if (!result) {
    return {
      title: 'Post Not Found',
    };
  }

  const { post } = result;

  // Don't block metadata for preview — just check for actual 404
  const isPublished = post.status === 'published';
  const isScheduled = post.published_at && new Date(post.published_at) > new Date();
  if (!isPublished || isScheduled) {
    // Return basic metadata for unpublished posts (preview mode)
    return {
      title: post.title,
      robots: { index: false, follow: false },
    };
  }

  const imageUrl = post.featured_image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.featured_image.bucket}/${post.featured_image.storage_path}`
    : undefined;

  const publishedAt = post.published_at
    ? new Date(post.published_at).toISOString()
    : undefined;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description || undefined,
      url: `${siteMetadata.siteUrl}/blog/${post.slug}`,
      publishedTime: publishedAt,
      modifiedTime: new Date(post.updated_at).toISOString(),
      type: "article",
      images: imageUrl ? [imageUrl] : undefined,
      authors: [post.author || siteMetadata.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description || undefined,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export async function generateStaticParams() {
  try {
    const slugs = await getPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // Return empty array if Supabase isn't configured yet
    return [];
  }
}

interface LexicalWordCountNode {
  type?: string;
  text?: string;
  code?: string;
  content?: Record<string, string>;
  children?: LexicalWordCountNode[];
  root?: LexicalWordCountNode;
}

function countWordsInLexicalState(editorState: Record<string, unknown>): number {
  let count = 0;
  function walk(node: LexicalWordCountNode) {
    if (node.type === 'text' && typeof node.text === 'string') {
      count += node.text.split(/\s+/).filter(Boolean).length;
    }
    if (node.type === 'codeblock' && typeof node.code === 'string') {
      count += node.code.split(/\s+/).filter(Boolean).length;
    }
    if (node.type === 'bilingual' && node.content) {
      const content = node.content.en || Object.values(node.content)[0] || '';
      count += content.split(/\s+/).filter(Boolean).length;
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(walk);
    }
  }
  const state = editorState as unknown as LexicalWordCountNode;
  walk(state.root || state);
  return count;
}
