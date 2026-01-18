import Link from "next/link";
import Footer from "@/components/Footer";
import SubstackIcon from "@/components/icons/SubstackIcon";
import TagLink from "@/components/TagLink";
import TagFilter from "@/components/TagFilter";
import ClickableCard from "@/components/ClickableCard";
import { getPostsByMajorTag, getPublishedPostsByTag, getAllUniqueTags } from "@/lib/posts/queries";
import type { PostWithAsset, MajorTag } from "@/lib/supabase/types";
import { X } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function AllPosts({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const params = await searchParams;
  const selectedTag = params.tag;

  // Fetch all unique tags for the filter
  const allTags = await getAllUniqueTags();

  // If filtering by tag, fetch filtered posts
  if (selectedTag) {
    const filteredPosts = await getPublishedPostsByTag(selectedTag);

    return (
      <>
        <main className="container mx-auto px-4 mb-16 max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-headline">
              Posts tagged &ldquo;{selectedTag}&rdquo;
            </h1>
            <Link
              href="/all"
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-surface-1 text-secondary-500 hover:bg-primary hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Clear filter
            </Link>
          </div>

          <TagFilter tags={allTags} selectedTag={selectedTag} />

          {filteredPosts.length === 0 ? (
            <p className="text-secondary-500">No posts found with this tag.</p>
          ) : (
            <div className="grid gap-4">
              {filteredPosts.map((post: PostWithAsset) => (
                <ClickableCard key={post.slug} href={`/blog/${post.slug}`} className="card p-5 group">
                  <div className="flex items-start gap-3 mb-2">
                    {post.language === "ga" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-tertiary/10 text-tertiary font-medium flex-shrink-0">
                        Gaeilge
                      </span>
                    )}
                    {post.source === "Substack" && post.source_url && (
                      <Link
                        href={post.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-secondary hover:text-primary transition-colors"
                      >
                        <SubstackIcon className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  {post.description && (
                    <p className="text-secondary-500 text-sm mb-3 line-clamp-2">
                      {post.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string) => (
                      <TagLink key={tag} tag={tag} />
                    ))}
                  </div>
                </ClickableCard>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </>
    );
  }

  // Default view: grouped by major tag
  const postsByTag = await getPostsByMajorTag();
  const majorTags: MajorTag[] = ["Thoughts", "Translations", "Tinkering"];

  return (
    <>
      <main className="container mx-auto px-4 mb-16 max-w-3xl">
        <h1 className="text-headline mb-8">All Posts</h1>

        <TagFilter tags={allTags} />

        <div className="space-y-12">
          {majorTags.map((majorTag) => (
            <section key={majorTag}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                {majorTag}
              </h2>
              <div className="grid gap-4">
                {(postsByTag[majorTag] || []).map((post: PostWithAsset) => (
                  <ClickableCard key={post.slug} href={`/blog/${post.slug}`} className="card p-5 group">
                    <div className="flex items-start gap-3 mb-2">
                      {post.language === "ga" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-tertiary/10 text-tertiary font-medium flex-shrink-0">
                          Gaeilge
                        </span>
                      )}
                      {post.source === "Substack" && post.source_url && (
                        <Link
                          href={post.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-secondary hover:text-primary transition-colors"
                        >
                          <SubstackIcon className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h3>
                    {post.description && (
                      <p className="text-secondary-500 text-sm mb-3 line-clamp-2">
                        {post.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string) => (
                        <TagLink key={tag} tag={tag} />
                      ))}
                    </div>
                  </ClickableCard>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
