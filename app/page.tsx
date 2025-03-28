import Link from "next/link";
import { getAllPosts, type PostData } from "@/lib/utils";
import Footer from "@/components/Footer";

export default function Home() {
  const AllBlogs = getAllPosts();

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 mb-16 w-2/3">
        <p className="text-xl mb-8">
          I'm Oisín Thomas!
          <br />
          Co-founder of <Link className="underline"  href="https://www.weeve.ie">Weeve</Link> and AI
          Solutions Architect at{" "}
          <Link className="underline"  href="https://www.examfly.com">Examfly</Link>
          <br />
          Here is a smorgasbord of <Link className="underline"  href="#thoughts">thoughts</Link>,{" "}
          <Link className="underline"  href="#tinkering">tinkerings</Link>, and{" "}
          <Link className="underline"  href="#translations">translations </Link>— or you can check them
          all out <Link className="underline"  href="/all">here</Link> :]
        </p>

        <div className="flex flex-col-reverse gap-8 md:flex-row">
          {newFunction(AllBlogs)}

          <div className="md:w-1/3 md:sticky md:top-4 h-fit">
            <h2 className="mb-4 text-2xl font-bold">
              Recent
              <span className="ml-2 text-base font-normal">
                <Link className="cursor:underline"  href="/all">all</Link>
              </span>
            </h2>

            <div className="gap-4">
              {AllBlogs.slice(0, 6).map((post) => (
                <div className="mb-2 underline" key={post.slug}>
                  <Link className="cursor:underline"  href={`/blog/${post.slug}`}>
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
            className={"cursor-pointer hover:underline"}
            key={`${post.slug}`}

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
            className={"cursor-pointer hover:underline"}
            key={`${post.slug}`}

          >
            <h3 className="text-xl font-semibold mb-2">
              {post.title}{" "}
              {post.language === "ga" ? `[${post.language.toUpperCase()}]` : ""}
            </h3>
          </Link>{" "}
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
            className={"cursor-pointer hover:underline"}
            key={`${post.slug}`}
          >
            <h3 className="text-xl font-semibold mb-2">
              {post.title}{" "}
              {post.language === "ga" ? `[${post.language.toUpperCase()}]` : ""}
            </h3>
          </Link>{" "}
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
