import BlogDetails from "@/components/Blog/BlogDetails";
import RenderMdx from "@/components/Blog/RenderMdx";
import Tag from "@/components/Elements/Tag";
import siteMetadata from "@/utils/siteMetaData";
import { allBlogs } from "@/.contentlayer/generated";
import { slug } from "github-slugger";

export async function generateStaticParams() {
  return allBlogs.map((blog) => ({ slug: blog._raw.flattenedPath }));
}

export async function generateMetadata({ params }) {
  const blog = allBlogs.find((blog) => blog._raw.flattenedPath === params.slug);
  if (!blog) {
    return;
  }

  const publishedAt = new Date(blog.publishedAt).toISOString();
  const modifiedAt = new Date(blog.updatedAt || blog.publishedAt).toISOString();

  let imageList = [siteMetadata.socialBanner];
  if (blog.image) {
    imageList =
      typeof blog.image.filePath === "string"
        ? [siteMetadata.siteUrl + blog.image.filePath.replace("../public", "")]
        : blog.image;
  }
  const ogImages = imageList.map((img) => {
    return { url: img.includes("http") ? img : siteMetadata.siteUrl + img };
  });

  const authors = blog?.author ? [blog.author] : siteMetadata.author;

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      url: siteMetadata.siteUrl + blog.url_path,
      siteName: siteMetadata.title,
      locale: "en_US",
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: ogImages,
    },
  };
}

export default function BlogPage({ params }) {
  const blog = allBlogs.find((blog) => blog._raw.flattenedPath === params.slug);

  let imageList = [siteMetadata.socialBanner];
  if (blog.image) {
    imageList =
      typeof blog.image.filePath === "string"
        ? [siteMetadata.siteUrl + blog.image.filePath.replace("../public", "")]
        : blog.image;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: blog.title,
    description: blog.description,
    image: imageList,
    datePublished: new Date(blog.publishedAt).toISOString(),
    dateModified: new Date(blog.updatedAt || blog.publishedAt).toISOString(),
    author: [
      {
        "@type": "Person",
        name: blog?.author ? [blog.author] : siteMetadata.author,
        url: siteMetadata.twitter,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mb-10">
        <div className="mb-8 text-center relative w-full h-[30vh] bg-dark">
          <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
              {blog.title}
            </h1>
            <div className="w-full z-10 mt-2 flex flex-row items-center justify-center flex-wrap">
              {blog.tags
                .filter((x) => x !== "\r")
                .map((tag) => {
                  return (
                    <Tag
                      name={tag}
                      key={tag}
                      link={`/categories/${slug(tag)}`}
                      className="px-6 text-sm py-2 mx-2 my-1"
                    />
                  );
                })}
            </div>
          </div>
        </div>
        <BlogDetails className="bottom-0" blog={blog} slug={params.slug} />
        <div className="mx-auto mt-2 max-w-[75ch] px-5 leading-relaxed text-lg">
          <RenderMdx blog={blog} />
        </div>
      </article>
    </>
  );
}
