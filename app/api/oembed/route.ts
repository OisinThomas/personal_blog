import { NextRequest, NextResponse } from "next/server";
import siteMetadata from "@/lib/siteMetaData";

// Asset definitions (should match the assets page)
const assets: Record<string, { title: string; description: string }> = {
  "example-table": {
    title: "AI Language Model Comparison",
    description: "Interactive comparison table of major AI language models",
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const format = searchParams.get("format") || "json";

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Parse the URL to get the asset slug
  const urlObj = new URL(url);
  const pathMatch = urlObj.pathname.match(/^\/assets\/([^/]+)\/?$/);

  if (!pathMatch) {
    return NextResponse.json({ error: "URL not supported for oEmbed" }, { status: 404 });
  }

  const slug = pathMatch[1];
  const asset = assets[slug];

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const maxWidth = parseInt(searchParams.get("maxwidth") || "800", 10);
  const maxHeight = parseInt(searchParams.get("maxheight") || "600", 10);

  const oembedResponse = {
    version: "1.0",
    type: "rich",
    provider_name: siteMetadata.title,
    provider_url: siteMetadata.siteUrl,
    title: asset.title,
    description: asset.description,
    width: Math.min(maxWidth, 800),
    height: Math.min(maxHeight, 400),
    html: `<iframe src="${siteMetadata.siteUrl}/assets/${slug}" width="${Math.min(maxWidth, 800)}" height="${Math.min(maxHeight, 400)}" frameborder="0" allowfullscreen></iframe>`,
    thumbnail_url: `${siteMetadata.siteUrl}/profile.png`,
    author_name: siteMetadata.author,
    author_url: siteMetadata.siteUrl,
  };

  if (format === "xml") {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<oembed>
  <version>${oembedResponse.version}</version>
  <type>${oembedResponse.type}</type>
  <provider_name>${oembedResponse.provider_name}</provider_name>
  <provider_url>${oembedResponse.provider_url}</provider_url>
  <title>${oembedResponse.title}</title>
  <width>${oembedResponse.width}</width>
  <height>${oembedResponse.height}</height>
  <html><![CDATA[${oembedResponse.html}]]></html>
</oembed>`;
    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  }

  return NextResponse.json(oembedResponse);
}
