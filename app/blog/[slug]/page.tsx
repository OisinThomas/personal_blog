import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { getPostWithNodes, getPostSlugs } from "@/lib/posts/queries";
import siteMetadata from "@/lib/siteMetaData";
import Footer from "@/components/Footer";
import SubstackIcon from "@/components/icons/SubstackIcon";
import TagLink from "@/components/TagLink";
import BlockRenderer from "@/components/blocks/BlockRenderer";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPostWithNodes(slug);

  if (!result) {
    return notFound();
  }

  const { post, nodes } = result;

  // Calculate word count from markdown nodes
  const wordCount = nodes
    .filter((node) => node.type === 'markdown')
    .reduce((count, node) => {
      return count + (node.content?.split(/\s+/).length || 0);
    }, 0);

  const readingTime = Math.ceil(wordCount / 200);

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

        {/* Article Header */}
        <header className="max-w-3xl mx-auto mb-12">
          <h1 className="text-display text-center mb-6 flex items-center justify-center gap-4">
            {post.title}
            {post.source === "Substack" && post.source_url && (
              <Link
                href={post.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors"
              >
                <SubstackIcon className="w-8 h-8" />
              </Link>
            )}
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
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {post.tags.map((tag: string) => (
                <TagLink
                  key={tag}
                  tag={tag}
                  className="text-xs px-3 py-1 rounded-full bg-surface-1 text-secondary-500 border border-card-border hover:bg-blue-500 hover:!text-white hover:border-blue-500 focus:bg-blue-500 focus:!text-white focus:border-blue-500 transition-colors"
                />
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="prose dark:prose-invert max-w-3xl mx-auto">
          <BlockRenderer nodes={nodes} />
        </article>
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPostWithNodes(slug);

  if (!result) {
    return {
      title: 'Post Not Found',
    };
  }

  const { post } = result;

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
