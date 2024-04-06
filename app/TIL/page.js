import siteMetadata from "@/utils/siteMetaData";
import TILData from "@/app/TIL/tilData";
export async function generateMetadata({ params }) {
  return {
    title: "TIL",
    description: "Today I learned...",
    openGraph: {
      title: "TIL",
      description: "Today I learned...",
      url: siteMetadata.siteUrl + "/TIL",
      siteName: siteMetadata.title,
      locale: "en_US",
      type: "article",
      authors: [siteMetadata.author],
      images: siteMetadata.siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: "TIL",
      description: "Today I learned...",
      images: siteMetadata.siteUrl,
    },
  };
}

export default function TILPage({ params }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: "TIL",
    description: "Today I learned...",
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: [
      {
        "@type": "Person",
        name: siteMetadata.author,
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
        <div className="mb-8 text-center relative w-full h-fit bg-dark pt-20 pb-20">
          <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="inline-block font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6">
              TIL
            </h1>
          </div>
        </div>
        <div className="mx-auto mt-2 max-w-[100ch] px-5 leading-relaxed text-lg text-left">
          <div className="grid grid-cols-1 gap-4">
            {TILData.length > 1 &&
              TILData.map((til) => (
                <div className="flex flex-row items-center p-2 mb-4 bg-white shadow-md rounded-md hover:bg-gray-100">
                  <div className="flex flex-row p-4">
                    <div className="w-[100px] h-fit rounded-md font-semibold bg-lightblue-100">
                      {til.date}
                    </div>
                    <div
                      className={`w-[200px] h-fit rounded-md font-semibold text-black ml-[5px] mr-[5px] text-center`}
                    >
                      {til.tags.join(", ")}
                    </div>
                  </div>

                  <div
                    className="flex-grow pl-2 text-left overflow-hidden text-xl"
                    style={{
                      hyphens: "auto",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      WebkitHyphens: "auto", // For Safari
                      msHyphens: "auto", // For Internet Explorer
                    }}
                    lang="en" // Specify the language for better hyphenation (if applicable)
                  >
                    {til.til}
                  </div>
                </div>
              ))}
            {TILData.length <= 1 && (
              <div className="text-center text-4xl font-bold">No TILs yet</div>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
