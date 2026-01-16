import { notFound } from "next/navigation";
import { Metadata } from "next";
import siteMetadata from "@/lib/siteMetaData";

// Define your embeddable assets here
const assets: Record<string, {
  title: string;
  description: string;
  component: React.FC;
}> = {
  "example-table": {
    title: "AI Language Model Comparison",
    description: "Interactive comparison table of major AI language models",
    component: ExampleTable,
  },
};

function ExampleTable() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">AI Language Model Comparison</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Model</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Company</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Context Window</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Best For</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">Claude 3.5 Sonnet</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Anthropic</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">200K tokens</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Coding, Analysis</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">GPT-4o</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">OpenAI</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">128K tokens</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">General Purpose</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">Gemini 2.0</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Google</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">1M tokens</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Long Context</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">Llama 3.1 405B</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Meta</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">128K tokens</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Open Source</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Data as of January 2025. Visit <a href={siteMetadata.siteUrl} className="underline">oisinthomas.com</a> for more.
      </p>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const asset = assets[slug];

  if (!asset) {
    return {};
  }

  const url = `${siteMetadata.siteUrl}/assets/${slug}`;

  const oembedUrl = `${siteMetadata.siteUrl}/api/oembed?url=${encodeURIComponent(url)}`;

  return {
    title: asset.title,
    description: asset.description,
    openGraph: {
      title: asset.title,
      description: asset.description,
      url: url,
      siteName: siteMetadata.title,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: asset.title,
      description: asset.description,
    },
    alternates: {
      types: {
        "application/json+oembed": oembedUrl,
        "text/xml+oembed": `${oembedUrl}&format=xml`,
      },
    },
    other: {
      // Iframely hints
      "iframely:title": asset.title,
      "iframely:description": asset.description,
    },
  };
}

export default async function AssetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const asset = assets[slug];

  if (!asset) {
    return notFound();
  }

  const Component = asset.component;

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Component />
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(assets).map((slug) => ({ slug }));
}
