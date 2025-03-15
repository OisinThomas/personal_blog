import Link from "next/link";
import { getAllPosts, type PostData } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  HomeTracking, 
  TrackedExternalLink, 
  TrackedAnchorLink, 
  TrackedInternalLink,
  TrackedBlogPostLink,
  TrackedRecentPostLink
} from "@/components/HomeTracking";

export default function Home() {
  const AllBlogs = getAllPosts();

  return (
    <HomeTracking>
      <div className="min-h-screen">
        <main className="container mx-auto px-4 mb-16 w-2/3">
        <p className="text-xl mb-8">
          I'm Oisín Thomas!
          <br />
          Co-founder of{" "}
          <TrackedExternalLink href="https://www.weeve.ie">
            Weeve
          </TrackedExternalLink>{" "}
          and AI Solutions Architect at{" "}
          <TrackedExternalLink href="https://www.examfly.com">
            Examfly
          </TrackedExternalLink>
          <br />
          Here is a smorgasbord of{" "}
          <TrackedAnchorLink href="#thoughts">
            thoughts
          </TrackedAnchorLink>
          ,{" "}
          <TrackedAnchorLink href="#tinkering">
            tinkerings
          </TrackedAnchorLink>
          , and{" "}
          <TrackedAnchorLink href="#translations">
            translations {" "}
          </TrackedAnchorLink>
          — or you can check them all out <TrackedInternalLink href="/all">here</TrackedInternalLink> :]
        </p>

        <div className="flex flex-col-reverse gap-8 md:flex-row">
          {newFunction(AllBlogs)}

          <div className="md:w-1/3 md:sticky md:top-4 h-fit">
            <h2 className="mb-4 text-2xl font-bold">
              Recent
              <span className="ml-2 text-base font-normal">
                <TrackedInternalLink href="/all">all</TrackedInternalLink> • 
                <TrackedInternalLink href="/rss.xml">rss</TrackedInternalLink>
              </span>
            </h2>

            <div className="gap-4">
              {AllBlogs.slice(0, 6).map((post) => (
                <TrackedRecentPostLink key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </div>
        </main>

        <Footer />
      </div>
    </HomeTracking>
  );
}
function newFunction(AllBlogs: PostData[]) {
  const Tinkerings = AllBlogs.filter((post) => post.majorTag === "Tinkering");
  const Translations = AllBlogs.filter(
    (post) => post.majorTag === "Translations"
  );
  const Thoughts = AllBlogs.filter((post) => post.majorTag === "Thoughts");

  return (
    <div className="md:w-2/3 md:pr-8 mb-8 md:mb-0">
      <h2 id="thoughts" className="mb-4 text-2xl font-bold">
        Thoughts
      </h2>
      {Thoughts.map((post) => (
        <div key={post.slug} className="mb-8">
          <TrackedBlogPostLink post={post} />
          <p>{post.tags.map((tag: string) => `• ${tag}`).join(" ")}</p>
        </div>
      ))}
      <h2 id="translations" className="mb-4 text-2xl font-bold">
        Translations
      </h2>
      {Translations.map((post) => (
        <div key={post.slug} className="mb-8">
          <TrackedBlogPostLink post={post} />
          <p>{post.tags.map((tag: string) => `• ${tag}`).join(" ")}</p>
        </div>
      ))}
      <h2 id="tinkering" className="mb-4 text-2xl font-bold">
        Tinkerings
      </h2>
      {Tinkerings.map((post) => (
        <div key={post.slug} className="mb-8">
          <TrackedBlogPostLink post={post} />
          <p>{post.tags.map((tag: string) => `• ${tag}`).join(" ")}</p>
        </div>
      ))}

      {/**
       * link to all bogs underneath a white line
       */}
      <TrackedInternalLink 
        href="/all"
        className="text-xl text-center mt-12 cursor-pointer hover:underline"
      >
        <h2>All Posts</h2>
      </TrackedInternalLink>
    </div>
  );
}
