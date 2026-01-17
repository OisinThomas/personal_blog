import Link from "next/link";
import Footer from "@/components/Footer";
import SubstackIcon from "@/components/icons/SubstackIcon";
import TagLink from "@/components/TagLink";
import ClickableCard from "@/components/ClickableCard";
import { getPublishedPosts, getPostsByMajorTag } from "@/lib/posts/queries";
import type { PostWithAsset } from "@/lib/supabase/types";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const allPosts = await getPublishedPosts();
  const postsByTag = await getPostsByMajorTag();

  return (
    <>
      <main className="container mx-auto px-4 mb-16 max-w-5xl">
        {/* Hero Section */}
        <section className="py-8 mb-12">
          <h1 className="text-headline mb-4">
            I'm <span className="text-primary">Oisín Thomas</span>
          </h1>
          <p className="text-lg text-secondary-600 mb-6 max-w-2xl">
            Head of AI at{" "}
            <Link className="text-primary hover:underline" href="https://www.examfly.com">
              Examfly
            </Link>{" "} and Co-founder at{" "}
            <Link className="text-primary hover:underline" href="https://www.weeve.ie">
              Weeve
            </Link>
          </p>
          <p className="text-secondary-500 mb-6">
            Here is a smorgasbord of{" "}
            <Link className="text-primary hover:underline" href="#thoughts">thoughts</Link>,{" "}
            <Link className="text-primary hover:underline" href="#tinkering">tinkerings</Link>, and{" "}
            <Link className="text-primary hover:underline" href="#translations">translations</Link>—
            or you can check them all out{" "}
            <Link className="text-primary hover:underline" href="/all">here</Link>.
          </p>
          <p className="text-sm text-secondary-400 flex items-center gap-2">
            <SubstackIcon className="w-4 h-4" />
            <span>
              You can also read my{" "}
              <Link className="text-primary hover:underline" href="https://caideiseach.substack.com/">
                Substack
              </Link>
            </span>
          </p>
        </section>

        <div className="flex flex-col-reverse gap-12 lg:flex-row">
          <PostSections postsByTag={postsByTag} />

          {/* Sidebar */}
          <aside className="lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-32">
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                  Recent Posts
                  <Link
                    className="text-sm font-normal text-primary hover:underline"
                    href="/all"
                  >
                    View all
                  </Link>
                </h2>
                <div className="space-y-3">
                  {allPosts.slice(0, 6).map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="block group"
                    >
                      <div className="flex items-start gap-2">
                        {post.language === "ga" && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary font-medium flex-shrink-0">
                            GA
                          </span>
                        )}
                        <span className="text-sm text-secondary-600 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title.split(":")[0]}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
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
        {post.tags.slice(0, 3).map((tag: string) => (
          <TagLink key={tag} tag={tag} />
        ))}
      </div>
    </ClickableCard>
  );
}

function PostSections({ postsByTag }: { postsByTag: Record<string, PostWithAsset[]> }) {
  const sections = [
    { id: "thoughts", title: "Thoughts", posts: postsByTag["Thoughts"] || [] },
    { id: "tinkering", title: "Tinkerings", posts: postsByTag["Tinkering"] || [] },
    { id: "translations", title: "Translations", posts: postsByTag["Translations"] || [] },
  ];

  return (
    <div className="flex-1 space-y-12">
      {sections.map(({ id, title, posts }) => (
        <section key={id}>
          <h2
            id={id}
            className="text-xl font-semibold mb-6 flex items-center gap-3"
          >
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            {title}
          </h2>
          <div className="grid gap-4">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ))}

      <Link
        href="/all"
        className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
      >
        View All Posts
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </Link>
    </div>
  );
}
