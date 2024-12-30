import Link from "next/link";
import { getAllPosts, type PostData } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const AllBlogs = getAllPosts();

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 mb-16 w-2/3">
        <p className="text-xl mb-8">
          I'm Oisín Thomas!
          <br />
          Co-founder of{" "}
          <Link
            href={"https://www.weeve.ie"}
            className="cursor-pointer underline"
          >
            Weeve
          </Link>{" "}
          and AI Solutions Architect at{" "}
          <Link
            href={"https://www.examfly.com"}
            className="cursor-pointer underline"
          >
            Examfly
          </Link>
          <br />
          Here is a smorgasbord of{" "}
          <Link href={"#thoughts"} className="cursor-pointer hover:underline">
            thoughts
          </Link>
          ,{" "}
          <Link href={"#tinkering"} className="cursor-pointer hover:underline">
            tinkerings
          </Link>
          , and{" "}
          <Link
            href={"#translations"}
            className="cursor-pointer hover:underline"
          >
            translations {" "}
          </Link>
          — or you can check them all out <Link href="/all" className="cursor-pointer underline">here</Link> :]
        </p>

        <div className="flex flex-col-reverse gap-8 md:flex-row">
          {newFunction(AllBlogs)}

          <div className="md:w-1/3">
            <h2 className="mb-4 text-2xl font-bold">
              Recent
              <span className="ml-2 text-base font-normal">
                <Link href="/all">all</Link> • <Link href="/rss.xml">rss</Link>
              </span>
            </h2>

            <div className="gap-4">
              {AllBlogs.slice(0, 6).map((post) => (
                <div key={post.slug} className="mb-2 underline">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title.split(":")[0]}{" "}
                    {post.language === "ga"
                      ? `[${post.language.toUpperCase()}]`
                      : ""}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
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
          <Link
            href={`/blog/${post.slug}`}
            className="cursor-pointer hover:underline"
          >
            <h3 className="text-xl font-semibold mb-2">
              {post.title}{" "}
              {post.language === "ga" ? `[${post.language.toUpperCase()}]` : ""}
            </h3>
          </Link>
          <p>{post.tags.map((tag: string) => `• ${tag}`).join(" ")}</p>
        </div>
      ))}
      <h2 id="translations" className="mb-4 text-2xl font-bold">
        Translations
      </h2>
      {Translations.map((post) => (
        <div key={post.slug} className="mb-8">
          <Link
            href={`/blog/${post.slug}`}
            className="cursor-pointer hover:underline"
          >
            <h3 className="text-xl font-semibold mb-2">
              {post.title}{" "}
              {post.language === "ga" ? `[${post.language.toUpperCase()}]` : ""}
            </h3>
          </Link>
          <p>{post.tags.map((tag: string) => `• ${tag}`).join(" ")}</p>
        </div>
      ))}
      <h2 id="tinkering" className="mb-4 text-2xl font-bold">
        Tinkerings
      </h2>
      {Tinkerings.map((post) => (
        <div key={post.slug} className="mb-8">
          <Link
            href={`/blog/${post.slug}`}
            className="cursor-pointer hover:underline"
          >
            <h3 className="text-xl font-semibold mb-2">
              {post.title}{" "}
              {post.language === "ga" ? `[${post.language.toUpperCase()}]` : ""}
            </h3>
          </Link>
          <p>{post.tags.map((tag: string) => `• ${tag}`).join(" ")}</p>
        </div>
      ))}

      {/**
       * link to all bogs underneath a white line
       */}
      <Link
        href="/all"
        className="text-xl text-center mt-12 cursor-pointer hover:underline"
      >
        <h2>All Posts</h2>
      </Link>
    </div>
  );
}
