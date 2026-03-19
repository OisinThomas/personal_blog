import Link from "next/link";
import Footer from "@/components/Footer";
import SubstackIcon from "@/components/icons/SubstackIcon";
import TagLink from "@/components/TagLink";
import ClickableCard from "@/components/ClickableCard";
import { getPostsByMajorTag, getAllUniqueTags } from "@/lib/posts/queries";
import type { PostWithAsset, MajorTag } from "@/lib/supabase/types";

export const revalidate = 60; // Revalidate every 60 seconds

function buildFilterUrl(params: { category?: string; lang?: string; tag?: string }) {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.lang) search.set("lang", params.lang);
  if (params.tag) search.set("tag", params.tag);
  const qs = search.toString();
  return qs ? `/all?${qs}` : "/all";
}

export default async function AllPosts({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; category?: string; lang?: string }>;
}) {
  const params = await searchParams;
  const selectedTag = params.tag;
  const selectedCategory = params.category as MajorTag | undefined;
  const selectedLang = params.lang as "en" | "ga" | undefined;

  const postsByTag = await getPostsByMajorTag({ includeTranslations: true });
  const allTags = await getAllUniqueTags();
  const majorTags: MajorTag[] = ["Thoughts", "Tinkering", "Translations"];

  // Filter posts within each category
  const filteredPostsByTag: Record<string, PostWithAsset[]> = {};
  for (const tag of majorTags) {
    let posts = postsByTag[tag] || [];
    if (selectedLang) {
      posts = posts.filter((p) => p.language === selectedLang);
    }
    if (selectedTag) {
      posts = posts.filter((p) => p.tags.includes(selectedTag));
    }
    filteredPostsByTag[tag] = posts;
  }

  const hasActiveFilters = selectedCategory || selectedLang || selectedTag;

  return (
    <>
      <main className="container mx-auto px-4 mb-16 max-w-3xl">
        <h1 className="text-headline mb-8">All Posts</h1>

        {/* Category filter */}
        <div className="mb-3">
          <p className="text-xs text-secondary-400 mb-2 uppercase tracking-wide font-medium">Category</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildFilterUrl({ lang: selectedLang, tag: selectedTag })}
              className={
                !selectedCategory
                  ? "px-3 py-1.5 rounded-full bg-primary text-white font-medium text-sm transition-colors"
                  : "px-3 py-1.5 rounded-full bg-surface-1 text-secondary-500 hover:text-primary hover:bg-surface-2 font-medium text-sm transition-colors"
              }
            >
              All
            </Link>
            {majorTags.map((tag) => {
              const isActive = selectedCategory === tag;
              return (
                <Link
                  key={tag}
                  href={buildFilterUrl({
                    category: isActive ? undefined : tag,
                    lang: selectedLang,
                    tag: selectedTag,
                  })}
                  className={
                    isActive
                      ? "px-3 py-1.5 rounded-full bg-primary text-white font-medium text-sm transition-colors"
                      : "px-3 py-1.5 rounded-full bg-surface-1 text-secondary-500 hover:text-primary hover:bg-surface-2 font-medium text-sm transition-colors"
                  }
                >
                  {tag}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Language filter */}
        <div className="mb-3">
          <p className="text-xs text-secondary-400 mb-2 uppercase tracking-wide font-medium">Language</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildFilterUrl({ category: selectedCategory, tag: selectedTag })}
              className={
                !selectedLang
                  ? "px-3 py-1.5 rounded-full bg-primary text-white font-medium text-sm transition-colors"
                  : "px-3 py-1.5 rounded-full bg-surface-1 text-secondary-500 hover:text-primary hover:bg-surface-2 font-medium text-sm transition-colors"
              }
            >
              All
            </Link>
            {[
              { value: "en" as const, label: "English" },
              { value: "ga" as const, label: "Gaeilge" },
            ].map(({ value, label }) => {
              const isActive = selectedLang === value;
              return (
                <Link
                  key={value}
                  href={buildFilterUrl({
                    category: selectedCategory,
                    lang: isActive ? undefined : value,
                    tag: selectedTag,
                  })}
                  className={
                    isActive
                      ? "px-3 py-1.5 rounded-full bg-primary text-white font-medium text-sm transition-colors"
                      : "px-3 py-1.5 rounded-full bg-surface-1 text-secondary-500 hover:text-primary hover:bg-surface-2 font-medium text-sm transition-colors"
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <p className="text-xs text-secondary-400 mb-2 uppercase tracking-wide font-medium">Tag</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <Link
                    key={tag}
                    href={buildFilterUrl({
                      category: selectedCategory,
                      lang: selectedLang,
                      tag: isActive ? undefined : tag,
                    })}
                    className={
                      isActive
                        ? "text-xs px-2 py-1 rounded-full bg-primary text-white transition-colors"
                        : "text-xs px-2 py-1 rounded-full bg-surface-1 text-secondary-500 hover:text-primary hover:bg-surface-2 transition-colors"
                    }
                  >
                    {tag}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-12">
          {majorTags
            .filter((tag) => !selectedCategory || tag === selectedCategory)
            .map((majorTag) => {
              const posts = filteredPostsByTag[majorTag];
              if (hasActiveFilters && posts.length === 0) return null;
              return (
                <section key={majorTag}>
                  <h2
                    id={majorTag.toLowerCase()}
                    className="text-xl font-semibold mb-6 flex items-center gap-3 scroll-mt-24"
                  >
                    <span className="w-1.5 h-6 bg-primary rounded-full" />
                    {majorTag}
                  </h2>
                  {posts.length === 0 ? (
                    <p className="text-secondary-500 text-sm">No posts found.</p>
                  ) : (
                    <div className="grid gap-4">
                      {posts.map((post: PostWithAsset) => (
                        <PostCard key={post.slug} post={post} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
        </div>
      </main>

      <Footer />
    </>
  );
}

function PostCard({ post }: { post: PostWithAsset }) {
  return (
    <ClickableCard href={`/blog/${post.slug}`} className="card p-5 group">
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
  );
}
