// [slug].tsx
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, markdownToHtml } from "@/lib/utils";
import siteMetadata from "@/lib/siteMetaData";
import { PostBody } from "@/components/PostBody";
import Footer from "@/components/Footer";
import SubstackIcon from "@/components/icons/SubstackIcon";
import Link from "next/link";

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    image: [post.ogImage?.url],
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : "",
    dateModified: new Date(post.updatedAt || "").toISOString(),
    author: [
      {
        "@type": "Person",
        name: post?.author ? [post.author] : siteMetadata.author,
      },
    ],
  };

  const content = await markdownToHtml(post.content || "");

  return (
      <>
        <main className="container mx-auto px-4 mb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
            <h1 className="text-4xl font-bold mb-4 text-center flex items-center justify-center">
              {post.title}
              {post.source === "Substack" && (
                <Link href={post.substackUrl} target="_blank" rel="noopener noreferrer" className="ml-4">
                  <SubstackIcon className="w-6 h-6" />
                </Link>
              )}
            </h1>
          <div className="flex flex-row justify-center items-center mb-8 self-center">
            <time className="text-gray-500 text-sm mr-16" dateTime={post.date}>
              {new Date(post.publishedAt || "").toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
              })}
            </time>
            <div>
              {post.content?.split(/\s+/).length ?? 0} words
            </div>
          </div>
          <article className="prose dark:prose-invert max-w-none">
            <PostBody content={content} />
          </article>
        </main>
         <Footer/>
      </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return notFound();
  }

  const ogImages = [{ url: siteMetadata.siteUrl + post?.ogImage?.url }];

  const publishedAt = new Date(post.publishedAt ?? "").toISOString();
  const authors = post?.author ? [post.author] : siteMetadata.author;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: siteMetadata.siteUrl + "/blog/" + post.slug,
      publishedTime: publishedAt,
      modifiedTime: publishedAt,
      type: "article",
      images: [post.ogImage?.url || ''],
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ogImages,
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
